#!/usr/bin/env bash
# Prints the Markdown summary of a production deploy: what went live, where, and what changed
# since the release that was live before it. The Deploy workflow (.github/workflows/deploy.yml)
# appends it to the run's summary page, also when the deploy failed. It also works by hand once
# gh is signed in:
#
#   TAG=v2026.11.10-120 FROM=v2026.10.31-109 scripts/deploy-summary.sh
#
# Needs TAG (the release deployed). Optional: FROM (the release live before it; empty when
# unknown), OUTCOME (the job status: success, failure or cancelled; empty means success), LIVE_URL,
# PERMALINK and DEPLOY_ID (from scripts/deploy-netlify.sh), STARTED (epoch seconds when the
# deploy began), and GitHub's GITHUB_* variables.
# The lists are the commits between the two tags: one per merged PR, as main is squash-only.
set -euo pipefail
: "${TAG:?missing}"
repo=${GITHUB_REPOSITORY:-auragika/auragika}
server=${GITHUB_SERVER_URL:-https://github.com}
rel="$server/$repo/releases/tag"
FROM=${FROM:-}

kind=$("$(dirname "$0")/deploy-kind.sh" "$FROM" "$TAG")

# On an error gh prints the error JSON to stdout, so keep output only when the call succeeds.
commit=$(gh api "repos/$repo/commits/$TAG" --jq '.sha + " " + (.commit.message | split("\n")[0])' 2>/dev/null) || commit=""
sha=${commit%% *} subject=${commit#* }

# Markdown-links "(#12)" at the end of a commit subject to the PR.
link_pr() { sed -E "s|\(#([0-9]+)\)$|([#\1]($server/$repo/pull/\1))|"; }

# The commits in $2 but not in $1, oldest first: "- subject ([#12](…)) (`abc1234`)".
changes() {
  local lines
  lines=$(gh api "repos/$repo/compare/$1...$2" --jq '.commits[] | .sha[0:7] + " " + (.commit.message | split("\n")[0])' 2>/dev/null) || return 0
  while read -r short msg; do
    # shellcheck disable=SC2016 # the backticks are Markdown, not a command
    [ -n "$short" ] && printf -- '- %s (`%s`)\n' "$(link_pr <<<"$msg")" "$short"
  done <<<"$lines"
}

# Anything but success (failure or cancelled) must never be reported as live.
outcome=${OUTCOME:-success}
if [ "$outcome" = cancelled ]; then
  heading="⚠️ Deploy of [$TAG]($rel/$TAG) did not complete (cancelled)"
elif [ "$outcome" != success ]; then
  heading="❌ Deploy of [$TAG]($rel/$TAG) failed"
else
  case $kind in
    rollback) heading="⏪ Rolled back to [$TAG]($rel/$TAG)" ;;
    redeploy) heading="🔁 Redeployed [$TAG]($rel/$TAG)" ;;
    *) heading="🚀 Deployed [$TAG]($rel/$TAG)" ;;
  esac
fi

secs=$(( $(date +%s) - ${STARTED:-$(date +%s)} ))
echo "## $heading"
echo
echo '| | |'
echo '|---|---|'
echo "| **Release** | [$TAG]($rel/$TAG) |"
[ -z "$sha" ] || echo "| **Commit** | [\`${sha:0:7}\`]($server/$repo/commit/$sha) $(link_pr <<<"$subject") |"
if [ -n "$FROM" ]; then echo "| **Was live** | [$FROM]($rel/$FROM) |"; else echo "| **Was live** | unknown |"; fi
echo "| **Deployed by** | @${GITHUB_ACTOR:-$(whoami)} |"
[ -z "${STARTED:-}" ] || echo "| **Took** | $((secs / 60))m $((secs % 60))s |"
[ -z "${LIVE_URL:-}" ] || echo "| **Live** | $LIVE_URL |"
[ -z "${PERMALINK:-}" ] || echo "| **This deploy** | $PERMALINK |"
[ -z "${DEPLOY_ID:-}" ] || echo "| **Netlify deploy** | \`$DEPLOY_ID\` |"
echo

# A run that stopped after uploading can still go live (Netlify publishes the upload on its own),
# so read what the site serves now instead of assuming the old release is still there.
if [ "$outcome" != success ]; then
  now=$("$(dirname "$0")/live-release.sh" 2>/dev/null) || now=""
  if [ -n "$now" ] && [ "$now" = "$TAG" ]; then
    echo "The run stopped, but the site already serves $TAG, so it **is live**. Check it; to undo, Actions → **Rollback**."
  elif [ -n "$now" ]; then
    echo "Nothing new went live: the site still serves $now. Netlify may finish publishing an upload that got through, so check again in a minute, then run **Deploy** again."
  else
    echo "This deploy didn't finish, and the live release couldn't be read; ${FROM:-the previous release} should still be live. Check the site, then run **Deploy** again."
  fi
  exit 0
fi

case $kind in
  update)
    echo "### What's new since $FROM"
    echo
    changes "$FROM" "$TAG" || true
    echo
    echo "**To undo:** Actions → **Rollback** (goes back to $FROM)."
    ;;
  rollback)
    echo "### No longer live (in $FROM, not in $TAG)"
    echo
    changes "$TAG" "$FROM" || true
    echo
    echo "**To go forward again:** Actions → **Deploy** with tag \`$FROM\`, or empty for the latest release."
    ;;
  redeploy) echo "$TAG was already live; nothing changed." ;;
  *)
    echo "The release live before this one is unknown, so there's no list of changes."
    echo
    echo "**To undo:** Actions → **Deploy** with an earlier release's tag."
    ;;
esac
