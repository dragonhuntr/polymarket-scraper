import type { QuoteLevel } from "@/core/domain/types"
import type { JsonRequestOptions, HttpQueryValue } from "@/integrations/shared/http"
import type {
	CancelPolymarketOrderResponse,
	CreatePolymarketOrderRequest,
	GetPolymarketPortfolioPositionsQuery,
	PolymarketOrderResponse,
	PolymarketPortfolioBalanceResponse,
	PolymarketPortfolioPositionsResponse,
} from "@/integrations/polymarket/client"
import type { PolymarketEvent } from "@/integrations/polymarket/types"

import {
	cancelOrder as cancelPolymarketOrder,
	createOrder as createPolymarketOrder,
	getAllEvents as getPolymarketEvents,
	getOrderBooks as getPolymarketBooks,
	getPortfolioBalance as getPolymarketPortfolioBalance,
	getPortfolioPositions as getPolymarketPortfolioPositions,
	parseOrderLevels,
} from "@/integrations/polymarket/client"
import { buildQuote, sortAsks, sortBids } from "@/integrations/shared/lib"

export async function fetchPolymarketEvents(
	options: JsonRequestOptions = {}
): Promise<PolymarketEvent[]> {
	return await getPolymarketEvents(
		{ closed: false, end_date_min: new Date().toISOString() },
		options
	)
}

export async function fetchPolymarketOrderbook(
	tokenId: string,
	depth = 10,
	options: JsonRequestOptions = {}
): Promise<{ bids: QuoteLevel[]; asks: QuoteLevel[] }> {
	const summaries = await getPolymarketBooks([{ token_id: tokenId }], options)
	const s = summaries[0]
	const venue = "polymarket" as const
	const bidsRaw = parseOrderLevels(s?.bids || [])
	const asksRaw = parseOrderLevels(s?.asks || [])
	const bids: QuoteLevel[] = []
	const asks: QuoteLevel[] = []
	for (const lvl of bidsRaw.slice(0, depth)) {
		const q = buildQuote(lvl.price, lvl.size, venue, "bid")
		if (q) bids.push(q)
	}
	for (const lvl of asksRaw.slice(0, depth)) {
		const q = buildQuote(lvl.price, lvl.size, venue, "ask")
		if (q) asks.push(q)
	}
	return { bids: sortBids(bids), asks: sortAsks(asks) }
}

export async function submitPolymarketOrder(
	payload: CreatePolymarketOrderRequest,
	options: JsonRequestOptions = {}
): Promise<PolymarketOrderResponse> {
	return await createPolymarketOrder(payload, options)
}

export async function cancelPolymarketOrderById(
	orderId: string,
	options: JsonRequestOptions = {}
): Promise<CancelPolymarketOrderResponse> {
	return await cancelPolymarketOrder(orderId, options)
}

export async function fetchPolymarketPortfolioBalance(
	options: JsonRequestOptions = {}
): Promise<PolymarketPortfolioBalanceResponse> {
	const query = {
		asset_type: "COLLATERAL",
		signature_type: 2,
	}
	return await getPolymarketPortfolioBalance(query, options)
}

export async function fetchPolymarketPortfolioPositions(
	query: GetPolymarketPortfolioPositionsQuery & Record<string, HttpQueryValue>,
	options: JsonRequestOptions = {}
): Promise<PolymarketPortfolioPositionsResponse> {
	return await getPolymarketPortfolioPositions(query, options)
}
