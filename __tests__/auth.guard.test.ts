import request from "supertest";
import { connectTestDb, closeTestDb, resetTestDb, syncTestDb } from "../test/setupTestDb";
import { createClient, createAdmin } from "../test/factories";
import { createApp } from "../src/app";

describe("Auth + Guard", () => {
  const app = createApp();

  beforeAll(async () => {
    await connectTestDb();
    await syncTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  it("GET /health should return 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("CLIENT should NOT access admin route (403)", async () => {
    const { user, password } = await createClient({ email: "client1@portal.com" });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password });

    expect(login.status).toBe(200);
    expect(typeof login.body.token).toBe("string");

    const token = login.body.token as string;

    const res = await request(app)
      .get("/api/admin/rooms")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("ADMIN should access admin route (200)", async () => {
    const { user, password } = await createAdmin({ email: "admin1@portal.com" });

    const login = await request(app)
      .post("/api/admin/login")
      .send({ email: user.email, password });

    expect(login.status).toBe(200);
    expect(typeof login.body.token).toBe("string");

    const token = login.body.token as string;

    const res = await request(app)
      .get("/api/admin/rooms")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});
