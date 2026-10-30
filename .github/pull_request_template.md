## What

<!-- What changed, in a few bullets. -->

## Why

<!-- The problem or goal. Link the board item if there is one. -->

## How tested

- [ ] `hugo --minify --panicOnWarning && node tools/check-build.mjs && node --test tests/browser/` pass locally
- [ ] `run-ci` label added; `ci-passed` is green
- [ ] Visual changes: screenshots checked at phone and desktop width, light and dark

## Risk and rollback

<!-- What could break, and how to undo it (revert, or run Deploy with the previous `build-N` tag). -->
