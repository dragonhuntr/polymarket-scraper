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
 * 
 * Scraper:
 *   The scraper automatically fetches events from Polymarket's Gamma API at regular
 *   intervals. It only scrapes events that have not ended yet (filters out events
 *   where ended === true and closed === true).
 */

import { db as prisma } from "./src/db"
import { Prisma } from "./src/generated/client"
import { getEvents } from "./src/polymarket/client"
import type { PolymarketEvent, PolymarketMarket } from "./src/polymarket/types"

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

// Transform PolymarketMarket to Prisma Market format
function transformMarket(market: PolymarketMarket, eventId: string) {
	return {
		id: market.id,
		question: market.question ?? null,
		conditionId: market.conditionId,
		slug: market.slug ?? null,
		twitterCardImage: market.twitterCardImage ?? null,
		resolutionSource: market.resolutionSource ?? null,
		endDate: parseDate(market.endDate),
		category: market.category ?? null,
		ammType: market.ammType ?? null,
		liquidity: market.liquidity ?? null,
		sponsorName: market.sponsorName ?? null,
		sponsorImage: market.sponsorImage ?? null,
		startDate: parseDate(market.startDate),
		xAxisValue: market.xAxisValue ?? null,
		yAxisValue: market.yAxisValue ?? null,
		denominationToken: market.denominationToken ?? null,
		fee: market.fee ?? null,
		image: market.image ?? null,
		icon: market.icon ?? null,
		lowerBound: market.lowerBound ?? null,
		upperBound: market.upperBound ?? null,
		description: market.description ?? null,
		outcomes: market.outcomes ?? null,
		outcomePrices: market.outcomePrices ?? null,
		volume: market.volume ?? null,
		active: market.active ?? null,
		marketType: market.marketType ?? null,
		formatType: market.formatType ?? null,
		lowerBoundDate: market.lowerBoundDate ?? null,
		upperBoundDate: market.upperBoundDate ?? null,
		closed: market.closed ?? null,
		marketMakerAddress: market.marketMakerAddress,
		createdBy: market.createdBy ?? null,
		updatedBy: market.updatedBy ?? null,
		createdAt: parseDate(market.createdAt),
		updatedAt: parseDate(market.updatedAt),
		closedTime: market.closedTime ?? null,
		wideFormat: market.wideFormat ?? null,
		new: market.new ?? null,
		mailchimpTag: market.mailchimpTag ?? null,
		featured: market.featured ?? null,
		archived: market.archived ?? null,
		resolvedBy: market.resolvedBy ?? null,
		restricted: market.restricted ?? null,
		marketGroup: market.marketGroup ?? null,
		groupItemTitle: market.groupItemTitle ?? null,
		groupItemThreshold: market.groupItemThreshold ?? null,
		questionID: market.questionID ?? null,
		umaEndDate: market.umaEndDate ?? null,
		enableOrderBook: market.enableOrderBook ?? null,
		orderPriceMinTickSize: market.orderPriceMinTickSize ?? null,
		orderMinSize: market.orderMinSize ?? null,
		umaResolutionStatus: market.umaResolutionStatus ?? null,
		curationOrder: market.curationOrder ?? null,
		volumeNum: market.volumeNum ?? null,
		liquidityNum: market.liquidityNum ?? null,
		endDateIso: market.endDateIso ?? null,
		startDateIso: market.startDateIso ?? null,
		umaEndDateIso: market.umaEndDateIso ?? null,
		hasReviewedDates: market.hasReviewedDates ?? null,
		readyForCron: market.readyForCron ?? null,
		commentsEnabled: market.commentsEnabled ?? null,
		volume24hr: market.volume24hr ?? null,
		volume1wk: market.volume1wk ?? null,
		volume1mo: market.volume1mo ?? null,
		volume1yr: market.volume1yr ?? null,
		gameStartTime: market.gameStartTime ?? null,
		secondsDelay: market.secondsDelay ?? null,
		clobTokenIds: market.clobTokenIds ?? null,
		disqusThread: market.disqusThread ?? null,
		shortOutcomes: market.shortOutcomes ?? null,
		teamAID: market.teamAID ?? null,
		teamBID: market.teamBID ?? null,
		umaBond: market.umaBond ?? null,
		umaReward: market.umaReward ?? null,
		fpmmLive: market.fpmmLive ?? null,
		volume24hrAmm: market.volume24hrAmm ?? null,
		volume1wkAmm: market.volume1wkAmm ?? null,
		volume1moAmm: market.volume1moAmm ?? null,
		volume1yrAmm: market.volume1yrAmm ?? null,
		volume24hrClob: market.volume24hrClob ?? null,
		volume1wkClob: market.volume1wkClob ?? null,
		volume1moClob: market.volume1moClob ?? null,
		volume1yrClob: market.volume1yrClob ?? null,
		volumeAmm: market.volumeAmm ?? null,
		volumeClob: market.volumeClob ?? null,
		liquidityAmm: market.liquidityAmm ?? null,
		liquidityClob: market.liquidityClob ?? null,
		makerBaseFee: market.makerBaseFee ?? null,
		takerBaseFee: market.takerBaseFee ?? null,
		customLiveness: market.customLiveness ?? null,
		acceptingOrders: market.acceptingOrders ?? null,
		notificationsEnabled: market.notificationsEnabled ?? null,
		score: market.score ?? null,
		imageOptimized: market.imageOptimized ? JSON.parse(JSON.stringify(market.imageOptimized)) : null,
		iconOptimized: market.iconOptimized ? JSON.parse(JSON.stringify(market.iconOptimized)) : null,
		creator: market.creator ?? null,
		ready: market.ready ?? null,
		funded: market.funded ?? null,
		pastSlugs: market.pastSlugs ?? null,
		readyTimestamp: parseDate(market.readyTimestamp),
		fundedTimestamp: parseDate(market.fundedTimestamp),
		acceptingOrdersTimestamp: parseDate(market.acceptingOrdersTimestamp),
		competitive: market.competitive ?? null,
		rewardsMinSize: market.rewardsMinSize ?? null,
		rewardsMaxSpread: market.rewardsMaxSpread ?? null,
		spread: market.spread ?? null,
		automaticallyResolved: market.automaticallyResolved ?? null,
		oneDayPriceChange: market.oneDayPriceChange ?? null,
		oneHourPriceChange: market.oneHourPriceChange ?? null,
		oneWeekPriceChange: market.oneWeekPriceChange ?? null,
		oneMonthPriceChange: market.oneMonthPriceChange ?? null,
		oneYearPriceChange: market.oneYearPriceChange ?? null,
		lastTradePrice: market.lastTradePrice ?? null,
		bestBid: market.bestBid ?? null,
		bestAsk: market.bestAsk ?? null,
		automaticallyActive: market.automaticallyActive ?? null,
		clearBookOnStart: market.clearBookOnStart ?? null,
		chartColor: market.chartColor ?? null,
		seriesColor: market.seriesColor ?? null,
		showGmpSeries: market.showGmpSeries ?? null,
		showGmpOutcome: market.showGmpOutcome ?? null,
		manualActivation: market.manualActivation ?? null,
		negRiskOther: market.negRiskOther ?? null,
		gameId: market.gameId ?? null,
		groupItemRange: market.groupItemRange ?? null,
		sportsMarketType: market.sportsMarketType ?? null,
		line: market.line ?? null,
		umaResolutionStatuses: market.umaResolutionStatuses ?? null,
		pendingDeployment: market.pendingDeployment ?? null,
		deploying: market.deploying ?? null,
		deployingTimestamp: parseDate(market.deployingTimestamp),
		scheduledDeploymentTimestamp: parseDate(market.scheduledDeploymentTimestamp),
		rfqEnabled: market.rfqEnabled ?? null,
		eventStartTime: parseDate(market.eventStartTime),
		eventId,
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

// Bulk upsert events using raw SQL INSERT ... ON CONFLICT for performance
// Batches of 500 rows (~83 columns each = ~41,500 params, under PostgreSQL's 65,535 limit)
async function bulkUpsertEvents(events: PolymarketEvent[]): Promise<{ successCount: number; errorCount: number }> {
	const BATCH_SIZE = 500

	const columns = [
		'id', 'ticker', 'slug', 'title', 'subtitle', 'description',
		'resolutionSource', 'startDate', 'creationDate', 'endDate',
		'image', 'icon', 'active', 'closed', 'archived', 'new',
		'featured', 'restricted', 'liquidity', 'volume', 'openInterest',
		'sortBy', 'category', 'subcategory', 'isTemplate', 'templateVariables',
		'publishedAt', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt',
		'commentsEnabled', 'competitive', 'volume24hr', 'volume1wk', 'volume1mo',
		'volume1yr', 'featuredImage', 'disqusThread', 'parentEventId',
		'enableOrderBook', 'liquidityAmm', 'liquidityClob', 'negRisk',
		'negRiskMarketID', 'negRiskFeeBips', 'commentCount', 'imageOptimized',
		'iconOptimized', 'featuredImageOptimized', 'cyom', 'closedTime',
		'showAllOutcomes', 'showMarketImages', 'automaticallyResolved',
		'enableNegRisk', 'automaticallyActive', 'eventDate', 'startTime',
		'eventWeek', 'seriesSlug', 'score', 'elapsed', 'period', 'live',
		'ended', 'finishedTimestamp', 'gmpChartMode', 'eventCreators',
		'tweetCount', 'chats', 'featuredOrder', 'estimateValue', 'cantEstimate',
		'estimatedValue', 'templates', 'spreadsMainLine', 'totalsMainLine',
		'carouselMap', 'pendingDeployment', 'deploying', 'deployingTimestamp',
		'scheduledDeploymentTimestamp', 'gameStatus',
	]

	const jsonColumns = new Set([
		'imageOptimized', 'iconOptimized', 'featuredImageOptimized',
		'eventCreators', 'chats', 'templates',
	])

	const quotedColumns = columns.map(c => `"${c}"`).join(', ')
	const updateSet = columns
		.filter(c => c !== 'id')
		.map(c => `"${c}" = EXCLUDED."${c}"`)
		.join(', ')

	let successCount = 0
	let errorCount = 0

	// Deduplicate by id (last occurrence wins) to avoid
	// "ON CONFLICT DO UPDATE command cannot affect row a second time"
	const deduped = [...new Map(events.map(e => [e.id, e])).values()]

	for (let i = 0; i < deduped.length; i += BATCH_SIZE) {
		const batch = deduped.slice(i, i + BATCH_SIZE)
		const values: unknown[] = []
		const rowPlaceholders: string[] = []

		for (const event of batch) {
			const data = transformEvent(event)
			const paramPlaceholders: string[] = []

			for (const col of columns) {
				let val: unknown = (data as Record<string, unknown>)[col] ?? null

				if (jsonColumns.has(col) && val !== null) {
					val = JSON.stringify(val)
				} else if (val instanceof Date) {
					val = val.toISOString()
				}

				values.push(val)
				const idx = values.length

				if (jsonColumns.has(col)) {
					paramPlaceholders.push(`$${idx}::jsonb`)
				} else {
					paramPlaceholders.push(`$${idx}`)
				}
			}

			rowPlaceholders.push(`(${paramPlaceholders.join(', ')})`)
		}

		const sql = `INSERT INTO "events" (${quotedColumns}) VALUES ${rowPlaceholders.join(', ')} ON CONFLICT ("id") DO UPDATE SET ${updateSet}`

		try {
			await prisma.$executeRawUnsafe(sql, ...values)
			successCount += batch.length
		} catch (error) {
			console.error(`[${new Date().toISOString()}] Bulk upsert error for batch at index ${i}:`, error)
			errorCount += batch.length
		}
	}

	return { successCount, errorCount }
}

// Bulk upsert markets using raw SQL INSERT ... ON CONFLICT for performance
async function bulkUpsertMarkets(markets: Array<{ market: PolymarketMarket; eventId: string }>): Promise<{ successCount: number; errorCount: number }> {
	const BATCH_SIZE = 400

	const columns = [
		'id', 'question', 'conditionId', 'slug', 'twitterCardImage',
		'resolutionSource', 'endDate', 'category', 'ammType', 'liquidity',
		'sponsorName', 'sponsorImage', 'startDate', 'xAxisValue', 'yAxisValue',
		'denominationToken', 'fee', 'image', 'icon', 'lowerBound',
		'upperBound', 'description', 'outcomes', 'outcomePrices', 'volume',
		'active', 'marketType', 'formatType', 'lowerBoundDate', 'upperBoundDate',
		'closed', 'marketMakerAddress', 'createdBy', 'updatedBy', 'createdAt',
		'updatedAt', 'closedTime', 'wideFormat', 'new', 'mailchimpTag',
		'featured', 'archived', 'resolvedBy', 'restricted', 'marketGroup',
		'groupItemTitle', 'groupItemThreshold', 'questionID', 'umaEndDate',
		'enableOrderBook', 'orderPriceMinTickSize', 'orderMinSize',
		'umaResolutionStatus', 'curationOrder', 'volumeNum', 'liquidityNum',
		'endDateIso', 'startDateIso', 'umaEndDateIso', 'hasReviewedDates',
		'readyForCron', 'commentsEnabled', 'volume24hr', 'volume1wk',
		'volume1mo', 'volume1yr', 'gameStartTime', 'secondsDelay',
		'clobTokenIds', 'disqusThread', 'shortOutcomes', 'teamAID', 'teamBID',
		'umaBond', 'umaReward', 'fpmmLive', 'volume24hrAmm', 'volume1wkAmm',
		'volume1moAmm', 'volume1yrAmm', 'volume24hrClob', 'volume1wkClob',
		'volume1moClob', 'volume1yrClob', 'volumeAmm', 'volumeClob',
		'liquidityAmm', 'liquidityClob', 'makerBaseFee', 'takerBaseFee',
		'customLiveness', 'acceptingOrders', 'notificationsEnabled', 'score',
		'imageOptimized', 'iconOptimized', 'creator', 'ready', 'funded',
		'pastSlugs', 'readyTimestamp', 'fundedTimestamp',
		'acceptingOrdersTimestamp', 'competitive', 'rewardsMinSize',
		'rewardsMaxSpread', 'spread', 'automaticallyResolved',
		'oneDayPriceChange', 'oneHourPriceChange', 'oneWeekPriceChange',
		'oneMonthPriceChange', 'oneYearPriceChange', 'lastTradePrice',
		'bestBid', 'bestAsk', 'automaticallyActive', 'clearBookOnStart',
		'chartColor', 'seriesColor', 'showGmpSeries', 'showGmpOutcome',
		'manualActivation', 'negRiskOther', 'gameId', 'groupItemRange',
		'sportsMarketType', 'line', 'umaResolutionStatuses',
		'pendingDeployment', 'deploying', 'deployingTimestamp',
		'scheduledDeploymentTimestamp', 'rfqEnabled', 'eventStartTime',
		'eventId',
	]

	const jsonColumns = new Set(['imageOptimized', 'iconOptimized'])

	const quotedColumns = columns.map(c => `"${c}"`).join(', ')
	const updateSet = columns
		.filter(c => c !== 'id')
		.map(c => `"${c}" = EXCLUDED."${c}"`)
		.join(', ')

	let successCount = 0
	let errorCount = 0

	// Deduplicate by id (last occurrence wins)
	const deduped = [...new Map(markets.map(m => [m.market.id, m])).values()]

	for (let i = 0; i < deduped.length; i += BATCH_SIZE) {
		const batch = deduped.slice(i, i + BATCH_SIZE)
		const values: unknown[] = []
		const rowPlaceholders: string[] = []

		for (const { market, eventId } of batch) {
			const data = transformMarket(market, eventId)
			const paramPlaceholders: string[] = []

			for (const col of columns) {
				let val: unknown = (data as Record<string, unknown>)[col] ?? null

				if (jsonColumns.has(col) && val !== null) {
					val = JSON.stringify(val)
				} else if (val instanceof Date) {
					val = val.toISOString()
				}

				values.push(val)
				const idx = values.length

				if (jsonColumns.has(col)) {
					paramPlaceholders.push(`$${idx}::jsonb`)
				} else {
					paramPlaceholders.push(`$${idx}`)
				}
			}

			rowPlaceholders.push(`(${paramPlaceholders.join(', ')})`)
		}

		const sql = `INSERT INTO "markets" (${quotedColumns}) VALUES ${rowPlaceholders.join(', ')} ON CONFLICT ("id") DO UPDATE SET ${updateSet}`

		try {
			await prisma.$executeRawUnsafe(sql, ...values)
			successCount += batch.length
		} catch (error) {
			console.error(`[${new Date().toISOString()}] Bulk market upsert error for batch at index ${i}:`, error)
			errorCount += batch.length
		}
	}

	return { successCount, errorCount }
}

// Upsert events to database - fetches and upserts in batches to avoid memory issues
async function upsertEvents() {
	try {
		console.log(`[${new Date().toISOString()}] Starting event scrape (only non-ended events)...`)
		const startTime = Date.now()

		// Filter for non-closed events at API level, and filter out ended events after fetching
		const baseQuery = { limit: 200, closed: false }
		const limit = 200
		const CONCURRENCY = 10

		let offset = 0
		let hasMore = true
		let batchNumber = 0
		let totalSuccessCount = 0
		let totalErrorCount = 0
		let totalFetched = 0
		let totalFiltered = 0

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

			// Collect all events from this batch and filter out ended events
			const batchEvents: PolymarketEvent[] = []
			let foundEnd = false

			for (const { items } of batchResults) {
				if (items.length === 0) {
					foundEnd = true
					break
				}
				
				// Filter out ended events
				const nonEndedEvents = items.filter(event => event.ended !== true)
				const filteredCount = items.length - nonEndedEvents.length
				if (filteredCount > 0) {
					totalFiltered += filteredCount
				}
				
				batchEvents.push(...nonEndedEvents)
				
				if (items.length < limit) {
					foundEnd = true
					break
				}
			}

			totalFetched += batchEvents.length
			console.log(`[Batch ${batchNumber}] Processing ${batchEvents.length} events (${totalFiltered} ended events filtered, total fetched: ${totalFetched})...`)

			// Bulk upsert this batch using raw SQL INSERT ON CONFLICT
			const upsertStartTime = Date.now()
			const { successCount, errorCount } = await bulkUpsertEvents(batchEvents)

			const upsertDuration = Date.now() - upsertStartTime
			totalSuccessCount += successCount
			totalErrorCount += errorCount

			console.log(`[Batch ${batchNumber}] ✅ Upserted ${successCount} events in ${upsertDuration}ms (${totalErrorCount} errors so far)`)

			// Extract and bulk upsert markets from this batch
			const batchMarkets: Array<{ market: PolymarketMarket; eventId: string }> = []
			for (const event of batchEvents) {
				if (event.markets) {
					for (const market of event.markets) {
						batchMarkets.push({ market, eventId: event.id })
					}
				}
			}

			if (batchMarkets.length > 0) {
				const marketStartTime = Date.now()
				const marketResult = await bulkUpsertMarkets(batchMarkets)
				const marketDuration = Date.now() - marketStartTime
				console.log(`[Batch ${batchNumber}] ✅ Upserted ${marketResult.successCount} markets in ${marketDuration}ms (${marketResult.errorCount} errors)`)
			}

			if (foundEnd) {
				hasMore = false
			} else {
				// Move offset forward for next batch
				offset += batchOffsets.length * limit
			}
		}

		const duration = Date.now() - startTime
		console.log(
			`[${new Date().toISOString()}] Scrape complete: ${totalSuccessCount} succeeded, ${totalErrorCount} failed, ${totalFetched} total fetched, ${totalFiltered} ended events filtered (${duration}ms)`
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
