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

export async function getAllEvents(
	query: Omit<GetEventsQuery, "offset" | "limit"> & Record<string, HttpQueryValue> = {},
	options: JsonRequestOptions = {}
): Promise<PolymarketEvent[]> {
	const events: PolymarketEvent[] = []
	let offset = 0
	const seen = new Set<string>()
	const baseQuery: GetEventsQuery & Record<string, HttpQueryValue> = {
		...query,
		limit: 200,
	}

	while (true) {
		const pageQuery = { ...baseQuery, offset }
		const page = await getEvents(pageQuery, options)
		const items = page ?? []
		if (items.length === 0) break

		events.push(...items)
		console.log(`polymarket events fetched: ${events.length}`)

		// Check if we've reached the end or hit a loop
		if (items.length < (baseQuery.limit ?? items.length)) break
		if (seen.has(JSON.stringify(pageQuery))) break
		seen.add(JSON.stringify(pageQuery))
		offset += items.length
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
