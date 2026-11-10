#!/usr/bin/env bash
# Prints the release that is live on the site now (e.g. v2026.11.11-31), or nothing when it can't
# tell (a deploy from before releases, or the site is down). The Deploy workflow uses it for the
# summary's "Was live" and to tell an update from a rollback; scripts/previous-release.sh starts
# from it. It reads the page itself: <meta name="auragika-build" content="<release> <commit>">.
#
#   scripts/live-release.sh                 # https://auragika.com
#   SITE_URL=https://… scripts/live-release.sh
set -euo pipefail
url=${SITE_URL:-https://auragika.com}
tag=$(curl -fsS --max-time 20 "$url/" 2>/dev/null |
  grep -oE 'name="?auragika-build"? content="?v[0-9]{4}\.[0-9]{2}\.[0-9]{2}-[0-9]+' |
  grep -oE 'v[0-9]{4}\.[0-9]{2}\.[0-9]{2}-[0-9]+$' || true)
echo "$tag"
