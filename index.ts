import { PrismaClient } from "@prisma/client"
import { getAllEvents } from "./src/polymarket/client"
import type { PolymarketEvent } from "./src/polymarket/types"

// Initialize Prisma Client
const prisma = new PrismaClient()

// Parse interval from environment variable (in milliseconds), default to 60000 (1 minute)
const INTERVAL_MS = parseInt(Bun.env.SCRAPE_INTERVAL_MS || "60000", 10)

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

// Upsert events to database
async function upsertEvents() {
	try {
		console.log(`[${new Date().toISOString()}] Starting event scrape...`)
		const startTime = Date.now()

		// Fetch all events from Polymarket API
		const events = await getAllEvents()
		console.log(`[${new Date().toISOString()}] Fetched ${events.length} events from API`)

		// Upsert each event
		let successCount = 0
		let errorCount = 0

		for (const event of events) {
			try {
				const eventData = transformEvent(event)
				await prisma.event.upsert({
					where: { id: event.id },
					update: eventData,
					create: eventData,
				})
				successCount++
			} catch (error) {
				errorCount++
				console.error(`[${new Date().toISOString()}] Error upserting event ${event.id}:`, error)
			}
		}

		const duration = Date.now() - startTime
		console.log(
			`[${new Date().toISOString()}] Scrape complete: ${successCount} succeeded, ${errorCount} failed (${duration}ms)`
		)
	} catch (error) {
		console.error(`[${new Date().toISOString()}] Fatal error during scrape:`, error)
	}
}

// Run immediately on startup
console.log(`[${new Date().toISOString()}] Starting Polymarket scraper (interval: ${INTERVAL_MS}ms)`)
upsertEvents().catch(console.error)

// Then run on interval
const intervalId = setInterval(() => {
	upsertEvents().catch(console.error)
}, INTERVAL_MS)

// Graceful shutdown
process.on("SIGINT", async () => {
	console.log(`[${new Date().toISOString()}] Shutting down...`)
	clearInterval(intervalId)
	await prisma.$disconnect()
	process.exit(0)
})

process.on("SIGTERM", async () => {
	console.log(`[${new Date().toISOString()}] Shutting down...`)
	clearInterval(intervalId)
	await prisma.$disconnect()
	process.exit(0)
})
