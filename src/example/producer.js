import { client } from "./redis-client.js";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

const STREAM = process.env["STREAM"];
console.log("LOG:  ~ file: producer.js ~ line 5 ~ STREAM", STREAM);

import { addToEventLog } from "../index.js";

const producer = client.duplicate();

await producer.connect();

setInterval(async () => {
  const event = {
    streamKeyName: STREAM,
    event: "DANSA",
    aggregateId: uuidv4(),
    // payload: { message: "New evnt" },
  };
  try {
    await addToEventLog(producer, event);
  } catch (error) {
    console.error(error.message);
  }
}, 1000);
