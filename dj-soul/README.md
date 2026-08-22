# DJ Soul live catalog

Canonical project context: `PROJECT_CONTEXT.md`

Generated catalog: `catalog-dj-soul.json`

Permanent raw catalog URL after the first successful workflow run:

`https://raw.githubusercontent.com/VNB1987/Soul-Music-/main/dj-soul/catalog-dj-soul.json`

## Automatic refresh
GitHub Actions workflow: `.github/workflows/update-dj-catalog.yml`

The workflow runs every 15 minutes and can also be started manually.

Required repository secret:
- Name: `YOUTUBE_API_KEY`
- Value: a valid YouTube Data API v3 key

Once the secret exists and the workflow succeeds, the permanent raw URL above always serves the latest committed catalog.

DJ Soul should re-read `PROJECT_CONTEXT.md` and `catalog-dj-soul.json` before a LIVE or whenever current catalog/project context is required.
