/**
 * Entry Point for the server
 */

const config = require("./config/environment");
const express = require("express");

const app = express();

app.use(express.json());

app.listen(config.PORT, () => {
  console.log("trimlink.org server is running.");
});

app.get("/hello-world", (req, res) => {
  res.json({
    message: "Hello World",
  });
});
