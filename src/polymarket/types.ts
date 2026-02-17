export interface PolymarketImageOptimization {
	id: string
	imageUrlSource?: string | null
	imageUrlOptimized?: string | null
	imageSizeKbSource?: number | null
	imageSizeKbOptimized?: number | null
	imageOptimizedComplete?: boolean | null
	imageOptimizedLastUpdated?: string | null
	relID?: number | null
	field?: string | null
	relname?: string | null
}

export interface PolymarketCategory {
	id: string
	label?: string | null
	parentCategory?: string | null
	slug?: string | null
	publishedAt?: string | null
	createdBy?: string | null
	updatedBy?: string | null
	createdAt?: string | null
	updatedAt?: string | null
}

export interface PolymarketCollection {
	id: string
	ticker?: string | null
	slug?: string | null
	title?: string | null
	subtitle?: string | null
	collectionType?: string | null
	description?: string | null
	tags?: string | null
	image?: string | null
	icon?: string | null
	headerImage?: string | null
	layout?: string | null
	active?: boolean | null
	closed?: boolean | null
	archived?: boolean | null
	new?: boolean | null
	featured?: boolean | null
	restricted?: boolean | null
	isTemplate?: boolean | null
	templateVariables?: string | null
	publishedAt?: string | null
	createdBy?: string | null
	updatedBy?: string | null
	createdAt?: string | null
	updatedAt?: string | null
	commentsEnabled?: boolean | null
	imageOptimized?: PolymarketImageOptimization
	iconOptimized?: PolymarketImageOptimization
	headerImageOptimized?: PolymarketImageOptimization
}

export interface PolymarketEventCreator {
	id: string
	creatorName?: string | null
	creatorHandle?: string | null
	creatorUrl?: string | null
	creatorImage?: string | null
	createdAt?: string | null
	updatedAt?: string | null
}

export interface PolymarketChat {
	id: string
	channelId?: string | null
	channelName?: string | null
	channelImage?: string | null
	live?: boolean | null
	startTime?: string | null
	endTime?: string | null
}

export interface PolymarketTemplate {
	id: string
	eventTitle?: string | null
	eventSlug?: string | null
	eventImage?: string | null
	marketTitle?: string | null
	description?: string | null
	resolutionSource?: string | null
	negRisk?: boolean | null
	sortBy?: string | null
	showMarketImages?: boolean | null
	seriesSlug?: string | null
	outcomes?: string | null
}

export interface PolymarketTag {
	id: string
	label?: string | null
	slug?: string | null
	forceShow?: boolean | null
	publishedAt?: string | null
	createdBy?: number | null
	updatedBy?: number | null
	createdAt?: string | null
	updatedAt?: string | null
	forceHide?: boolean | null
	isCarousel?: boolean | null
}

export interface PolymarketSeries {
	id: string
	ticker?: string | null
	slug?: string | null
	title?: string | null
	subtitle?: string | null
	seriesType?: string | null
	recurrence?: string | null
	description?: string | null
	image?: string | null
	icon?: string | null
	layout?: string | null
	active?: boolean | null
	closed?: boolean | null
	archived?: boolean | null
	new?: boolean | null
	featured?: boolean | null
	restricted?: boolean | null
	isTemplate?: boolean | null
	templateVariables?: boolean | null
	publishedAt?: string | null
	createdBy?: string | null
	updatedBy?: string | null
	createdAt?: string | null
	updatedAt?: string | null
	commentsEnabled?: boolean | null
	competitive?: string | null
	volume24hr?: number | null
	volume?: number | null
	liquidity?: number | null
	startDate?: string | null
	pythTokenID?: string | null
	cgAssetName?: string | null
	score?: number | null
	events?: PolymarketEvent[]
	collections?: PolymarketCollection[]
	categories?: PolymarketCategory[]
	tags?: PolymarketTag[]
	commentCount?: number | null
	chats?: PolymarketChat[]
	[key: string]: unknown
}

