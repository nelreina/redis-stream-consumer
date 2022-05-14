require("dotenv").config();
const { client } = require("./redis-client.js");
const { newEventStreamService } = require("../index.js");

const STREAM = process.env["STREAM"];

(async () => {
  const message = await newEventStreamService(client, STREAM, "TEST-SRV");
  console.log(message);
})();
