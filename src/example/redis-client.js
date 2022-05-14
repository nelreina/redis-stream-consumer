const { createClient } = require("redis");

const url = process.env.REDIS_URL;

const client = createClient({ url });
(async () => {
  await client.connect();
})();

exports.client = client;
