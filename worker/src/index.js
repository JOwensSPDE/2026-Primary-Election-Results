const DEFAULT_SOURCE = "https://elections.delaware.gov/reports/PR2026.html";
const CACHE_KEY = "delaware-primary-results-2026:last-good";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff",
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = allowedOrigin(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== "GET") {
      return apiResponse({ error: "Method not allowed" }, 405, origin);
    }

    if (url.pathname === "/api/health") {
      return apiResponse({ ok: true, service: "Delaware Primary Results 2026" }, 200, origin);
    }

    if (url.pathname !== "/api/results") {
      return apiResponse({ error: "Not found" }, 404, origin);
    }

    try {
      const result = await getResults(request, env, ctx);
      return apiResponse(result.body, 200, origin, {
        "x-results-cache": result.cache,
        "cache-control": "public, max-age=5, s-maxage=15, stale-while-revalidate=120",
      });
    } catch (error) {
      const stale = await readLastGood(env);
      if (stale) {
        return apiResponse({ ...stale, stale: true, warning: "Showing the last successful update." }, 200, origin, {
          "x-results-cache": "stale-kv",
          "cache-control": "no-store",
        });
      }

      return apiResponse({
        error: "Results are temporarily unavailable.",
        detail: safeError(error),
        sourceUrl: env.RESULTS_SOURCE_URL || DEFAULT_SOURCE,
      }, 503, origin, { "cache-control": "no-store" });
    }
  },
};

async function getResults(request, env, ctx) {
  const sourceUrl = env.RESULTS_SOURCE_URL || DEFAULT_SOURCE;
  const ttl = clampNumber(env.CACHE_SECONDS, 15, 5, 60);
  const cache = caches.default;
  const cacheUrl = new URL(request.url);
  cacheUrl.pathname = "/internal/results-cache";
  cacheUrl.search = `source=${encodeURIComponent(sourceUrl)}`;
  const cacheRequest = new Request(cacheUrl, { method: "GET" });
  const hit = await cache.match(cacheRequest);

  if (hit) return { body: await hit.json(), cache: "hit" };

  const upstream = await fetch(sourceUrl, {
    headers: {
      "accept": "text/html,application/xhtml+xml",
      "user-agent": "Spotlight Delaware election-results monitor/1.0 (+https://spotlightdelaware.org)",
    },
    cf: { cacheTtl: 0, cacheEverything: false },
  });

  if (!upstream.ok) throw new Error(`Delaware results page returned HTTP ${upstream.status}`);
  const html = await upstream.text();
  const parsed = parseResultsHtml(html, sourceUrl);
  const body = { ...parsed, fetchedAt: new Date().toISOString(), stale: false };

  const cached = new Response(JSON.stringify(body), {
    headers: { ...jsonHeaders, "cache-control": `public, s-maxage=${ttl}` },
  });
  ctx.waitUntil(cache.put(cacheRequest, cached));
  ctx.waitUntil(writeLastGood(env, body));
  return { body, cache: "miss" };
}

