/**
 * Polymarket API Server
 * 
 * Provides REST API endpoints similar to Polymarket's Gamma API, but with
 * enhanced filtering capabilities - you can filter by ANY field in the database.
 * 
 * Endpoints:
 *   GET /markets - List markets with flexible filtering
 *   GET /events - List events
 *   GET /health - Health check
 * 
 * Query Parameters for /markets and /events:
 *   - Filter by any field: ?fieldName=value
 *   - Multiple values: ?fieldName=value1&fieldName=value2 or ?fieldName=value1,value2
 *   - Range queries: ?fieldName_min=minValue&fieldName_max=maxValue
 *   - Pagination: ?limit=100&offset=0
 *   - Ordering: ?order=createdAt,volumeNum&ascending=false
 * 
 * Examples:
 *   GET /markets?active=true&closed=false
 *   GET /markets?volumeNum_min=1000&volumeNum_max=10000
 *   GET /events?active=true&featured=true&liquidity_min=5000
 *   GET /events?volume_min=1000&volume_max=10000&order=createdAt&ascending=false
 */

import { db as prisma } from "./src/db"
import { Prisma } from "./src/generated/client"
import { getEvents } from "./src/polymarket/client"
import type { PolymarketEvent } from "./src/polymarket/types"

// Parse interval from environment variable (in milliseconds), default to 60000 (1 minute)
const INTERVAL_MS = parseInt(Bun.env.SCRAPE_INTERVAL_MS || "60000", 10)

// Field type mappings for Market model
const MARKET_FIELD_TYPES: Record<string, "string" | "number" | "boolean" | "date" | "json"> = {
	id: "string",
	question: "string",
	conditionId: "string",
	slug: "string",
	twitterCardImage: "string",
	resolutionSource: "string",
	endDate: "date",
	category: "string",
	ammType: "string",
	liquidity: "string",
	sponsorName: "string",
	sponsorImage: "string",
	startDate: "date",
	xAxisValue: "string",
	yAxisValue: "string",
	denominationToken: "string",
	fee: "string",
	image: "string",
	icon: "string",
	lowerBound: "string",
	upperBound: "string",
	description: "string",
	outcomes: "string",
	outcomePrices: "string",
	volume: "string",
	active: "boolean",
	marketType: "string",
	formatType: "string",
	lowerBoundDate: "string",
	upperBoundDate: "string",
	closed: "boolean",
	marketMakerAddress: "string",
	createdBy: "number",
	updatedBy: "number",
	createdAt: "date",
	updatedAt: "date",
	closedTime: "string",
	wideFormat: "boolean",
	new: "boolean",
	mailchimpTag: "string",
	featured: "boolean",
	archived: "boolean",
	resolvedBy: "string",
	restricted: "boolean",
	marketGroup: "number",
	groupItemTitle: "string",
	groupItemThreshold: "string",
	questionID: "string",
	umaEndDate: "string",
	enableOrderBook: "boolean",
	orderPriceMinTickSize: "number",
	orderMinSize: "number",
	umaResolutionStatus: "string",
	curationOrder: "number",
	volumeNum: "number",
	liquidityNum: "number",
	endDateIso: "string",
	startDateIso: "string",
	umaEndDateIso: "string",
	hasReviewedDates: "boolean",
	readyForCron: "boolean",
	commentsEnabled: "boolean",
	volume24hr: "number",
	volume1wk: "number",
	volume1mo: "number",
	volume1yr: "number",
	gameStartTime: "string",
	secondsDelay: "number",
	clobTokenIds: "string",
	disqusThread: "string",
	shortOutcomes: "string",
	teamAID: "string",
	teamBID: "string",
	umaBond: "string",
	umaReward: "string",
	fpmmLive: "boolean",
	volume24hrAmm: "number",
	volume1wkAmm: "number",
	volume1moAmm: "number",
	volume1yrAmm: "number",
	volume24hrClob: "number",
	volume1wkClob: "number",
	volume1moClob: "number",
	volume1yrClob: "number",
	volumeAmm: "number",
	volumeClob: "number",
	liquidityAmm: "number",
	liquidityClob: "number",
	makerBaseFee: "number",
	takerBaseFee: "number",
	customLiveness: "number",
	acceptingOrders: "boolean",
	notificationsEnabled: "boolean",
	score: "number",
	imageOptimized: "json",
	iconOptimized: "json",
	creator: "string",
	ready: "boolean",
	funded: "boolean",
	pastSlugs: "string",
	readyTimestamp: "date",
	fundedTimestamp: "date",
	acceptingOrdersTimestamp: "date",
	competitive: "number",
	rewardsMinSize: "number",
	rewardsMaxSpread: "number",
	spread: "number",
	automaticallyResolved: "boolean",
	oneDayPriceChange: "number",
	oneHourPriceChange: "number",
	oneWeekPriceChange: "number",
	oneMonthPriceChange: "number",
	oneYearPriceChange: "number",
	lastTradePrice: "number",
	bestBid: "number",
	bestAsk: "number",
	automaticallyActive: "boolean",
	clearBookOnStart: "boolean",
	chartColor: "string",
	seriesColor: "string",
	showGmpSeries: "boolean",
	showGmpOutcome: "boolean",
	manualActivation: "boolean",
	negRiskOther: "boolean",
	gameId: "string",
	groupItemRange: "string",
	sportsMarketType: "string",
	line: "number",
	umaResolutionStatuses: "string",
	pendingDeployment: "boolean",
	deploying: "boolean",
	deployingTimestamp: "date",
	scheduledDeploymentTimestamp: "date",
	rfqEnabled: "boolean",
	eventStartTime: "date",
	eventId: "string",
}

