const pool = require("../db");

// Get book IDs that match the provided filters
async function getFilteredBookIds(filters) {
    const {
        language,
        title,
        author,
        topic
    } = filters;

    const values = [];
    let i = 1;

    // Build dynamic WHERE conditions based on filters
    const conditions = [];

    if (language) {
        values.push(language.split(","));
        conditions.push(`l.code = ANY($${i++})`);
    }

    if (title) {
        values.push(`%${title}%`);
        conditions.push(`b.title ILIKE $${i++}`);
    }

    if (author) {
        values.push(`%${author}%`);
        conditions.push(`a.name ILIKE $${i++}`);
    }

    if (topic) {
        values.push(`%${topic}%`);
        conditions.push(`(
      s.name ILIKE $${i} OR sh.name ILIKE $${i}
    )`);
        i++;
    }

    // If no filters provided, get all books
    if (conditions.length === 0) {
        const sql = `
        SELECT DISTINCT b.id
        FROM books_book b
        ORDER BY b.download_count DESC
        `;
        const result = await pool.query(sql);
        return result.rows.map(r => r.id);
    }

    // Combine all conditions into WHERE clause
    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const sql = `
    SELECT DISTINCT b.id
    FROM books_book b
    LEFT JOIN books_book_authors ba ON b.id = ba.book_id
    LEFT JOIN books_author a ON ba.author_id = a.id
    LEFT JOIN books_book_languages bl ON b.id = bl.book_id
    LEFT JOIN books_language l ON bl.language_id = l.id
    LEFT JOIN books_book_subjects bs ON b.id = bs.book_id
    LEFT JOIN books_subject s ON bs.subject_id = s.id
    LEFT JOIN books_book_bookshelves bb ON b.id = bb.book_id
    LEFT JOIN books_bookshelf sh ON bb.bookshelf_id = sh.id
    ${whereClause}
  `;

    const result = await pool.query(sql, values);
    return result.rows.map(r => r.id);
}


// Get paginated book IDs with basic info, sorted by download count
async function getPaginatedBooks(bookIds, page) {
    const limit = 25;
    const offset = (page - 1) * limit;

    const sql = `
    SELECT id, title, download_count
    FROM books_book
    WHERE id = ANY($1)
    ORDER BY download_count DESC
    LIMIT $2 OFFSET $3
  `;

    const result = await pool.query(sql, [
        bookIds,
        limit,
        offset
    ]);

    return result.rows;
}


// Get complete book details with authors, subjects, bookshelves, formats, and languages
async function getBookDetails(bookIds) {
  const sql = `
    SELECT
      b.id,
      b.title,
      b.download_count,

      json_agg(DISTINCT jsonb_build_object(
        'id', a.id,
        'name', a.name
      )) FILTER (WHERE a.id IS NOT NULL) AS authors,

      array_agg(DISTINCT s.name)
        FILTER (WHERE s.name IS NOT NULL) AS subjects,

      array_agg(DISTINCT sh.name)
        FILTER (WHERE sh.name IS NOT NULL) AS bookshelves,

      array_agg(DISTINCT l.code)
        FILTER (WHERE l.code IS NOT NULL) AS languages,

      json_object_agg(f.mime_type, f.url)
        FILTER (WHERE f.mime_type IS NOT NULL) AS formats

    FROM books_book b
    LEFT JOIN books_book_authors ba ON b.id = ba.book_id
    LEFT JOIN books_author a ON ba.author_id = a.id
    LEFT JOIN books_book_subjects bs ON b.id = bs.book_id
    LEFT JOIN books_subject s ON bs.subject_id = s.id
    LEFT JOIN books_book_bookshelves bb ON b.id = bb.book_id
    LEFT JOIN books_bookshelf sh ON bb.bookshelf_id = sh.id
    LEFT JOIN books_book_languages bl ON b.id = bl.book_id
    LEFT JOIN books_language l ON bl.language_id = l.id
    LEFT JOIN books_format f ON b.id = f.book_id

    WHERE b.id = ANY($1)
    GROUP BY b.id
    ORDER BY b.download_count DESC
  `;

  const result = await pool.query(sql, [bookIds]);
  return result.rows;
}


// Main service function that combines filtering, pagination, and detail fetching
exports.fetchBooks = async (filters) => {
  const page = parseInt(filters.page) || 1;

  // Step 1: Get all book IDs matching filters
  const allBookIds = await getFilteredBookIds(filters);

  // Get total count for pagination info
  const count = allBookIds.length;

  if (count === 0) {
    return { 
      count: 0, 
      books: [], 
      message: "No books found matching the specified filters" 
    };
  }

  // Step 2: Apply pagination to get current page book IDs
  const paginatedBooks = await getPaginatedBooks(allBookIds, page);
  const pageBookIds = paginatedBooks.map(b => b.id);

  // Step 3: Get complete details for books on current page
  const books = await getBookDetails(pageBookIds);

  return {
    count,
    books
  };
};

