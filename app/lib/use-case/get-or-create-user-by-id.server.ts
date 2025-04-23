import { database } from "../database/index.server";

export async function getOrCreateUserById(
  id?: string,
  userAgent?: string | null
) {
  const user = id ? await database.getUserById(id) : null;

  if (user) {
    return user;
  }

  const newUser = await database.createUser({
    user_agent: userAgent || null,
  });

  return newUser;
}
