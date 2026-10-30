#!/usr/bin/env bash
# Publishes the built site (public/) to Netlify production with a zip upload to the
# Netlify API. The Deploy workflow (.github/workflows/deploy.yml, run by hand) runs it;
# Netlify itself doesn't build from the repo (netlify.toml `ignore`). public/_headers
# (security and cache headers) is applied by Netlify as usual.
# Needs NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID; optional DEPLOY_TITLE.
set -euo pipefail
: "${NETLIFY_AUTH_TOKEN:?missing}" "${NETLIFY_SITE_ID:?missing}"
API=https://api.netlify.com/api/v1
AUTH="Authorization: Bearer $NETLIFY_AUTH_TOKEN"

for f in index.html 404.html _headers; do
  [ -f "public/$f" ] || { echo 'build public/ first (hugo --minify)'; exit 1; }
done
zip_file=$(mktemp -d)/site.zip
(cd public && zip -qr "$zip_file" .)

title=$(jq -rn --arg t "${DEPLOY_TITLE:-manual deploy}" '$t|@uri')
deploy=$(curl -fsS -X POST -H "$AUTH" -H 'Content-Type: application/zip' \
  --data-binary @"$zip_file" "$API/sites/$NETLIFY_SITE_ID/deploys?title=$title")
id=$(jq -r .id <<<"$deploy")
echo "Deploy $id uploaded, waiting for Netlify to publish it…"

for _ in $(seq 1 60); do
  info=$(curl -fsS -H "$AUTH" "$API/deploys/$id")
  state=$(jq -r .state <<<"$info")
  case "$state" in
    ready)
      live=$(jq -r '.ssl_url // .url' <<<"$info")
      permalink=$(jq -r '.deploy_ssl_url // .deploy_url // empty' <<<"$info")
      echo "Live: $live (deploy $id, permalink $permalink)"
      # Outputs for the Deploy workflow's summary and the GitHub deployment link.
      if [ -n "${GITHUB_OUTPUT:-}" ]; then
        { echo "deploy_id=$id"; echo "live_url=$live"; echo "permalink=$permalink"; } >> "$GITHUB_OUTPUT"
      fi
      exit 0 ;;
    error) echo "Netlify rejected deploy $id: $(jq -r '.error_message // "no message"' <<<"$info")"; exit 1 ;;
  esac
  sleep 5
done
echo "Deploy $id still '$state' after 5 minutes"; exit 1
