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
| Netlify deploy preview | The `netlify/auragika/deploy-preview` status must pass, i.e. the site builds. Open the preview and look at your change |
| Up to date with `main` | Merge `main` into the branch ("Update branch" on GitHub) before merging |
| Conversations resolved | Reply to every comment, with a fix or a reason |
| Squash merge only | The PR title becomes the commit on `main`; the branch is deleted after merging |

No approval is required while the site has no automated reviewer. Ask the other person to look at anything visual.

Fill in the PR template: what changed, how you tested it, and the risk and rollback.

## Before opening a PR

- `hugo --minify` builds with **no warnings**.
- Visual changes:
  - Check at phone width (375 px) and desktop width, in light and dark.
  - Make sure there's no horizontal scroll and no console errors.
  - Follow the theme rules in the README.
- A new third-party host needs a CSP entry in `netlify.toml`, and inline scripts aren't allowed.
- Don't edit `assets/css/auragika.css`; site styles go in `assets/css/app.css`.

## Deploying and rolling back

Merging to `main` deploys automatically. To roll back, use Netlify → Deploys → pick an earlier deploy → **Publish deploy**, then revert the PR on GitHub.
