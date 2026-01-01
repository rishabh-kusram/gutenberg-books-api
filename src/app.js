require("dotenv").config();
const express = require("express");
const cors = require("cors");

const bookRoutes = require("./routes/books.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Gutenberg Books API is running", status: "OK" });
});

app.use("/api/books", bookRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
