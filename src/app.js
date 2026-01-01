require("dotenv").config();
const express = require("express");
const cors = require("cors");

const bookRoutes = require("./routes/books.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/books", bookRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
