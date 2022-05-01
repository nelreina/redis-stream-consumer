# @nelreina/redis-stream-consumer

A simple redis-streams consumer package with auto ack

## Usage

```javascript
import RedisStreamConsumer from "@nelreina/redis-stream-consumer";
const stream = await RedisStreamConsumer(
  redisClient,
  KEY,
  GROUP_NAME,
  options,
  logger
);
```

## Example

```javascript
import { createClient } from "redis";
import RedisStreamConsumer from "@nelreina/redis-stream-consumer";

const url = process.env.REDIS_URL;

export const client = createClient({ url });
await client.connect();

// Minimal Setup
const stream = await RedisStreamConsumer(
  client,
  "example:key",
  "exampleGroup"
  // options = {
  //  consumer: os.hostname()
  //  autoAck: true
  //  startID: "$" begin at next entry / 0 from beginning
  // }
);

const callback = async (message) => {
  console.log(message);
  // Here your code to process stream message
};

if (stream.listen) {
  stream.listen(callback);
}
```

## Options

| Name     | Type    | Default       |
| -------- | ------- | ------------- |
| consumer | string  | os.hostname() |
| autoAck  | boolean | true          |
| startID  | string  | $             |

# Run the example

- tested on node version v16.15.0
- Redis client v4.x
- Uses nodejs type module

```shell

git clone https://github.com/nelreina/redis-stream-consumer.git
cd redis-stream-consumer
npm i
npm run dev

```
