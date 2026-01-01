const { Pool } = require("pg");
const dbConfig = require("./configs/db.config");

const pool = new Pool(dbConfig);

pool.on("connect", () => {
  console.log("PostgreSQL connected");
});

pool.on("error", (err) => {
  console.error("Unexpected DB error", err);
  process.exit(1);
});

module.exports = pool;
