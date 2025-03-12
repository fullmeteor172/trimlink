/**
 * Entry Point for the server
 */
const config = require("./config/environment");
const app = require("./app")

app.listen(config.PORT, () => {
  console.log("trimlink.org server is running.");
});
