import { client } from "./redis-client.js";
import "dotenv/config";

const STREAM = process.env["STREAM"];

import { newEventStreamService } from "../index.js";

newEventStreamService(
  client,
  STREAM,
  "TEST-SRV",
  ["POLKA", "TEST-EVENT"],
  console.log
);
