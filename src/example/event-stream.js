import { client } from "./redis-client.js";
import "dotenv/config";

const STREAM = process.env["STREAM"];

import { newEventStreamService } from "../index.js";

const message = await newEventStreamService(client, STREAM, "TEST-SRV");
console.log(message);
