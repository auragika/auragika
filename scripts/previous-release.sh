#!/usr/bin/env bash
# Finds the release that was live before the current one. The Rollback workflow
# (.github/workflows/rollback.yml) runs it, then deploys that tag. Also works by hand:
#
#   NETLIFY_AUTH_TOKEN=… NETLIFY_SITE_ID=… scripts/previous-release.sh
#
# "Before" is Netlify's production deploy history: the Deploy workflow titles each deploy with
# its release, and the newest deploy of a release older than the live one wins. So it is what was
# actually live (most releases never reach production), and running it again after a rollback
# steps further back instead of forward. Without that history (deploys from before releases),
# it falls back to the previous GitHub Release.
#
# Prints the tag, and writes tag=… to $GITHUB_OUTPUT and a line to $GITHUB_STEP_SUMMARY when set.
set -euo pipefail
: "${NETLIFY_AUTH_TOKEN:?missing}" "${NETLIFY_SITE_ID:?missing}"
repo=${GITHUB_REPOSITORY:-auragika/auragika}
TAG_RE='^v[0-9]{4}\.[0-9]{2}\.[0-9]{2}-[0-9]+$'

# v2026.10.24-55 sorts before v2026.10.24-56 and v2026.10.25-1.
older() { [ "$1" != "$2" ] && [ "$(printf '%s\n%s\n' "$1" "$2" | sort -V | head -1)" = "$1" ]; }

current=$("$(dirname "$0")/live-release.sh")
[ -n "$current" ] || { echo "::error::Can't tell which release is live (no release in the page's auragika-build tag); run Deploy with a tag instead"; exit 1; }

previous="" source="Netlify's deploy history"
while read -r t; do
  if [[ $t =~ $TAG_RE ]] && older "$t" "$current"; then previous=$t; break; fi
done < <(curl -fsS -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  "https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID/deploys?per_page=100" |
  jq -r 'map(select(.context == "production" and .state == "ready")) | sort_by(.created_at) | reverse | .[].title // "" | split(" ")[0]')

if [ -z "$previous" ]; then
  source="the GitHub Releases (no earlier release in Netlify's history)"
  while read -r t; do
    if older "$t" "$current"; then previous=$t; break; fi
  done < <(gh release list --repo "$repo" --limit 100 --json tagName --jq '.[].tagName' | grep -E "$TAG_RE" | sort -rV)
fi
[ -n "$previous" ] || { echo "::error::No release older than $current to roll back to"; exit 1; }

echo "Rolling back from $current to $previous (from $source)"
if [ -n "${GITHUB_OUTPUT:-}" ]; then echo "tag=$previous" >> "$GITHUB_OUTPUT"; fi
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  url="${GITHUB_SERVER_URL:-https://github.com}/$repo/releases/tag"
  echo "Rolling back from [$current]($url/$current) to [$previous]($url/$previous), found in $source." >> "$GITHUB_STEP_SUMMARY"
fi
echo "$previous"