export interface PolymarketMarket {
	id: string
	question?: string | null
	conditionId: string
	slug?: string | null
	twitterCardImage?: string | null
	resolutionSource?: string | null
	endDate?: string | null
	category?: string | null
	ammType?: string | null
	liquidity?: string | null
	sponsorName?: string | null
	sponsorImage?: string | null
	startDate?: string | null
	xAxisValue?: string | null
	yAxisValue?: string | null
	denominationToken?: string | null
	fee?: string | null
	image?: string | null
	icon?: string | null
	lowerBound?: string | null
	upperBound?: string | null
	description?: string | null
	outcomes?: string | null
	outcomePrices?: string | null
	volume?: string | null
	active?: boolean | null
	marketType?: string | null
	formatType?: string | null
	lowerBoundDate?: string | null
	upperBoundDate?: string | null
	closed?: boolean | null
	marketMakerAddress: string
	createdBy?: number | null
	updatedBy?: number | null
	createdAt?: string | null
	updatedAt?: string | null
	closedTime?: string | null
	wideFormat?: boolean | null
	new?: boolean | null
	mailchimpTag?: string | null
	featured?: boolean | null
	archived?: boolean | null
	resolvedBy?: string | null
	restricted?: boolean | null
	marketGroup?: number | null
	groupItemTitle?: string | null
	groupItemThreshold?: string | null
	questionID?: string | null
	umaEndDate?: string | null
	enableOrderBook?: boolean | null
	orderPriceMinTickSize?: number | null
	orderMinSize?: number | null
	umaResolutionStatus?: string | null
	curationOrder?: number | null
	volumeNum?: number | null
	liquidityNum?: number | null
	endDateIso?: string | null
	startDateIso?: string | null
	umaEndDateIso?: string | null
	hasReviewedDates?: boolean | null
	readyForCron?: boolean | null
	commentsEnabled?: boolean | null
	volume24hr?: number | null
	volume1wk?: number | null
	volume1mo?: number | null
	volume1yr?: number | null
	gameStartTime?: string | null
	secondsDelay?: number | null
	clobTokenIds?: string | null
	disqusThread?: string | null
	shortOutcomes?: string | null
	teamAID?: string | null
	teamBID?: string | null
	umaBond?: string | null
	umaReward?: string | null
	fpmmLive?: boolean | null
	volume24hrAmm?: number | null
	volume1wkAmm?: number | null
	volume1moAmm?: number | null
	volume1yrAmm?: number | null
	volume24hrClob?: number | null
	volume1wkClob?: number | null
	volume1moClob?: number | null
	volume1yrClob?: number | null
	volumeAmm?: number | null
	volumeClob?: number | null
	liquidityAmm?: number | null
	liquidityClob?: number | null
	makerBaseFee?: number | null
	takerBaseFee?: number | null
	customLiveness?: number | null
	acceptingOrders?: boolean | null
	notificationsEnabled?: boolean | null
	score?: number | null
	imageOptimized?: PolymarketImageOptimization
	iconOptimized?: PolymarketImageOptimization
	events?: PolymarketEvent[]
	categories?: PolymarketCategory[]
	tags?: PolymarketTag[]
	creator?: string | null
	ready?: boolean | null
	funded?: boolean | null
	pastSlugs?: string | null
	readyTimestamp?: string | null
	fundedTimestamp?: string | null
	acceptingOrdersTimestamp?: string | null
	competitive?: number | null
	rewardsMinSize?: number | null
	rewardsMaxSpread?: number | null
	spread?: number | null
	automaticallyResolved?: boolean | null
	oneDayPriceChange?: number | null
	oneHourPriceChange?: number | null
	oneWeekPriceChange?: number | null
	oneMonthPriceChange?: number | null
	oneYearPriceChange?: number | null
	lastTradePrice?: number | null
	bestBid?: number | null
	bestAsk?: number | null
	automaticallyActive?: boolean | null
	clearBookOnStart?: boolean | null
	chartColor?: string | null
	seriesColor?: string | null
	showGmpSeries?: boolean | null
	showGmpOutcome?: boolean | null
	manualActivation?: boolean | null
	negRiskOther?: boolean | null
	gameId?: string | null
	groupItemRange?: string | null
	sportsMarketType?: string | null
	line?: number | null
	umaResolutionStatuses?: string | null
	pendingDeployment?: boolean | null
	deploying?: boolean | null
	deployingTimestamp?: string | null
	scheduledDeploymentTimestamp?: string | null
	rfqEnabled?: boolean | null
	eventStartTime?: string | null
	[key: string]: unknown
}

