import { client } from "./redis-client.js";

import RedisStreamConsumer from "../index.js";

const stream = await RedisStreamConsumer(client, "stream1", "nodeapp1");

if (stream.listen) {
  stream.listen(console.log);
}