export function parseResultsHtml(html, sourceUrl = DEFAULT_SOURCE) {
  if (!html || typeof html !== "string") throw new Error("The source page was empty.");

  const statewideStart = html.search(/<div\b[^>]*\bid=["']statewide["'][^>]*>/i);
  if (statewideStart < 0) throw new Error("Could not find the statewide results section.");

  const afterStart = html.slice(statewideStart);
  const nextSection = afterStart.slice(1).search(/<div\b[^>]*\bid=["'](?:byrepdist|byelectiondist|bycounty|bycountyw)["'][^>]*>/i);
  const statewide = nextSection >= 0 ? afterStart.slice(0, nextSection + 1) : afterStart;
  const updated = firstText(html, /<[^>]*\bid=["']lastUpdated["'][^>]*>([\s\S]*?)<\/[^>]+>/i)
    .replace(/^Data as of\s*/i, "");
  const status = firstText(html, /<[^>]*\bclass=["'][^"']*resultsType[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i) || "UNOFFICIAL RESULTS";
  const precinctMatch = stripTags(html).match(/([\d,]+)\s+of\s+([\d,]+)\s+Precincts?\s+Reporting/i);
  const contests = [];

  const headingPattern = /<h3\b[^>]*\bclass=["'][^"']*contest-title[^"']*["'][^>]*>([\s\S]*?)<\/h3>/gi;
  const headings = [...statewide.matchAll(headingPattern)];

  for (let index = 0; index < headings.length; index += 1) {
    const match = headings[index];
    const title = cleanText(match[1]);
    const bodyStart = match.index + match[0].length;
    const bodyEnd = index + 1 < headings.length ? headings[index + 1].index : statewide.length;
    const block = statewide.slice(bodyStart, bodyEnd);
    const partyPattern = /<h4\b[^>]*>([\s\S]*?)<\/h4>\s*(<table\b[\s\S]*?<\/table>)/gi;

    for (const partyMatch of block.matchAll(partyPattern)) {
      const partyLabel = cleanText(partyMatch[1]);
      const party = partyLabel.replace(/\s+Party$/i, "").trim();
      const table = parseTable(partyMatch[2]);
      if (!table.rows.length) continue;
      contests.push({
        id: slug(`${title}-${party}`),
        title,
        party,
        candidates: table.rows.map(row => ({
          name: row.Candidate || row.candidate || "Unknown candidate",
          votes: parseInteger(row["Total Votes"] ?? row.Votes ?? 0),
          percentage: parseFloatSafe(row.Percentage),
          machineVotes: parseInteger(row["Machine Votes"] ?? 0),
          absenteeVotes: parseInteger(row["Absentee Votes"] ?? 0),
          earlyVotes: parseInteger(row["Early Voting Votes"] ?? 0),
        })),
      });
    }
  }

  if (!contests.length) throw new Error("No statewide contest tables were found.");

  const reporting = precinctMatch ? {
    reported: parseInteger(precinctMatch[1]),
    total: parseInteger(precinctMatch[2]),
    percentage: percent(parseInteger(precinctMatch[1]), parseInteger(precinctMatch[2])),
    label: "Precincts reporting statewide",
  } : null;

  return {
    election: "2026 Delaware Primary Election",
    electionDate: "2026-09-15",
    status,
    sourceUpdatedAt: updated || null,
    sourceUrl,
    reporting,
    contests,
  };
}

function parseTable(tableHtml) {
  const headers = [...tableHtml.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)].map(match => cleanText(match[1]));
  const body = firstRaw(tableHtml, /<tbody\b[^>]*>([\s\S]*?)<\/tbody>/i) || tableHtml;
  const rows = [];
  for (const rowMatch of body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...rowMatch[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(match => cleanText(match[1]));
    if (!cells.length) continue;
    const row = {};
    cells.forEach((cell, index) => { row[headers[index] || `column${index + 1}`] = cell; });
    rows.push(row);
  }
  return { headers, rows };
}

function firstText(input, pattern) {
  return cleanText(firstRaw(input, pattern));
}

function firstRaw(input, pattern) {
  const match = input.match(pattern);
  return match ? match[1] : "";
}

function cleanText(input = "") {
  return decodeEntities(stripTags(input)).replace(/\s+/g, " ").trim();
}

function stripTags(input = "") {
  return input.replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function decodeEntities(input) {
  const named = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
  return input.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity) => {
    if (entity[0] === "#") {
      const hex = entity[1]?.toLowerCase() === "x";
      const value = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(value) ? String.fromCodePoint(value) : "";
    }
    return named[entity.toLowerCase()] ?? `&${entity};`;
  });
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseInteger(value) {
  const number = Number.parseInt(String(value).replace(/[^0-9-]/g, ""), 10);
  return Number.isFinite(number) ? number : 0;
}

function parseFloatSafe(value) {
  const number = Number.parseFloat(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function percent(part, total) {
  return total ? Number(((part / total) * 100).toFixed(2)) : 0;
}

function clampNumber(value, fallback, min, max) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function allowedOrigin(request, env) {
  const allowed = env.ALLOWED_ORIGIN || "*";
  const origin = request.headers.get("origin");
  if (allowed === "*") return "*";
  const choices = allowed.split(",").map(value => value.trim());
  return origin && choices.includes(origin) ? origin : choices[0];
}

function corsHeaders(origin) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    "vary": "Origin",
  };
}

function apiResponse(body, status, origin, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...jsonHeaders, ...corsHeaders(origin), ...extra },
  });
}

async function writeLastGood(env, body) {
  if (!env.RESULTS_CACHE?.put) return;
  await env.RESULTS_CACHE.put(CACHE_KEY, JSON.stringify(body), { expirationTtl: 172800 });
}

async function readLastGood(env) {
  if (!env.RESULTS_CACHE?.get) return null;
  return env.RESULTS_CACHE.get(CACHE_KEY, "json");
}

function safeError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/https?:\/\/\S+/g, "upstream page").slice(0, 240);
}