// Field type mappings for Event model
const EVENT_FIELD_TYPES: Record<string, "string" | "number" | "boolean" | "date" | "json"> = {
	id: "string",
	ticker: "string",
	slug: "string",
	title: "string",
	subtitle: "string",
	description: "string",
	resolutionSource: "string",
	startDate: "date",
	creationDate: "date",
	endDate: "date",
	image: "string",
	icon: "string",
	active: "boolean",
	closed: "boolean",
	archived: "boolean",
	new: "boolean",
	featured: "boolean",
	restricted: "boolean",
	liquidity: "number",
	volume: "number",
	openInterest: "number",
	sortBy: "string",
	category: "string",
	subcategory: "string",
	isTemplate: "boolean",
	templateVariables: "string",
	publishedAt: "string",
	createdBy: "string",
	updatedBy: "string",
	createdAt: "date",
	updatedAt: "date",
	commentsEnabled: "boolean",
	competitive: "number",
	volume24hr: "number",
	volume1wk: "number",
	volume1mo: "number",
	volume1yr: "number",
	featuredImage: "string",
	disqusThread: "string",
	parentEventId: "string",
	enableOrderBook: "boolean",
	liquidityAmm: "number",
	liquidityClob: "number",
	negRisk: "boolean",
	negRiskMarketID: "string",
	negRiskFeeBips: "number",
	commentCount: "number",
	imageOptimized: "json",
	iconOptimized: "json",
	featuredImageOptimized: "json",
	cyom: "boolean",
	closedTime: "date",
	showAllOutcomes: "boolean",
	showMarketImages: "boolean",
	automaticallyResolved: "boolean",
	enableNegRisk: "boolean",
	automaticallyActive: "boolean",
	eventDate: "string",
	startTime: "date",
	eventWeek: "number",
	seriesSlug: "string",
	score: "string",
	elapsed: "string",
	period: "string",
	live: "boolean",
	ended: "boolean",
	finishedTimestamp: "date",
	gmpChartMode: "string",
	eventCreators: "json",
	tweetCount: "number",
	chats: "json",
	featuredOrder: "number",
	estimateValue: "boolean",
	cantEstimate: "boolean",
	estimatedValue: "string",
	templates: "json",
	spreadsMainLine: "number",
	totalsMainLine: "number",
	carouselMap: "string",
	pendingDeployment: "boolean",
	deploying: "boolean",
	deployingTimestamp: "date",
	scheduledDeploymentTimestamp: "date",
	gameStatus: "string",
}

// Parse query parameter value based on field type
function parseValue(value: string, fieldType: "string" | "number" | "boolean" | "date" | "json"): any {
	if (fieldType === "number") {
		const num = parseFloat(value)
		return isNaN(num) ? undefined : num
	}
	if (fieldType === "boolean") {
		return value === "true" || value === "1"
	}
	if (fieldType === "date") {
		const date = new Date(value)
		return isNaN(date.getTime()) ? undefined : date
	}
	if (fieldType === "json") {
		try {
			return JSON.parse(value)
		} catch {
			return undefined
		}
	}
	return value
}

