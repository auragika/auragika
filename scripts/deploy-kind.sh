#!/usr/bin/env bash
# Says what deploying release $2 over the live release $1 is: update (newer), rollback (older),
# redeploy (the same) or first (nothing known to be live). The Deploy workflow uses it for the
# Netlify deploy title and scripts/deploy-summary.sh for the summary's heading and changes.
#
#   scripts/deploy-kind.sh v2026.10.31-109 v2026.11.10-120   # update
#
# Tags sort as versions: v2026.10.24-55 < v2026.10.24-56 < v2026.10.25-1.
set -euo pipefail
from=${1:-} to=${2:?usage: scripts/deploy-kind.sh <live tag or ""> <tag to deploy>}
if [ -z "$from" ]; then echo first
elif [ "$from" = "$to" ]; then echo redeploy
elif [ "$(printf '%s\n%s\n' "$from" "$to" | sort -V | head -1)" = "$from" ]; then echo update
else echo rollback
fi
