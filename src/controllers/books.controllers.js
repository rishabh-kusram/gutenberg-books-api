const { fetchBooks } = require("../services/books.service");

exports.getBooks = async (req, res) => {
  try {
    const data = await fetchBooks(req.query);
    
    // If no books found, return 404 with error message
    if (data.count === 0) {
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
