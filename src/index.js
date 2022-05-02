const BLOCK = 30000;
import OS from "os";

export default async (client, key, group, options = {}, logger = console) => {
  const createGroup = async (key, group, startID) => {
    try {
      const resp = await client.xGroupCreate(key, group, startID, {
        MKSTREAM: true,
      });
      return true;
    } catch (error) {
      if (error.message.includes("already exists")) {
        const info = await client.xInfoGroups(key);
        logger.info(info);
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
      logger.info(info);
      return true;
    } catch (error) {
      console.log(
        "LOG:  ~ file: redis-stream.js ~ line 9 ~ error",
        error.message
      );
      return false;
    }
  };
  // Handle Defaults
  const autoAck = options.autoAck || true;
  const startID = options.startID || "$";
  const consumer = options.consumer || OS.hostname();

  const groupOK = await createGroup(key, group, startID);
  if (!groupOK) return {};
  const consumerOK = await createConsumer(key, group, consumer);
  if (!consumerOK) return {};
  const streamClient = client.duplicate();
  await streamClient.connect();

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
      const [payload] = msg.messages;
      await streamHandler(payload);
      if (autoAck) {
        const resp = await streamClient.xAck(key, group, payload.id);
      }

      listen(streamHandler);
    } else {
      listen(streamHandler);
    }
  };
  return { listen };
};