// Generic function to build Prisma where clause from query parameters
function buildWhereClause<T extends Record<string, any>>(
	params: URLSearchParams,
	fieldTypes: Record<string, "string" | "number" | "boolean" | "date" | "json">
): T {
	const where: any = {}
	const processedKeys = new Set<string>()

	for (const [key, value] of params.entries()) {
		// Skip pagination and ordering params
		if (["limit", "offset", "order", "ascending"].includes(key)) {
			continue
		}

		// Skip if already processed (for array params)
		if (processedKeys.has(key)) {
			continue
		}

		const fieldType = fieldTypes[key]
		if (!fieldType) {
			continue // Skip unknown fields
		}

		// Handle range queries (field_min, field_max)
		if (key.endsWith("_min") || key.endsWith("_max")) {
			const baseField = key.replace(/_min$|_max$/, "")
			const baseFieldType = fieldTypes[baseField]
			if (!baseFieldType) continue

			const parsedValue = parseValue(value, baseFieldType)
			if (parsedValue === undefined) continue

			if (key.endsWith("_min")) {
				where[baseField] = { ...(where[baseField] as any), gte: parsedValue }
			} else {
				where[baseField] = { ...(where[baseField] as any), lte: parsedValue }
			}
			continue
		}

		// Handle array parameters - check for multiple values or comma-separated
		const allValues = params.getAll(key)
		if (allValues.length > 1 || (allValues.length === 1 && value.includes(","))) {
			// Multiple values or comma-separated
			const values: any[] = []
			for (const val of allValues) {
				if (val.includes(",")) {
					// Comma-separated values
					const splitValues = val.split(",").map((v) => parseValue(v.trim(), fieldType)).filter((v) => v !== undefined)
					values.push(...splitValues)
				} else {
					// Single value
					const parsedValue = parseValue(val, fieldType)
					if (parsedValue !== undefined) {
						values.push(parsedValue)
					}
				}
			}
			if (values.length > 0) {
				where[key] = { in: values }
			}
			processedKeys.add(key)
			continue
		}

		// Handle single value
		const parsedValue = parseValue(value, fieldType)
		if (parsedValue !== undefined) {
			where[key] = parsedValue
		}
		processedKeys.add(key)
	}

	return where as T
}

// Generic function to build orderBy clause from query parameters
function buildOrderBy<T extends Record<string, any>>(
	params: URLSearchParams,
	fieldTypes: Record<string, "string" | "number" | "boolean" | "date" | "json">
): T[] | undefined {
	const orderParam = params.get("order")
	if (!orderParam) {
		return undefined
	}

	const ascending = params.get("ascending") !== "false" // default to true
	const fields = orderParam.split(",").map((f) => f.trim())

	return fields.map((field) => {
		if (!fieldTypes[field]) {
			return {}
		}
		return { [field]: ascending ? "asc" : "desc" }
	}).filter((o) => Object.keys(o).length > 0) as T[]
}

// Handle GET /markets
async function handleMarkets(req: Request): Promise<Response> {
	try {
		const url = new URL(req.url)
		const params = url.searchParams

		// Build where clause
		const where = buildWhereClause<Prisma.MarketWhereInput>(params, MARKET_FIELD_TYPES)

		// Pagination
		const limit = Math.min(parseInt(params.get("limit") || "100"), 1000) // Max 1000
		const offset = parseInt(params.get("offset") || "0")

		// Ordering
		const orderBy = buildOrderBy<Prisma.MarketOrderByWithRelationInput>(params, MARKET_FIELD_TYPES)

		// Execute query
		const [markets, total] = await Promise.all([
			prisma.market.findMany({
				where,
				take: limit,
				skip: offset,
				orderBy: orderBy || { createdAt: "desc" },
				include: {
					event: true,
					marketTags: {
						include: {
							tag: true,
						},
					},
					marketCategories: {
						include: {
							category: true,
						},
					},
				},
			}),
			prisma.market.count({ where }),
		])

		return Response.json({
			data: markets,
			pagination: {
				total,
				limit,
				offset,
				hasMore: offset + limit < total,
			},
		})
	} catch (error) {
		console.error("Error fetching markets:", error)
		return Response.json(
			{ error: "Internal server error", message: error instanceof Error ? error.message : String(error) },
			{ status: 500 }
		)
	}
}

