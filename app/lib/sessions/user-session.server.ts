import { createCookieSessionStorage, type Session } from "react-router";
import { appConfig } from "~/lib/app-config/index.server";

type SessionData = {
  user_id: string;
};

type SessionFlashData = {
  error: string;
};

export type UserSession = Session<SessionData, SessionFlashData>;

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    // a Cookie from `createCookie` or the CookieOptions to create one
    cookie: {
      name: "__last_opened_chat_session",

      // all of these are optional
      // domain: "reactrouter.com",
      // Expires can also be set (although maxAge overrides it when used in combination).
      // Note that this method is NOT recommended as `new Date` creates only one date on each server deployment, not a dynamic date in the future!
      //
      // expires: new Date(Date.now() + 60_000),
      httpOnly: true,
      // maxAge: 60,
      // path: "/",
      sameSite: "lax",
      secrets: [appConfig.COOKIE_SECRET],
      secure: appConfig.NODE_ENV !== "development",
    },
  });

export const userSession = { getSession, commitSession, destroySession };
