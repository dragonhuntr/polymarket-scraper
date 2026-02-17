export type HttpQueryPrimitive = string | number | boolean
export type HttpQueryValue =
	| HttpQueryPrimitive
	| ReadonlyArray<HttpQueryPrimitive>
	| null
	| undefined

export interface JsonRequestOptions
	extends Omit<RequestInit, "body" | "headers" | "method"> {
	method?: string
	headers?: Record<string, string>
	body?: unknown
}

export function ensureTrailingSlash(input: string): string {
	return input.endsWith("/") ? input : `${input}/`
}

export function appendSearchParams(
	url: URL,
	params: Record<string, HttpQueryValue>
): void {
	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null) return
		if (Array.isArray(value)) {
			value.forEach((item) => {
				if (item !== undefined && item !== null) {
					url.searchParams.append(key, String(item))
				}
			})
			return
		}
		url.searchParams.set(key, String(value))
	})
}

function isBodyInit(value: unknown): value is BodyInit {
	if (value === undefined || value === null) return false
	if (typeof value === "string") return true
	if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) return true
	if (ArrayBuffer.isView(value)) return true
	if (typeof Blob !== "undefined" && value instanceof Blob) return true
	if (typeof FormData !== "undefined" && value instanceof FormData) return true
	if (typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams)
		return true
	if (typeof ReadableStream !== "undefined" && value instanceof ReadableStream)
		return true
	return false
}

export async function fetchJson<T = unknown>(
	input: string | URL,
	options: JsonRequestOptions = {}
): Promise<T> {
	const { body, headers, method, ...rest } = options

	const url = typeof input === "string" ? input : input.toString()
	const headerRecord: Record<string, string> = {
		Accept: "application/json",
		...(headers || {}),
	}
	const init: RequestInit = {
		...rest,
		method: method?.toUpperCase() ?? "GET",
		headers: headerRecord,
	}

	if (body !== undefined) {
		if (isBodyInit(body)) {
			init.body = body
		} else {
			init.body = JSON.stringify(body)
			if (!headerRecord["Content-Type"]) {
				headerRecord["Content-Type"] = "application/json"
			}
		}
	}

	const response = await fetch(url, init)
	if (!response.ok) {
		const errorText = await response.text().catch(() => "")
		const suffix = errorText ? `: ${errorText}` : ` (${response.statusText})`
		throw new Error(`Request failed with status ${response.status}${suffix}`)
	}

	const text = await response.text().catch(() => "")
	if (!text) {
		return undefined as T
	}

	try {
		return JSON.parse(text) as T
	} catch {
		throw new Error("Failed to parse JSON response")
	}
}