// Handle GET /events
async function handleEvents(req: Request): Promise<Response> {
	try {
		const url = new URL(req.url)
		const params = url.searchParams

		// Build where clause with flexible filtering
		const where = buildWhereClause<Prisma.EventWhereInput>(params, EVENT_FIELD_TYPES)

		// Pagination
		const limit = Math.min(parseInt(params.get("limit") || "100"), 1000)
		const offset = parseInt(params.get("offset") || "0")

		// Ordering
		const orderBy = buildOrderBy<Prisma.EventOrderByWithRelationInput>(params, EVENT_FIELD_TYPES)

		const [events, total] = await Promise.all([
			prisma.event.findMany({
				where,
				take: limit,
				skip: offset,
				orderBy: orderBy || { createdAt: "desc" },
				include: {
					markets: true,
					eventTags: {
						include: {
							tag: true,
						},
					},
					eventCategories: {
						include: {
							category: true,
						},
					},
					eventCollections: {
						include: {
							collection: true,
						},
					},
					eventSeries: {
						include: {
							series: true,
						},
					},
				},
			}),
			prisma.event.count({ where }),
		])

		return Response.json({
			data: events,
			pagination: {
				total,
				limit,
				offset,
				hasMore: offset + limit < total,
			},
		})
	} catch (error) {
		console.error("Error fetching events:", error)
		return Response.json(
			{ error: "Internal server error", message: error instanceof Error ? error.message : String(error) },
			{ status: 500 }
		)
	}
}

// Health check endpoint
async function handleHealth(): Promise<Response> {
	return Response.json({ status: "ok", timestamp: new Date().toISOString() })
}

// ============================================================================
// Scraper functionality
// ============================================================================

// Helper function to parse date strings to DateTime or null
function parseDate(dateString: string | null | undefined): Date | null {
	if (!dateString) return null
	const date = new Date(dateString)
	return isNaN(date.getTime()) ? null : date
}

// Transform PolymarketEvent to Prisma Event format
function transformEvent(event: PolymarketEvent) {
	return {
		id: event.id,
		ticker: event.ticker ?? null,
		slug: event.slug ?? null,
		title: event.title ?? null,
		subtitle: event.subtitle ?? null,
		description: event.description ?? null,
		resolutionSource: event.resolutionSource ?? null,
		startDate: parseDate(event.startDate),
		creationDate: parseDate(event.creationDate),
		endDate: parseDate(event.endDate),
		image: event.image ?? null,
		icon: event.icon ?? null,
		active: event.active ?? null,
		closed: event.closed ?? null,
		archived: event.archived ?? null,
		new: event.new ?? null,
		featured: event.featured ?? null,
		restricted: event.restricted ?? null,
		liquidity: event.liquidity ?? null,
		volume: event.volume ?? null,
		openInterest: event.openInterest ?? null,
		sortBy: event.sortBy ?? null,
		category: event.category ?? null,
		subcategory: event.subcategory ?? null,
		isTemplate: event.isTemplate ?? null,
		templateVariables: event.templateVariables ?? null,
		publishedAt: event.published_at ?? null,
		createdBy: event.createdBy ?? null,
		updatedBy: event.updatedBy ?? null,
		createdAt: parseDate(event.createdAt),
		updatedAt: parseDate(event.updatedAt),
		commentsEnabled: event.commentsEnabled ?? null,
		competitive: event.competitive ?? null,
		volume24hr: event.volume24hr ?? null,
		volume1wk: event.volume1wk ?? null,
		volume1mo: event.volume1mo ?? null,
		volume1yr: event.volume1yr ?? null,
		featuredImage: event.featuredImage ?? null,
		disqusThread: event.disqusThread ?? null,
		parentEventId: event.parentEvent ?? null,
		enableOrderBook: event.enableOrderBook ?? null,
		liquidityAmm: event.liquidityAmm ?? null,
		liquidityClob: event.liquidityClob ?? null,
		negRisk: event.negRisk ?? null,
		negRiskMarketID: event.negRiskMarketID ?? null,
		negRiskFeeBips: event.negRiskFeeBips ?? null,
		commentCount: event.commentCount ?? null,
		imageOptimized: event.imageOptimized ? JSON.parse(JSON.stringify(event.imageOptimized)) : null,
		iconOptimized: event.iconOptimized ? JSON.parse(JSON.stringify(event.iconOptimized)) : null,
		featuredImageOptimized: event.featuredImageOptimized
			? JSON.parse(JSON.stringify(event.featuredImageOptimized))
			: null,
		cyom: event.cyom ?? null,
		closedTime: parseDate(event.closedTime),
		showAllOutcomes: event.showAllOutcomes ?? null,
		showMarketImages: event.showMarketImages ?? null,
		automaticallyResolved: event.automaticallyResolved ?? null,
		enableNegRisk: event.enableNegRisk ?? null,
		automaticallyActive: event.automaticallyActive ?? null,
		eventDate: event.eventDate ?? null,
		startTime: parseDate(event.startTime),
		eventWeek: event.eventWeek ?? null,
		seriesSlug: event.seriesSlug ?? null,
		score: event.score ?? null,
		elapsed: event.elapsed ?? null,
		period: event.period ?? null,
		live: event.live ?? null,
		ended: event.ended ?? null,
		finishedTimestamp: parseDate(event.finishedTimestamp),
		gmpChartMode: event.gmpChartMode ?? null,
		eventCreators: event.eventCreators ? JSON.parse(JSON.stringify(event.eventCreators)) : null,
		tweetCount: event.tweetCount ?? null,
		chats: event.chats ? JSON.parse(JSON.stringify(event.chats)) : null,
		featuredOrder: event.featuredOrder ?? null,
		estimateValue: event.estimateValue ?? null,
		cantEstimate: event.cantEstimate ?? null,
		estimatedValue: event.estimatedValue ?? null,
		templates: event.templates ? JSON.parse(JSON.stringify(event.templates)) : null,
		spreadsMainLine: event.spreadsMainLine ?? null,
		totalsMainLine: event.totalsMainLine ?? null,
		carouselMap: event.carouselMap ?? null,
		pendingDeployment: event.pendingDeployment ?? null,
		deploying: event.deploying ?? null,
		deployingTimestamp: parseDate(event.deployingTimestamp),
		scheduledDeploymentTimestamp: parseDate(event.scheduledDeploymentTimestamp),
		gameStatus: event.gameStatus ?? null,
	}
}

