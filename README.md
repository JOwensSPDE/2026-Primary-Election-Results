# Spotlight Delaware — 2026 Primary Election Results

A responsive election-night results page and Cloudflare Worker for Delaware's Sept. 15, 2026 primary election. The front end is designed for GitHub Pages or another static host and can be embedded in Newspack with an iframe.

## What is included

- Official Spotlight Delaware logo and brand styling with Montserrat headlines and Barlow body text.
- The requested race order, including New Castle County Recorder of Deeds last.
- 80 qualified candidates across 33 party-specific contests.
- 80 optimized circular headshots, covering every candidate currently included.
- Vote totals, vote-share percentages, party-coded stacked vote-share graphics (blue for Democratic races and red for Republican races), and statewide precinct-reporting progress.
- Tighter, face-centered framing across all 80 candidate portraits without altering candidate appearance.
- Paired desktop rows for the Democratic and Republican U.S. Senate contests and for Attorney General and State Treasurer; the cards stack in the same order on mobile.
- 20-second browser refreshes beginning at 8 p.m. Eastern on election night, served entirely from Cloudflare KV.
- A Cloudflare Worker parser for Delaware's official statewide results data feed.
- A scheduled source refresh once per minute from 7:45 p.m. through 8 a.m. Eastern, so reader traffic never multiplies requests to Delaware.
- Permanent KV storage for the last successful result and automatic retry delays after source errors or rate limiting.
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

2. Confirm the live results page URL. The project now uses:

   `https://elections.delaware.gov/results/enr/PR2026.html?group=Statewide&filter=`

   The Worker derives Delaware's official `Election_StatewideResults_ID_PR2026.json` data feed from this public page URL. If Delaware changes the page address, update `RESULTS_SOURCE_URL` in `worker/wrangler.toml`.

3. Confirm the `RESULTS_CACHE` binding in `worker/wrangler.toml`. This Spotlight Delaware package is already configured with namespace ID `510fd34e357b4298ab22ba6d17c688cb`. If deploying from a different Cloudflare account, create a replacement namespace:

   ```bash
   npx wrangler kv namespace create RESULTS_CACHE
   ```

   Copy the returned ID into the `[[kv_namespaces]]` block. KV is required because public reader requests use the stored copy rather than fetching Delaware's website directly.

4. Deploy:

   ```bash
   npm run worker:deploy
   ```

   Deployment should list the KV binding and two scheduled triggers. The triggers cover 7:45 p.m. Sept. 15 through 8 a.m. Sept. 16 Eastern; their cron expressions are written in UTC.

5. Confirm the deployed `workers.dev` URL in `public/config.js`, keeping `/api/results` at the end. The supplied file is already configured for `delaware-primary-results-2026.spotlightdelaware.workers.dev`.

6. Set `ALLOWED_ORIGIN` in `worker/wrangler.toml` to the exact origins hosting the results page. The supplied configuration allows both `https://spotlightdelaware.org` and `https://jowensspde.github.io`.

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
    var frame = document.getElementById("delaware-primary-results");
    if (event.source !== frame.contentWindow) return;

    if (event.data && event.data.type === "spotlight-election-results-height") {
      frame.style.height = event.data.height + "px";
    }

    if (event.data && event.data.type === "spotlight-election-results-scroll") {
      var frameTop = frame.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: frameTop + Number(event.data.top || 0),
        behavior: "smooth"
      });
    }
  });
</script>
```

Replace the GitHub account and repository placeholders. The listener lets the embedded page report its changing height to Newspack and lets the race-navigation links scroll the parent page to the selected section. If Newspack removes the script from the Custom HTML block, use the same responsive full-width iframe treatment as the existing Spotlight Delaware district locator and set a fixed height after checking both layouts; parent-page anchor scrolling requires the script.

## Add or replace a headshot

Images use normalized candidate filenames in `public/assets/headshots/`. For example:

- `Dawn Briggs` → `dawn-briggs.jpg`
- `LaDonna Graham` → `ladonna-graham.jpg`

Use a square 400×400 JPG. The CSS applies the circular crop. If an official result uses an unexpected spelling, add an uppercase name override in `public/data/headshots.js`.

To rebuild the main supplied headshot batch from the original ZIP:

```bash
./scripts/prepare_headshots.sh "/path/to/Election headshots.zip"
```

The Dawn Briggs and LaDonna Graham files were supplied separately and are already included in the deployment package.

## Election-night preflight

- Confirm Delaware's results URL from its official results index.
- Run `npm run smoke:source -- "https://elections.delaware.gov/results/enr/PR2026.html?group=Statewide&filter="` before deployment.
- Verify `/api/health` and `/api/results` on the deployed Worker.
- Before 7:45 p.m., `/api/health` can correctly report `cacheReady: false`; the first successful scheduled refresh changes it to `true`.
- Keep `npx wrangler tail --config worker/wrangler.toml` open to monitor scheduled refreshes and source errors.
- Confirm that all 33 contest cards appear and compare several totals to Delaware's page.
- Test the GitHub Pages URL inside the actual Newspack iframe on desktop and mobile.
- Keep the Delaware source page linked beneath the infographic.
- Do not describe the statewide precinct percentage as “ballots counted.” The state page reports precincts, and absentee/early ballots make those concepts different.

## Data behavior

Once per minute during the configured election-night window, the Worker fetches Delaware's official statewide JSON feed, reads the update time and statewide election-district count, and stores normalized results in KV. Public `/api/results` requests read only from KV, so any number of readers still produces no additional traffic to Delaware. The front end keeps only the requested 2026 contests and displays them in a fixed editorial order. Candidate names in the seed file are used to stabilize capitalization and photo matching.

The parser deliberately returns an error if Delaware's feed is empty, invalid, or no longer contains recognizable candidate records. A failed scheduled refresh never overwrites the last good result. During the active refresh window, the API marks the saved result stale after three minutes without a successful source check and displays a warning instead of silently returning incomplete totals.
