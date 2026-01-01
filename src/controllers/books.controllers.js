const { fetchBooks } = require("../services/books.service");

exports.getBooks = async (req, res) => {
  try {
    const data = await fetchBooks(req.query);
    
    // Only return 404 if filters were provided but no results found
    const hasFilters = req.query.language || req.query.title || req.query.author || req.query.topic;
    
    if (data.count === 0 && hasFilters) {
      return res.status(404).json({
        error: "No books found matching the specified filters",
        count: 0,
        books: []
      });
    }
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
