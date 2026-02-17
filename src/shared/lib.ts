import type { QuoteLevel, Venue } from "@/core/domain/types"

export function yesCentsToProb(cents?: number): number | undefined {
	if (typeof cents !== "number" || !Number.isFinite(cents)) return undefined
	return Math.max(0, Math.min(1, cents / 100))
}

export function dollarsToProb(dollars?: number): number | undefined {
	if (typeof dollars !== "number" || !Number.isFinite(dollars)) return undefined
	return Math.max(0, Math.min(1, dollars))
}

export function buildQuote(
	price: number | undefined,
	size: number | undefined,
	venue: Venue,
	side: "bid" | "ask"
): QuoteLevel | undefined {
	if (typeof price !== "number" || !Number.isFinite(price)) return undefined
	if (typeof size !== "number" || !Number.isFinite(size) || size <= 0) return undefined
	return { price, size, venue, side }
}

export function sortBids(levels: QuoteLevel[]): QuoteLevel[] {
	return [...levels].sort((a, b) => b.price - a.price)
}

export function sortAsks(levels: QuoteLevel[]): QuoteLevel[] {
	return [...levels].sort((a, b) => a.price - b.price)
}

export function toNumberSafe(input: string | number | undefined): number | undefined {
	if (typeof input === "number") return Number.isFinite(input) ? input : undefined
	if (typeof input === "string") {
		const n = Number(input)
		return Number.isFinite(n) ? n : undefined
	}
	return undefined
}
