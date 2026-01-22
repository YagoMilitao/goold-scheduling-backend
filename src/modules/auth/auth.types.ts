export type JwtPayload = {
  sub: number;
  role: "ADMIN" | "CLIENT";
  email: string;
};
