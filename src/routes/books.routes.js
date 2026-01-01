const express = require("express");
const router = express.Router();
const { getBooks } = require("../controllers/books.controllers");

router.get("/", getBooks);

module.exports = router;