export interface PolymarketEvent {
	id: string
	ticker?: string | null
	slug?: string | null
	title?: string | null
	subtitle?: string | null
	description?: string | null
	resolutionSource?: string | null
	startDate?: string | null
	creationDate?: string | null
	endDate?: string | null
	image?: string | null
	icon?: string | null
	active?: boolean | null
	closed?: boolean | null
	archived?: boolean | null
	new?: boolean | null
	featured?: boolean | null
	restricted?: boolean | null
	liquidity?: number | null
	volume?: number | null
	openInterest?: number | null
	sortBy?: string | null
	category?: string | null
	subcategory?: string | null
	isTemplate?: boolean | null
	templateVariables?: string | null
	published_at?: string | null
	createdBy?: string | null
	updatedBy?: string | null
	createdAt?: string | null
	updatedAt?: string | null
	commentsEnabled?: boolean | null
	competitive?: number | null
	volume24hr?: number | null
	volume1wk?: number | null
	volume1mo?: number | null
	volume1yr?: number | null
	featuredImage?: string | null
	disqusThread?: string | null
	parentEvent?: string | null
	enableOrderBook?: boolean | null
	liquidityAmm?: number | null
	liquidityClob?: number | null
	negRisk?: boolean | null
	negRiskMarketID?: string | null
	negRiskFeeBips?: number | null
	commentCount?: number | null
	imageOptimized?: PolymarketImageOptimization
	iconOptimized?: PolymarketImageOptimization
	featuredImageOptimized?: PolymarketImageOptimization
	subEvents?: string[] | null
	markets?: PolymarketMarket[]
	series?: PolymarketSeries[]
	categories?: PolymarketCategory[]
	collections?: PolymarketCollection[]
	tags?: PolymarketTag[]
	cyom?: boolean | null
	closedTime?: string | null
	showAllOutcomes?: boolean | null
	showMarketImages?: boolean | null
	automaticallyResolved?: boolean | null
	enableNegRisk?: boolean | null
	automaticallyActive?: boolean | null
	eventDate?: string | null
	startTime?: string | null
	eventWeek?: number | null
	seriesSlug?: string | null
	score?: string | null
	elapsed?: string | null
	period?: string | null
	live?: boolean | null
	ended?: boolean | null
	finishedTimestamp?: string | null
	gmpChartMode?: string | null
	eventCreators?: PolymarketEventCreator[]
	tweetCount?: number | null
	chats?: PolymarketChat[]
	featuredOrder?: number | null
	estimateValue?: boolean | null
	cantEstimate?: boolean | null
	estimatedValue?: string | null
	templates?: PolymarketTemplate[]
	spreadsMainLine?: number | null
	totalsMainLine?: number | null
	carouselMap?: string | null
	pendingDeployment?: boolean | null
	deploying?: boolean | null
	deployingTimestamp?: string | null
	scheduledDeploymentTimestamp?: string | null
	gameStatus?: string | null
	[key: string]: unknown
}

export interface PolymarketL1Credentials {
	POLY_ADDRESS: string
	POLY_SIGNATURE: string
	POLY_TIMESTAMP: string
	POLY_NONCE: string
}

export interface PolymarketL2Credentials {
	POLY_ADDRESS: string
	POLY_SIGNATURE: string
	POLY_TIMESTAMP: string
	POLY_API_KEY: string
	POLY_PASSPHRASE: string
}
