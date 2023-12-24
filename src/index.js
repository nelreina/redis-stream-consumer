const BLOCK = 30000;
import OS from "os";
import { getTimeStamp } from "./lib/date-utils.js";

const Stream = async (client, key, group, options = {}) => {
  // Handle Defaults
  const autoAck = options.autoAck || false;
  const startID = options.startID || "$";
  const consumer = options.consumer || OS.hostname();
  const logger = options.logger || console;

  const createGroup = async (key, group, startID) => {
    try {
      await client.xGroupCreate(key, group, startID, {
        MKSTREAM: true,
      });
      logger.info(`${group} created for key: ${key}!`);
      const info = await client.xInfoGroups(key);
      logger.info(JSON.stringify(info));
      return true;
    } catch (error) {
      if (error.message.includes("already exists")) {
        const info = await client.xInfoGroups(key);
        logger.info(JSON.stringify(info));
        return true;
      } else {
        logger.error(error.message);
        return false;
      }
    }
  };

  const createConsumer = async (key, group, consumer) => {
    try {
      await client.xGroupCreateConsumer(key, group, consumer);
      const info = await client.xInfoConsumers(key, group);
      logger.info(JSON.stringify(info));
      return true;
    } catch (error) {
      logger.error(
        "LOG:  ~ file: redis-stream.js ~ line 9 ~ error",
        error.message
      );
      return false;
    }
  };

  const groupOK = await createGroup(key, group, startID);
  if (!groupOK) return {};
  const consumerOK = await createConsumer(key, group, consumer);
  if (!consumerOK) return {};
  const streamClient = client.duplicate();
  await streamClient.connect();

  const ack = async (id) => {
    return await streamClient.xAck(key, group, id);
  };

  // Start listen to stream
  const listen = async (streamHandler) => {
    const messages = await streamClient.xReadGroup(
      group,
      consumer,
      { key, id: ">" },
      { BLOCK, COUNT: 1 }
    );
    if (messages) {
      const msg = messages[0];
      const [streamData] = msg.messages;
      const { id, message } = streamData;
      await streamHandler(id, message, ack);
      if (autoAck) {
        await ack(id);
      }

      await listen(streamHandler);
    } else {
      await listen(streamHandler);
    }
  };
  return { listen, ack };
};

export default Stream;

const checkIfEventStreamData = (event, aggregateId, timestamp) => {
  if (!event) return false;
  if (event && event.length === 0) return false;
  if (!aggregateId) return false;
  if (aggregateId && aggregateId.length === 0) return false;
  if (!timestamp) return false;
  if (timestamp && timestamp.length === 0) return false;

  return true;
};

export const newEventStreamService = async (
  conn,
  streamKeyName,
  serviceName,
  watchEvent = false,
  callback = console.log,
  startID = "0",
  logger = console
) => {
  if (!conn) throw Error("Redis connection is required!");
  if (!streamKeyName) throw Error("streamKeyName is required!");
  if (!serviceName) throw Error("serviceName is required!");

  let message = `"${serviceName}" / "${streamKeyName}" init pending...`;
  const stream = await Stream(conn, streamKeyName, serviceName, {
    startID,
    logger,
  });

  if (stream.listen) {
    stream.listen(async (id, message, ack) => {
      const { event, aggregateId, timestamp, payload, ...rest } = message;
      if (!checkIfEventStreamData(event, aggregateId, timestamp)) {
        logger.error(
          "WARNING: this message is not a valid event stream! ",
          "Missing fields: event, aggregateId or timestamp",
          `ID: ${id}`
        );
        return;
      }
      let lPayLoad = payload;
      try {
        lPayLoad = JSON.parse(lPayLoad || "{}");
      } catch (error) {
        // Payload is not JSON
      }
      if (!watchEvent || watchEvent.includes(event)) {
        await callback({
          streamId: id,
          aggregateId,
          timestamp,
          payload: lPayLoad,
          ack,
          event,
          ...rest,
        });
      } else {
        await ack(id);
      }
    });
    message = `"${serviceName}" listening to stream "${streamKeyName}" for "${watchEvent ? "event(s) " + watchEvent : "all events"
      }"`;
  }
  return message;
};

export const addToEventLog = async (
  conn,
  { streamKeyName, event, aggregateId, payload, serviceName = "" }
) => {
  if (!streamKeyName || (streamKeyName && streamKeyName.length === 0)) {
    throw Error(
      "ERROR: Not a valid Event Stream Data!,  'streamKeyName' are required!"
    );
  }

  const timestamp = getTimeStamp();
  if (!checkIfEventStreamData(event, aggregateId, timestamp)) {
    throw Error(
      "ERROR: Not a valid Event Stream Data!,  'event', 'aggregateId' and 'timestamp' are required!"
    );
  }
  console.info(JSON.stringify({ log: "addToStream", event, aggregateId }));
  const streamData = {
    event,
    aggregateId,
    timestamp,
    payload: JSON.stringify(payload || {}),
    serviceName,
  };
  await conn.xAdd(streamKeyName, "*", streamData);
};
