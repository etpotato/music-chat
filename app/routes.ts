import { config } from "dotenv";
import { type RouteConfig, index, route } from "@react-router/dev/routes";

config();

export default [
  route("/", "routes/home.tsx", [
    index("routes/no-session.tsx"),
    route("chats/:id", "routes/chat.tsx"),
  ]),
] satisfies RouteConfig;
