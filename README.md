# polymarket-scraper

A Polymarket data scraper and REST API server that scrapes market and event data from Polymarket's Gamma API and provides flexible querying capabilities.

## Features

- 🔄 Automatic data scraping from Polymarket's Gamma API
- 🔍 Flexible filtering by any database field
- 📊 Pagination and sorting support
- 🚀 Built with Bun runtime for high performance
- 💾 PostgreSQL database with Prisma ORM

## Installation

```bash
bun install
```

## Configuration

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL`: PostgreSQL connection string
- `HOST`: Server host (default: `0.0.0.0`)
- `PORT`: Server port (default: `3000`)
- `SCRAPE_INTERVAL_MS`: Scraping interval in milliseconds (default: `60000`)

## Running

Start the server:

```bash
bun run start
```

Or run in development mode with hot reload:

```bash
bun run dev
```

The server will:
- Start the REST API on `http://localhost:3000` (or your configured host/port)
- Begin scraping Polymarket data at the configured interval
- Automatically update the database with the latest market and event data

## API Documentation

See [API.md](./API.md) for complete API documentation.

**Quick Start:**

```bash
# Health check
curl http://localhost:3000/health

# Get active markets
curl "http://localhost:3000/markets?active=true&closed=false"

# Get featured events
curl "http://localhost:3000/events?featured=true&active=true"
```

## Database Setup

1. Create a PostgreSQL database
2. Set the `DATABASE_URL` in your `.env` file
3. Run Prisma migrations:

```bash
bunx prisma migrate dev
```

## Project Structure

- `server.ts` - Main server file with API endpoints and scraper logic
- `src/polymarket/` - Polymarket API client
- `src/db.ts` - Database connection
- `prisma/schema.prisma` - Database schema

This project was created using `bun init` in bun v1.3.0. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
