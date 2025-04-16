export const MessageAuthorType = {
  User: "User",
  Robot: "Robot",
} as const;
export type MessageAuthorType =
  (typeof MessageAuthorType)[keyof typeof MessageAuthorType];
