import { StatusCodes } from "http-status-codes";
import { database } from "../database/index.server";
import { data } from "react-router";
import type { UserSession } from "../sessions/user-session.server";

export async function getUserFromSession(session: UserSession) {
  const userId = session.get("user_id");

  if (!userId) {
    throw data("User not found", { status: StatusCodes.NOT_FOUND });
  }

  const user = await database.getUserById(userId);

  if (!user) {
    throw data("User not found", { status: StatusCodes.NOT_FOUND });
  }

  return user;
}
