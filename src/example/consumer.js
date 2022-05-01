import { client } from "./redis-client.js";

import RedisStreamConsumer from "../index.js";

const stream = await RedisStreamConsumer(client, "example:key", "exampleGroup");

if (stream.listen) {
  stream.listen(console.log);
}
