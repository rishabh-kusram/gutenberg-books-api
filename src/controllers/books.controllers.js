const { fetchBooks } = require("../services/books.service");

exports.getBooks = async (req, res) => {
  try {
    const data = await fetchBooks(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
