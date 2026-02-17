# Polymarket Scraper API Documentation

This API provides REST endpoints to query Polymarket markets and events data scraped from Polymarket's Gamma API. The API supports flexible filtering, pagination, and sorting capabilities.

## Base URL

```
http://localhost:3000
```

The server runs on the host and port specified by the `HOST` and `PORT` environment variables (default: `0.0.0.0:3000`).

## Endpoints

### GET /health

Health check endpoint to verify the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-17T12:00:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:3000/health
```

---

### GET /markets

Retrieve a list of markets with flexible filtering, pagination, and sorting.

**Query Parameters:**

#### Filtering

You can filter by **any field** in the Market model. The API automatically handles different data types:

- **String fields**: Exact match
- **Number fields**: Exact match or range queries
- **Boolean fields**: `true` or `false` (or `1` for true)
- **Date fields**: ISO 8601 date strings
- **JSON fields**: JSON-encoded values

**Filtering Options:**

1. **Single value**: `?fieldName=value`
2. **Multiple values** (OR condition):
   - `?fieldName=value1&fieldName=value2`
   - `?fieldName=value1,value2`
3. **Range queries** (for numeric/date fields):
   - `?fieldName_min=minValue&fieldName_max=maxValue`

#### Pagination

- `limit` (default: `100`, max: `1000`): Number of results per page
- `offset` (default: `0`): Number of results to skip

#### Ordering

- `order`: Comma-separated list of field names to sort by
- `ascending` (default: `true`): Set to `false` for descending order

**Response:**

```json
{
  "data": [
    {
      "id": "string",
      "question": "string",
      "conditionId": "string",
      "slug": "string",
      "active": true,
      "closed": false,
      "volumeNum": 12345.67,
      "liquidityNum": 8901.23,
      "createdAt": "2026-02-17T12:00:00.000Z",
      "event": { ... },
      "marketTags": [
        {
          "tag": { ... }
        }
      ],
      "marketCategories": [
        {
          "category": { ... }
        }
      ],
      // ... all other market fields
    }
  ],
  "pagination": {
    "total": 1000,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

**Examples:**

```bash
# Get active markets
curl "http://localhost:3000/markets?active=true&closed=false"

# Get markets with volume between 1000 and 10000
curl "http://localhost:3000/markets?volumeNum_min=1000&volumeNum_max=10000"

# Get markets by category
curl "http://localhost:3000/markets?category=politics"

# Get multiple categories (OR condition)
curl "http://localhost:3000/markets?category=politics&category=sports"
# or
curl "http://localhost:3000/markets?category=politics,sports"

# Get markets sorted by volume (descending)
curl "http://localhost:3000/markets?order=volumeNum&ascending=false"

# Get markets sorted by multiple fields
curl "http://localhost:3000/markets?order=createdAt,volumeNum&ascending=false"

# Paginated request
curl "http://localhost:3000/markets?limit=50&offset=100"

# Complex query: active, featured markets with high liquidity
curl "http://localhost:3000/markets?active=true&featured=true&liquidityNum_min=5000&order=volumeNum&ascending=false&limit=20"
```

**Available Market Fields:**

The following fields can be used for filtering and sorting:

- `id`, `question`, `conditionId`, `slug`, `twitterCardImage`, `resolutionSource`
- `endDate`, `category`, `ammType`, `liquidity`, `sponsorName`, `sponsorImage`
- `startDate`, `xAxisValue`, `yAxisValue`, `denominationToken`, `fee`
- `image`, `icon`, `lowerBound`, `upperBound`, `description`, `outcomes`
- `outcomePrices`, `volume`, `active`, `marketType`, `formatType`
- `lowerBoundDate`, `upperBoundDate`, `closed`, `marketMakerAddress`
- `createdBy`, `updatedBy`, `createdAt`, `updatedAt`, `closedTime`
- `wideFormat`, `new`, `mailchimpTag`, `featured`, `archived`
- `resolvedBy`, `restricted`, `marketGroup`, `groupItemTitle`
- `groupItemThreshold`, `questionID`, `umaEndDate`, `enableOrderBook`
- `orderPriceMinTickSize`, `orderMinSize`, `umaResolutionStatus`
- `curationOrder`, `volumeNum`, `liquidityNum`, `endDateIso`
- `startDateIso`, `umaEndDateIso`, `hasReviewedDates`, `readyForCron`
- `commentsEnabled`, `volume24hr`, `volume1wk`, `volume1mo`, `volume1yr`
- `gameStartTime`, `secondsDelay`, `clobTokenIds`, `disqusThread`
- `shortOutcomes`, `teamAID`, `teamBID`, `umaBond`, `umaReward`
- `fpmmLive`, `volume24hrAmm`, `volume1wkAmm`, `volume1moAmm`, `volume1yrAmm`
- `volume24hrClob`, `volume1wkClob`, `volume1moClob`, `volume1yrClob`
- `volumeAmm`, `volumeClob`, `liquidityAmm`, `liquidityClob`
- `makerBaseFee`, `takerBaseFee`, `customLiveness`, `acceptingOrders`
- `notificationsEnabled`, `score`, `imageOptimized`, `iconOptimized`
- `creator`, `ready`, `funded`, `pastSlugs`, `readyTimestamp`
- `fundedTimestamp`, `acceptingOrdersTimestamp`, `competitive`
- `rewardsMinSize`, `rewardsMaxSpread`, `spread`, `automaticallyResolved`
- `oneDayPriceChange`, `oneHourPriceChange`, `oneWeekPriceChange`
- `oneMonthPriceChange`, `oneYearPriceChange`, `lastTradePrice`
- `bestBid`, `bestAsk`, `automaticallyActive`, `clearBookOnStart`
- `chartColor`, `seriesColor`, `showGmpSeries`, `showGmpOutcome`
- `manualActivation`, `negRiskOther`, `gameId`, `groupItemRange`
- `sportsMarketType`, `line`, `umaResolutionStatuses`, `pendingDeployment`
- `deploying`, `deployingTimestamp`, `scheduledDeploymentTimestamp`
- `rfqEnabled`, `eventStartTime`, `eventId`

**Included Relations:**

Each market response includes:
- `event`: The associated event (if any)
- `marketTags`: Array of tags associated with the market
- `marketCategories`: Array of categories associated with the market

---

### GET /events

Retrieve a list of events with flexible filtering, pagination, and sorting.

**Query Parameters:**

Same filtering, pagination, and ordering options as `/markets` endpoint.

**Response:**

```json
{
  "data": [
    {
      "id": "string",
      "ticker": "string",
      "slug": "string",
      "title": "string",
      "subtitle": "string",
      "description": "string",
      "active": true,
      "closed": false,
      "featured": false,
      "liquidity": 12345.67,
      "volume": 8901.23,
      "createdAt": "2026-02-17T12:00:00.000Z",
      "markets": [ ... ],
      "eventTags": [
        {
          "tag": { ... }
        }
      ],
      "eventCategories": [
        {
          "category": { ... }
        }
      ],
      "eventCollections": [
        {
          "collection": { ... }
        }
      ],
      "eventSeries": [
        {
          "series": { ... }
        }
      ],
      // ... all other event fields
    }
  ],
  "pagination": {
    "total": 500,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

**Examples:**

```bash
# Get active events
curl "http://localhost:3000/events?active=true&closed=false"

# Get featured events with high liquidity
curl "http://localhost:3000/events?active=true&featured=true&liquidity_min=5000"

# Get events by volume range
curl "http://localhost:3000/events?volume_min=1000&volume_max=10000"

# Get events sorted by creation date (newest first)
curl "http://localhost:3000/events?order=createdAt&ascending=false"

# Get events by category
curl "http://localhost:3000/events?category=politics"

# Complex query: active, featured events sorted by volume
curl "http://localhost:3000/events?active=true&featured=true&order=volume&ascending=false&limit=20"
```

**Available Event Fields:**

The following fields can be used for filtering and sorting:

- `id`, `ticker`, `slug`, `title`, `subtitle`, `description`
- `resolutionSource`, `startDate`, `creationDate`, `endDate`
- `image`, `icon`, `active`, `closed`, `archived`, `new`
- `featured`, `restricted`, `liquidity`, `volume`, `openInterest`
- `sortBy`, `category`, `subcategory`, `isTemplate`, `templateVariables`
- `publishedAt`, `createdBy`, `updatedBy`, `createdAt`, `updatedAt`
- `commentsEnabled`, `competitive`, `volume24hr`, `volume1wk`
- `volume1mo`, `volume1yr`, `featuredImage`, `disqusThread`
- `parentEventId`, `enableOrderBook`, `liquidityAmm`, `liquidityClob`
- `negRisk`, `negRiskMarketID`, `negRiskFeeBips`, `commentCount`
- `imageOptimized`, `iconOptimized`, `featuredImageOptimized`, `cyom`
- `closedTime`, `showAllOutcomes`, `showMarketImages`
- `automaticallyResolved`, `enableNegRisk`, `automaticallyActive`
- `eventDate`, `startTime`, `eventWeek`, `seriesSlug`, `score`
- `elapsed`, `period`, `live`, `ended`, `finishedTimestamp`
- `gmpChartMode`, `eventCreators`, `tweetCount`, `chats`
- `featuredOrder`, `estimateValue`, `cantEstimate`, `estimatedValue`
- `templates`, `spreadsMainLine`, `totalsMainLine`, `carouselMap`
- `pendingDeployment`, `deploying`, `deployingTimestamp`
- `scheduledDeploymentTimestamp`, `gameStatus`

**Included Relations:**

Each event response includes:
- `markets`: Array of markets associated with the event
- `eventTags`: Array of tags associated with the event
- `eventCategories`: Array of categories associated with the event
- `eventCollections`: Array of collections associated with the event
- `eventSeries`: Array of series associated with the event

---

## Error Responses

All endpoints return standard HTTP status codes:

- `200 OK`: Successful request
- `404 Not Found`: Endpoint not found
- `500 Internal Server Error`: Server error

Error response format:

```json
{
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

---

## CORS

The API includes CORS headers allowing requests from any origin:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

---

## Data Types

### Field Type Handling

The API automatically parses query parameters based on field types:

- **String**: Passed as-is
- **Number**: Parsed as float (supports decimals)
- **Boolean**: `true`, `false`, or `1` (for true)
- **Date**: ISO 8601 format (e.g., `2026-02-17T12:00:00.000Z`)
- **JSON**: JSON-encoded string (e.g., `{"key":"value"}`)

### Range Queries

For numeric and date fields, use `_min` and `_max` suffixes:

- `?volumeNum_min=1000` - Volume >= 1000
- `?volumeNum_max=10000` - Volume <= 10000
- `?volumeNum_min=1000&volumeNum_max=10000` - Volume between 1000 and 10000
- `?createdAt_min=2026-01-01T00:00:00Z` - Created after January 1, 2026

---

## Best Practices

1. **Use pagination** for large result sets to avoid timeouts
2. **Combine filters** to narrow down results efficiently
3. **Use range queries** for numeric/date fields instead of exact matches when appropriate
4. **Limit result size** using the `limit` parameter (default: 100, max: 1000)
5. **Sort results** using the `order` parameter for consistent ordering

---

## Rate Limiting

Currently, there are no rate limits enforced. However, please use the API responsibly and consider implementing client-side rate limiting for production use.

---

## Notes

- The API scrapes data from Polymarket's Gamma API at regular intervals (configurable via `SCRAPE_INTERVAL_MS` environment variable, default: 60 seconds)
- Data is stored in a PostgreSQL database and queried via Prisma ORM
- All timestamps are returned in ISO 8601 format
- Unknown filter fields are silently ignored
- Invalid values for typed fields are ignored (e.g., non-numeric values for number fields)
