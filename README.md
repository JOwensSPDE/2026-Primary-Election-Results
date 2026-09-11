# Spotlight Delaware — 2026 Primary Election Results

A responsive election-night results page and Cloudflare Worker for Delaware's Sept. 15, 2026 primary election. The front end is designed for GitHub Pages or another static host and can be embedded in Newspack with an iframe.

## What is included

- Spotlight Delaware styling with Montserrat headlines and Barlow body text.
- The requested race order, including New Castle County Recorder of Deeds last.
- 80 qualified candidates across 33 party-specific contests.
- 78 optimized circular headshots, with initials fallbacks for Dawn Briggs and LaDonna Graham.
- Vote totals, vote-share percentages, a stacked vote-share graphic, and statewide precinct-reporting progress.
- 20-second browser refreshes beginning at 8 p.m. Eastern on election night.
- A Cloudflare Worker parser for Delaware's statewide result tables.
- 15-second edge caching and optional KV storage for the last successful update.
- A clearly labeled design-preview mode using fictional totals.

## Preview locally

From this directory:

```bash
npm test
npm run validate:headshots
npm run preview
```

Open `http://localhost:4173/?demo=1` to see the complete design with fictional data. Open `http://localhost:4173/` to see the pre-election state.

## Deploy the Worker

1. Install the deployment dependency and authenticate:

   ```bash
   npm install
   npx wrangler login
   ```

2. Confirm the live results URL. The project currently expects:

   `https://elections.delaware.gov/reports/PR2026.html`

   If Delaware publishes a different address, change `RESULTS_SOURCE_URL` in `worker/wrangler.toml`. The official 2026 page is not available before election night, so this must be part of the election-night preflight.

3. Recommended: create the last-good-results store:

   ```bash
   npx wrangler kv namespace create RESULTS_CACHE
   ```

   Copy the returned ID into the commented `[[kv_namespaces]]` block in `worker/wrangler.toml`, then uncomment that block. The Worker functions without KV, but KV lets it keep serving the latest successful update if the state website temporarily fails.

4. Deploy:

   ```bash
   npm run worker:deploy
   ```

5. Copy the deployed `workers.dev` URL into `public/config.js`, keeping `/api/results` at the end.

6. Set `ALLOWED_ORIGIN` in `worker/wrangler.toml` to the exact origin hosting the results page. The default allows `https://spotlightdelaware.org`. During GitHub Pages testing, add that origin as a comma-separated second value.

## Deploy the page

Upload the contents of `public/` to the root of a GitHub Pages repository. The WordPress/Newspack page can then use an iframe such as:

```html
<iframe
  id="delaware-primary-results"
  src="https://YOUR-GITHUB-ACCOUNT.github.io/YOUR-REPOSITORY/"
  title="2026 Delaware primary election results"
  loading="eager"
  style="width:100%;min-height:900px;border:0;display:block"
></iframe>
<script>
  window.addEventListener("message", function (event) {
    if (event.origin !== "https://YOUR-GITHUB-ACCOUNT.github.io") return;
    if (event.data && event.data.type === "spotlight-election-results-height") {
      document.getElementById("delaware-primary-results").style.height = event.data.height + "px";
    }
  });
</script>
```

Replace the GitHub account and repository placeholders. The small listener lets the embedded page report its changing height to Newspack, avoiding nested scrollbars on both desktop and mobile. If Newspack removes the script from the Custom HTML block, use the same responsive full-width iframe treatment as the existing Spotlight Delaware district locator and set a fixed height after checking both layouts.

## Add or replace a headshot

Images use normalized candidate filenames in `public/assets/headshots/`. For example:

- `Dawn Briggs` → `dawn-briggs.jpg`
- `LaDonna Graham` → `ladonna-graham.jpg`

Use a square 400×400 JPG. The CSS applies the circular crop. If an official result uses an unexpected spelling, add an uppercase name override in `public/data/headshots.js`.

To rebuild the supplied headshots from the original ZIP:

```bash
./scripts/prepare_headshots.sh "/path/to/Election headshots.zip"
```

## Election-night preflight

- Confirm Delaware's results URL from its official results index.
- Run `npm run smoke:source -- https://elections.delaware.gov/reports/PR2026.html` as soon as the page exists.
- Verify `/api/health` and `/api/results` on the deployed Worker.
- Confirm that all 33 contest cards appear and compare several totals to Delaware's page.
- Test the GitHub Pages URL inside the actual Newspack iframe on desktop and mobile.
- Keep the Delaware source page linked beneath the infographic.
- Do not describe the statewide precinct percentage as “ballots counted.” The state page reports precincts, and absentee/early ballots make those concepts different.

## Data behavior

The Worker extracts the `#statewide` section, reads the update time and statewide precinct count, then converts each party table to JSON. The front end keeps only the requested 2026 contests and displays them in a fixed editorial order. Candidate names in the seed file are used to stabilize capitalization and photo matching.

The HTML parser deliberately returns an error if Delaware removes or renames the statewide section. With KV enabled, the API then serves the last good result and marks it stale instead of silently returning incomplete totals.
