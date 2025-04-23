import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("/", "routes/home/index.tsx", [
    index("routes/no-session.tsx"),
    route("chats/:id", "routes/chat/index.tsx"),
  ]),
  route("/auth/spotify", "routes/auth-spotify.ts"),
] satisfies RouteConfig;
