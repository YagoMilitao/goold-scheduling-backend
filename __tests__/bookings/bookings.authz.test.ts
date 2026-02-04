import { http } from "../../test/testApp";
import { createUser } from "../../test/factories/user.factory";
import { loginClient } from "../../test/helpers/auth.helper";

describe("Bookings authorization", () => {
  it("CLIENT should not access admin bookings routes (403)", async () => {
    const uid = Date.now();
    const clientEmail = `client-authz-${uid}@portal.com`;

    await createUser({
      name: "Client",
      lastName: "Demo",
      email: clientEmail,
      password: "Client@123",
      role: "CLIENT",
      isActive: true,
      canViewBookings: true,
      canViewLogs: true
    });

    const clientLogin = await loginClient(clientEmail, "Client@123");

    const listAdmin = await http
      .get("/api/admin/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`);

    expect(listAdmin.status).toBe(403);

    const confirm = await http
      .patch("/api/admin/bookings/1/confirm")
      .set("Authorization", `Bearer ${clientLogin.token}`);

    expect(confirm.status).toBe(403);
  });
});