// Helper function to process items in parallel with concurrency limit
async function parallelProcess<T, R>(
	items: T[],
	processor: (item: T) => Promise<R>,
	concurrency: number = 10
): Promise<{ success: R[]; errors: Array<{ item: T; error: unknown }> }> {
	const results: R[] = []
	const errors: Array<{ item: T; error: unknown }> = []
	const executing: Promise<void>[] = []

	for (const item of items) {
		const promise = processor(item)
			.then((result) => {
				results.push(result)
			})
			.catch((error) => {
				errors.push({ item, error })
			})
			.finally(() => {
				executing.splice(executing.findIndex((p) => p === promise), 1)
			})
		executing.push(promise)

		if (executing.length >= concurrency) {
			await Promise.race(executing)
		}
	}

	await Promise.all(executing)
	return { success: results, errors }
}

// Upsert events to database - fetches and upserts in batches to avoid memory issues
async function upsertEvents() {
	try {
		console.log(`[${new Date().toISOString()}] Starting event scrape...`)
		const startTime = Date.now()

		const baseQuery = { limit: 200 }
		const limit = 200
		const CONCURRENCY = 10

		let offset = 0
		let hasMore = true
		let batchNumber = 0
		let totalSuccessCount = 0
		let totalErrorCount = 0
		let totalFetched = 0

		while (hasMore) {
			// Create batch of up to 10 page requests
			const batchOffsets: number[] = []
			for (let i = 0; i < CONCURRENCY; i++) {
				batchOffsets.push(offset + i * limit)
			}

			batchNumber++
			const batchStartTime = Date.now()
			console.log(`[Batch ${batchNumber}] Starting parallel fetch of ${batchOffsets.length} pages (offsets: ${batchOffsets[0]}-${batchOffsets[batchOffsets.length - 1]})...`)

			// Fetch batch in parallel (up to 10 concurrent requests)
			const batchResults = await Promise.all(
				batchOffsets.map(async (batchOffset, index) => {
					const fetchStart = Date.now()
					const pageQuery = { ...baseQuery, offset: batchOffset }
					const page = await getEvents(pageQuery, {})
					const fetchDuration = Date.now() - fetchStart
					return { offset: batchOffset, items: page ?? [], duration: fetchDuration }
				})
			)

			const batchDuration = Date.now() - batchStartTime
			const totalItems = batchResults.reduce((sum, r) => sum + r.items.length, 0)
			const avgDuration = batchResults.reduce((sum, r) => sum + r.duration, 0) / batchResults.length
			console.log(`[Batch ${batchNumber}] ✅ Fetched ${totalItems} items in ${batchDuration}ms (parallel efficiency: ${Math.round((avgDuration / batchDuration) * 100)}%)`)

			// Collect all events from this batch
			const batchEvents: PolymarketEvent[] = []
			let foundEnd = false

			for (const { items } of batchResults) {
				if (items.length === 0) {
					foundEnd = true
					break
				}
				batchEvents.push(...items)
				if (items.length < limit) {
					foundEnd = true
					break
				}
			}

			totalFetched += batchEvents.length
			console.log(`[Batch ${batchNumber}] Processing ${batchEvents.length} events (total fetched: ${totalFetched})...`)

			// Upsert this batch immediately (up to 10 at once)
			const upsertStartTime = Date.now()
			const { success, errors } = await parallelProcess(
				batchEvents,
				async (event) => {
					const eventData = transformEvent(event)
					await prisma.event.upsert({
						where: { id: event.id },
						update: eventData,
						create: eventData,
					})
					return event.id
				},
				10
			)

			const upsertDuration = Date.now() - upsertStartTime
			totalSuccessCount += success.length
			totalErrorCount += errors.length

			// Log errors
			for (const { item, error } of errors) {
				console.error(`[${new Date().toISOString()}] Error upserting event ${item.id}:`, error)
			}

			console.log(`[Batch ${batchNumber}] ✅ Upserted ${success.length} events in ${upsertDuration}ms (${totalErrorCount} errors so far)`)

			if (foundEnd) {
				hasMore = false
			} else {
				// Move offset forward for next batch
				offset += batchOffsets.length * limit
			}
		}

		const duration = Date.now() - startTime
		console.log(
			`[${new Date().toISOString()}] Scrape complete: ${totalSuccessCount} succeeded, ${totalErrorCount} failed, ${totalFetched} total fetched (${duration}ms)`
		)
	} catch (error) {
		console.error(`[${new Date().toISOString()}] Fatal error during scrape:`, error)
	}
}

