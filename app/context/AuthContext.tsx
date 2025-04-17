import { createContext, useContext, type ReactNode } from "react";
import type { SpotifyAuth } from "~/types/auth";

type AuthContext = {
  spotify: SpotifyAuth;
};

const AuthContext = createContext<AuthContext | null>(null);

export const AuthProvider = ({
  data,
  children,
}: {
  data: AuthContext;
  children: ReactNode;
}) => {
  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

export function useAuthContext() {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw Error("AuthContext should be used inside AuthProvider");
  }

  return authContext;
}
