import type { PolymarketEvent, PolymarketMarket } from "./types"

import {
	appendSearchParams,
	ensureTrailingSlash,
	fetchJson,
} from "../shared/http"
import type { JsonRequestOptions, HttpQueryValue } from "../shared/http"

import {
	POLYMARKET_BASE_URL,
	POLYMARKET_CLOB_URL,
} from "./constants"

const DEFAULT_POLYMARKET_BASE_URL = ensureTrailingSlash(POLYMARKET_BASE_URL)
const DEFAULT_POLYMARKET_CLOB_BASE_URL = ensureTrailingSlash(POLYMARKET_CLOB_URL)

export interface GetMarketsQuery {
	limit?: number
	offset?: number
	order?: string
	ascending?: boolean
	id?: number[]
	slug?: string[]
	clob_token_ids?: string[]
	condition_ids?: string[]
	market_maker_address?: string[]
	liquidity_num_min?: number
	liquidity_num_max?: number
	volume_num_min?: number
	volume_num_max?: number
	start_date_min?: string
	start_date_max?: string
	end_date_min?: string
	end_date_max?: string
	tag_id?: number
	related_tags?: boolean
	cyom?: boolean
	uma_resolution_status?: string
	game_id?: string
	sports_market_types?: string[]
	rewards_min_size?: number
	question_ids?: string[]
	include_tag?: boolean
	closed?: boolean
	[key: string]: HttpQueryValue
}

export async function getMarkets(
	query: GetMarketsQuery & Record<string, HttpQueryValue> = {},
	options: JsonRequestOptions = {}
): Promise<PolymarketMarket[]> {
	const url = new URL("markets", DEFAULT_POLYMARKET_BASE_URL)
	appendSearchParams(url, query)
	return await fetchJson<PolymarketMarket[]>(url, options)
}

export interface GetEventsQuery {
	limit?: number
	offset?: number
	order?: string
	ascending?: boolean
	id?: number[]
	tag_id?: number
	exclude_tag_id?: number[]
	slug?: string[]
	tag_slug?: string
	related_tags?: boolean
	active?: boolean
	archived?: boolean
	featured?: boolean
	cyom?: boolean
	include_chat?: boolean
	include_template?: boolean
	recurrence?: string
	closed?: boolean
	liquidity_min?: number
	liquidity_max?: number
	volume_min?: number
	volume_max?: number
	start_date_min?: string
	start_date_max?: string
	end_date_min?: string
	end_date_max?: string
	[key: string]: HttpQueryValue
}

export async function getEvents(
	query: GetEventsQuery & Record<string, HttpQueryValue> = {},
	options: JsonRequestOptions = {}
): Promise<PolymarketEvent[]> {
	const url = new URL("events", DEFAULT_POLYMARKET_BASE_URL)
	appendSearchParams(url, query)
	return await fetchJson<PolymarketEvent[]>(url, options)
}

// Helper function to process items in parallel with concurrency limit
async function parallelProcess<T, R>(
	items: T[],
	processor: (item: T) => Promise<R>,
	concurrency: number = 10
): Promise<R[]> {
	const results: R[] = []
	const executing: Promise<void>[] = []

	for (const item of items) {
		const promise = processor(item).then((result) => {
			results.push(result)
		})
		executing.push(promise)

		if (executing.length >= concurrency) {
			await Promise.race(executing)
			executing.splice(executing.findIndex((p) => p === promise), 1)
		}
	}

	await Promise.all(executing)
	return results
}

export async function getAllEvents(
	query: Omit<GetEventsQuery, "offset" | "limit"> & Record<string, HttpQueryValue> = {},
	options: JsonRequestOptions = {}
): Promise<PolymarketEvent[]> {
	const events: PolymarketEvent[] = []
	const baseQuery: GetEventsQuery & Record<string, HttpQueryValue> = {
		...query,
		limit: 200,
	}
	const limit = baseQuery.limit ?? 200
	const CONCURRENCY = 10

	// Fetch pages in batches, starting from offset 0
	let offset = 0
	let hasMore = true
	let batchNumber = 0

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
				console.log(`  [Request ${index + 1}/${batchOffsets.length}] Starting fetch for offset ${batchOffset}`)
				const pageQuery = { ...baseQuery, offset: batchOffset }
				const page = await getEvents(pageQuery, options)
				const fetchDuration = Date.now() - fetchStart
				console.log(`  [Request ${index + 1}/${batchOffsets.length}] Completed offset ${batchOffset} in ${fetchDuration}ms (${page?.length ?? 0} items)`)
				return { offset: batchOffset, items: page ?? [], duration: fetchDuration }
			})
		)

		const batchDuration = Date.now() - batchStartTime
		const totalItems = batchResults.reduce((sum, r) => sum + r.items.length, 0)
		const avgDuration = batchResults.reduce((sum, r) => sum + r.duration, 0) / batchResults.length
		console.log(`[Batch ${batchNumber}] ✅ All ${batchOffsets.length} requests completed in ${batchDuration}ms (parallel efficiency: ${Math.round((avgDuration / batchDuration) * 100)}%) - fetched ${totalItems} items`)

		// Process results in order and stop when we hit an empty page or partial page
		let foundEnd = false
		for (const { items } of batchResults) {
			if (items.length === 0) {
				foundEnd = true
				break
			}

			events.push(...items)
			console.log(`polymarket events fetched: ${events.length}`)

			// If we got less than limit, this is the last page
			if (items.length < limit) {
				foundEnd = true
				break
			}
		}

		if (foundEnd) {
			hasMore = false
		} else {
			// Move offset forward for next batch
			offset += batchOffsets.length * limit
		}
	}

	return events
}

export interface ClobBookLevel {
	price: string
	size: string
}

export interface ClobBookSummary {
	market: string
	asset_id: string
	timestamp: string
	hash: string
	bids: ClobBookLevel[]
	asks: ClobBookLevel[]
	min_order_size: string
	tick_size: string
	neg_risk: boolean
}

export interface GetOrderBooksBodyItem {
	token_id: string
	side?: "BUY" | "SELL"
}

export type ClobOrderbookResponse = ClobBookSummary[]

export async function getOrderBooks(
	body: GetOrderBooksBodyItem[],
	options: JsonRequestOptions = {}
): Promise<ClobOrderbookResponse> {
	const url = new URL("books", DEFAULT_POLYMARKET_CLOB_BASE_URL)
	return await fetchJson<ClobOrderbookResponse>(url, {
		method: "POST",
		body,
		...options,
	})
}

export type PolymarketOrderAction = "buy" | "sell"
export type PolymarketOrderSide = "BUY" | "SELL"
