import { http } from "../testApp";

type LoginResponse = {
  token: string;
  user: { id: number; name: string; email: string; role: "ADMIN" | "CLIENT" };
};

export async function loginAdmin(email: string, password: string) {
  const res = await http.post("/api/admin/login").send({ email, password });
  return res.body as LoginResponse;
}

export async function loginClient(email: string, password: string) {
  const res = await http.post("/api/auth/login").send({ email, password });
  return res.body as LoginResponse;
}
