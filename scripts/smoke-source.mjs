import { parseResultsHtml } from "../worker/src/index.js";

const source = process.argv[2] || "https://elections.delaware.gov/reports/PR2024.html";
const response = await fetch(source, { headers: { "user-agent": "Spotlight Delaware results parser smoke test" } });
if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`);
const result = parseResultsHtml(await response.text(), source);
console.log(JSON.stringify({
  source: result.sourceUrl,
  sourceUpdatedAt: result.sourceUpdatedAt,
  reporting: result.reporting,
  contests: result.contests.length,
  candidates: result.contests.reduce((sum, contest) => sum + contest.candidates.length, 0)
}, null, 2));
