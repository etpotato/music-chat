import { config } from "dotenv";
import { type RouteConfig, index, route } from "@react-router/dev/routes";

config();

export default [
  index("routes/home.tsx"),
  route("chats/:id", "routes/chat.tsx"),
] satisfies RouteConfig;