// Scraper interval reference for cleanup
let scraperIntervalId: Timer | null = null

// Start the scraper
function startScraper() {
	console.log(`[${new Date().toISOString()}] Starting Polymarket scraper (interval: ${INTERVAL_MS}ms)`)
	
	// Run immediately on startup
	upsertEvents().catch(console.error)
	
	// Then run on interval
	scraperIntervalId = setInterval(() => {
		upsertEvents().catch(console.error)
	}, INTERVAL_MS)
}

// Graceful shutdown handler
async function shutdown() {
	console.log(`[${new Date().toISOString()}] Shutting down...`)
	
	if (scraperIntervalId) {
		clearInterval(scraperIntervalId)
		scraperIntervalId = null
	}
	
	await prisma.$disconnect()
	process.exit(0)
}

// Setup graceful shutdown handlers
process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)

// Main server
const HOST = Bun.env.HOST || "0.0.0.0"
const PORT = parseInt(Bun.env.PORT || "3000")

Bun.serve({
	hostname: HOST,
	port: PORT,
	async fetch(req) {
		const url = new URL(req.url)
		const path = url.pathname

		// CORS headers
		const headers = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
			"Content-Type": "application/json",
		}

		// Handle OPTIONS for CORS
		if (req.method === "OPTIONS") {
			return new Response(null, { status: 204, headers })
		}

		// Route handling
		if (path === "/markets" && req.method === "GET") {
			const response = await handleMarkets(req)
			return new Response(response.body, { ...response, headers })
		}

		if (path === "/events" && req.method === "GET") {
			const response = await handleEvents(req)
			return new Response(response.body, { ...response, headers })
		}

		if (path === "/health" && req.method === "GET") {
			const response = await handleHealth()
			return new Response(response.body, { ...response, headers })
		}

		return new Response(JSON.stringify({ error: "Not found" }), {
			status: 404,
			headers,
		})
	},
})

// Start the scraper
startScraper()

console.log(`🚀 Server running on http://${HOST}:${PORT}`)
console.log(`📖 Endpoints:`)
console.log(`   GET /markets - List markets with flexible filtering`)
console.log(`   GET /events - List events with flexible filtering`)
console.log(`   GET /health - Health check`)
console.log(`🔄 Scraper running every ${INTERVAL_MS}ms`)
