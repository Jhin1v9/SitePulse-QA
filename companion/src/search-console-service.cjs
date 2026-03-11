const SEARCH_CONSOLE_API_ROOT = "https://www.googleapis.com/webmasters/v3";

function toFiniteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampInteger(value, min, max, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function normalizeSiteProperty(value, fallbackBaseUrl = "") {
  const raw = String(value || "").trim();
  const fallback = String(fallbackBaseUrl || "").trim();
  const candidate = raw || fallback;
  if (!candidate) return "";
  if (candidate.startsWith("sc-domain:")) {
    return candidate;
  }
  try {
    const parsed = new URL(candidate);
    return `${parsed.origin}/`;
  } catch {
    return "";
  }
}

function buildDateRange(lookbackDays) {
  const days = clampInteger(lookbackDays, 3, 90, 28);
  const end = new Date();
  const start = new Date(end.getTime());
  start.setUTCDate(start.getUTCDate() - days);
  const toDate = (date) => date.toISOString().slice(0, 10);
  return {
    lookbackDays: days,
    startDate: toDate(start),
    endDate: toDate(end),
  };
}

async function googleFetch(url, accessToken, options = {}) {
  if (typeof fetch !== "function") {
    throw new Error("global_fetch_unavailable");
  }
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `google_http_${response.status}`;
    try {
      const payload = await response.json();
      const apiMessage = String(payload?.error?.message || "").trim();
      if (apiMessage) {
        message = apiMessage;
      }
    } catch {
      // keep fallback
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function fetchSearchConsoleSnapshot(input) {
  const property = normalizeSiteProperty(input?.property, input?.baseUrl);
  const accessToken = String(input?.accessToken || "").trim();
  if (!property) {
    throw new Error("search_console_property_required");
  }
  if (!accessToken) {
    throw new Error("search_console_access_token_required");
  }

  const dateRange = buildDateRange(input?.lookbackDays);
  const propertyToken = encodeURIComponent(property);
  const propertyUrl = `${SEARCH_CONSOLE_API_ROOT}/sites/${propertyToken}`;
  await googleFetch(propertyUrl, accessToken);

  const queryUrl = `${SEARCH_CONSOLE_API_ROOT}/sites/${propertyToken}/searchAnalytics/query`;
  const aggregate = await googleFetch(queryUrl, accessToken, {
    method: "POST",
    body: JSON.stringify({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      rowLimit: 1,
      dataState: "final",
    }),
  });

  const topQueryPayload = await googleFetch(queryUrl, accessToken, {
    method: "POST",
    body: JSON.stringify({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      rowLimit: 1,
      dimensions: ["query"],
      dataState: "final",
    }),
  });

  const topPagePayload = await googleFetch(queryUrl, accessToken, {
    method: "POST",
    body: JSON.stringify({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      rowLimit: 1,
      dimensions: ["page"],
      dataState: "final",
    }),
  });

  const aggregateRow = Array.isArray(aggregate?.rows) && aggregate.rows.length ? aggregate.rows[0] : aggregate || {};
  const topQueryRow = Array.isArray(topQueryPayload?.rows) && topQueryPayload.rows.length ? topQueryPayload.rows[0] : null;
  const topPageRow = Array.isArray(topPagePayload?.rows) && topPagePayload.rows.length ? topPagePayload.rows[0] : null;

  return {
    source: "google-search-console",
    property,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    lookbackDays: dateRange.lookbackDays,
    clicks: toFiniteNumber(aggregateRow?.clicks, 0),
    impressions: toFiniteNumber(aggregateRow?.impressions, 0),
    ctr: toFiniteNumber(aggregateRow?.ctr, 0),
    position: toFiniteNumber(aggregateRow?.position, 0),
    topQuery: topQueryRow?.keys?.[0] ? String(topQueryRow.keys[0]) : "",
    topQueryClicks: toFiniteNumber(topQueryRow?.clicks, 0),
    topPage: topPageRow?.keys?.[0] ? String(topPageRow.keys[0]) : "",
    topPageClicks: toFiniteNumber(topPageRow?.clicks, 0),
    syncedAt: new Date().toISOString(),
  };
}

module.exports = {
  buildDateRange,
  fetchSearchConsoleSnapshot,
  normalizeSiteProperty,
};
