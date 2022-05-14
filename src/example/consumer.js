import { client } from "./redis-client.js";

import RedisStreamConsumer from "../index.js";

const stream = await RedisStreamConsumer(client, "stream2", "nodeapp");

if (stream.listen) {
  stream.listen(console.log);
}
