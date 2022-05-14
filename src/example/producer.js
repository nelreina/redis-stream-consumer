require("dotenv").config();
const { client } = require("./redis-client.js");
const { v4: uuidv4 } = require("uuid");
const { addToEventLog } = require("../index.js");

const STREAM = process.env["STREAM"];
console.log("LOG:  ~ file: producer.js ~ line 5 ~ STREAM", STREAM);

const producer = client.duplicate();

(async () => {
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
})();
