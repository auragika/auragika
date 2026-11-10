#!/usr/bin/env bash
# Prints the Markdown summary of a production deploy: what went live, where, and what changed
# since the release that was live before it. The Deploy workflow (.github/workflows/deploy.yml)
# appends it to the run's summary page; it also works by hand once gh is signed in:
#
#   TAG=v2026.11.10-120 FROM=v2026.10.31-109 scripts/deploy-summary.sh
#
# Needs TAG (the release just deployed). Optional: FROM (the release live before it, from
# scripts/live-release.sh; empty when unknown), LIVE_URL, PERMALINK and DEPLOY_ID (from scripts/deploy-netlify.sh),
# STARTED (epoch seconds when the deploy began), and GitHub's GITHUB_* variables.
# "What's new" is the commits between the two tags: one per merged PR, as main is squash-only.
set -euo pipefail
: "${TAG:?missing}"
repo=${GITHUB_REPOSITORY:-auragika/auragika}
server=${GITHUB_SERVER_URL:-https://github.com}
rel="$server/$repo/releases/tag"
FROM=${FROM:-}

kind=$("$(dirname "$0")/deploy-kind.sh" "$FROM" "$TAG")
# On an error gh prints the error JSON to stdout, so keep output only when the call succeeds.
sha=$(gh api "repos/$repo/commits/$TAG" --jq .sha 2>/dev/null) || sha=""

# Subjects of the commits in $2 but not in $1, as a Markdown list.
changes() {
  local subjects
  subjects=$(gh api "repos/$repo/compare/$1...$2" --jq '.commits[].commit.message | split("\n")[0]' 2>/dev/null) || return 0
  sed -E "s|\(#([0-9]+)\)$|([#\1]($server/$repo/pull/\1))|; s|^|- |" <<<"$subjects"
}

case $kind in
  update) heading="Deployed [$TAG]($rel/$TAG)" ;;
  rollback) heading="Rolled back to [$TAG]($rel/$TAG)" ;;
  redeploy) heading="Redeployed [$TAG]($rel/$TAG)" ;;
  *) heading="Deployed [$TAG]($rel/$TAG)" ;;
esac

echo "## $heading"
echo
echo '| | |'
echo '|---|---|'
echo "| Release | [$TAG]($rel/$TAG) |"
[ -z "$sha" ] || echo "| Commit | [\`${sha:0:7}\`]($server/$repo/commit/$sha) |"
[ -z "$FROM" ] || echo "| Was live | [$FROM]($rel/$FROM) |"
echo "| By | ${GITHUB_ACTOR:-$(whoami)} |"
[ -z "${STARTED:-}" ] || echo "| Took | $((($(date +%s) - STARTED) / 60)) min $((($(date +%s) - STARTED) % 60)) s |"
[ -z "${LIVE_URL:-}" ] || echo "| Live | $LIVE_URL |"
[ -z "${PERMALINK:-}" ] || echo "| This deploy | $PERMALINK (Netlify deploy \`${DEPLOY_ID:-}\`) |"
echo

case $kind in
  update)
    echo "### What's new since $FROM"
    echo
    changes "$FROM" "$TAG" || true
    echo
    echo "To undo: Actions → **Rollback** (goes back to $FROM)."
    ;;
  rollback)
    echo "### No longer live (in $FROM, not in $TAG)"
    echo
    changes "$TAG" "$FROM" || true
    echo
    echo "To go forward again: Actions → **Deploy** with tag \`$FROM\`, or empty for the latest release."
    ;;
  redeploy) echo "$TAG was already live; nothing changed." ;;
  *) echo "The release live before this one is unknown, so there's no list of changes." ;;
esac
