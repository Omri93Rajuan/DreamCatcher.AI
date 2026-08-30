import { httpServerHandler } from "cloudflare:node";
import { env } from "cloudflare:workers";

const jwtAccessSecret = env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET;
if (jwtAccessSecret) {
  process.env.JWT_ACCESS_SECRET = jwtAccessSecret;
}

const { server } = await import("./index");

export default httpServerHandler(server);
