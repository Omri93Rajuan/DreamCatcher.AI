import { httpServerHandler } from "cloudflare:node";
import { server } from "./index";

export default httpServerHandler(server);
