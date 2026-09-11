import test from "node:test";
import assert from "node:assert/strict";
import { parseResultsHtml } from "../worker/src/index.js";

const fixture = `
  <p id="lastUpdated">Data as of 09/15/2026 20:44:52</p>
  <span class="resultsType"><span>UNOFFICIAL RESULTS</span></span>
  <span>120 of 530 Precincts Reporting</span>
  <div class="filtered table-responsive" id="statewide">
    <h2>Statewide</h2>
    <h3 class="contest-title USSenator">U.S. Senator</h3>
    <h4 class="USSenator Democratic">Democratic Party</h4>
    <table><thead><tr><th>Candidate</th><th>Machine Votes</th><th>Absentee Votes</th><th>Early Voting Votes</th><th>Total Votes</th><th>Percentage</th></tr></thead>
    <tbody><tr><td>JANE DOE</td><td>1,000</td><td>200</td><td>300</td><td>1,500</td><td>60 %</td></tr>
    <tr><td>JOHN SMITH</td><td>700</td><td>100</td><td>200</td><td>1,000</td><td>40 %</td></tr></tbody></table>
    <h4 class="USSenator Republican">Republican Party</h4>
    <table><thead><tr><th>Candidate</th><th>Total Votes</th><th>Percentage</th></tr></thead>
    <tbody><tr><td>A &amp; B</td><td>777</td><td>100 %</td></tr></tbody></table>
  </div>
  <div id="byrepdist"></div>`;

test("parses statewide contests, parties, totals and reporting", () => {
  const result = parseResultsHtml(fixture, "https://example.com/results");
  assert.equal(result.sourceUpdatedAt, "09/15/2026 20:44:52");
  assert.equal(result.reporting.reported, 120);
  assert.equal(result.reporting.total, 530);
  assert.equal(result.reporting.percentage, 22.64);
  assert.equal(result.contests.length, 2);
  assert.equal(result.contests[0].title, "U.S. Senator");
  assert.equal(result.contests[0].party, "Democratic");
  assert.equal(result.contests[0].candidates[0].votes, 1500);
  assert.equal(result.contests[1].candidates[0].name, "A & B");
});

test("fails loudly when the statewide markup changes", () => {
  assert.throws(() => parseResultsHtml("<html></html>"), /statewide results section/i);
});
