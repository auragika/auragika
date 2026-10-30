# Contributing

How changes get from a branch to auragika.com. For what the site is and how it's built, see the [README](README.md).

## Branches and titles

- **Branch names:** `feat/…`, `fix/…`, `refactor/…`, `docs/…`, `build/…`, `ci/…` or `chore/…`, plus a short slug, e.g. `feat/travel-journal`.
- **PR titles and commits:** [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary`, with type one of `feat fix refactor perf docs build ci chore revert`, e.g. `feat(apps): add Ripple`.
- **Small and focused:** one logical change per PR. Content-only changes (a new app in `data/apps.yaml`) are fine as tiny PRs.

## Pull requests

Every change to `main` goes through a pull request. The `main protection` ruleset requires:

| Rule | What it means |
|---|---|
| `ci-passed` | Add the **`run-ci`** label to run CI on the PR's current head. The label removes itself, so add it again after new pushes. CI builds with no warnings, runs `tools/check-build.mjs` and the headless Chrome tests |
| `pr-title` | The title follows Conventional Commits |
| Conversations resolved | Reply to every comment, with a fix or a reason |
| Squash merge only | The PR title becomes the commit on `main`; the branch is deleted after merging |

No approval is required while the site has no automated reviewer. Ask the other person to look at anything visual.

Fill in the PR template: what changed, how you tested it, and the risk and rollback.

## Before opening a PR

- Run what CI runs: `hugo --minify --panicOnWarning && node tools/check-build.mjs && node --test "tests/browser/*.test.mjs"` (Node 22+ and Chrome).
- Visual changes:
  - Check at phone width (375 px) and desktop width, in light and dark.
  - Make sure there's no horizontal scroll and no console errors.
  - Follow the theme rules in the README.
- A new third-party host needs a CSP entry in `static/_headers`, and inline scripts aren't allowed.
- Don't edit `assets/css/auragika.css`; site styles go in `assets/css/app.css`.

## Deploying and rolling back

Merging to `main` **doesn't** deploy. To release, run Actions → **Deploy** (with `main`, or any ref with a green `ci-passed`). Each deploy gets a build number, a `build-N` tag and an entry in the repo's Deployments list. To roll back, run Deploy with an older tag such as `build-11`, then revert the PR on GitHub. See the README's Deploy section.
