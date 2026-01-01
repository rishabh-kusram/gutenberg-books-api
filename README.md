# Gutenberg Books API

A Node.js API for searching and retrieving books from the Project Gutenberg database.

## Features

- Search books by language, title, author, and topic
- Pagination support (25 books per page)
- Complete book details with authors, subjects, bookshelves, and formats

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure your database
4. Start the server: `npm start` or `npm run dev`

## API Endpoints

- `GET /api/books` - Get books with optional filters:
  - `language` - Filter by language codes (comma-separated)
  - `title` - Search in book titles
  - `author` - Search in author names
  - `topic` - Search in subjects and bookshelves
  - `page` - Page number (default: 1)

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (for cloud deployment)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` - Local database config
- `PORT` - Server port (default: 3000)