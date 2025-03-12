/**
 * Entry Point for the server
 */

const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());

app.listen(process.env.PORT, () => {
  console.log("trimlink.org server is running.");
});

app.get("/hello-world", (req, res) => {
  res.json({
    message: "Hello World",
  });
});
