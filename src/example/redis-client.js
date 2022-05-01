import { createClient } from "redis";

const url = process.env.REDIS_URL;

export const client = createClient({ url });
await client.connect();
