import { http } from "../../test/testApp";
import { createUser } from "../../test/factories/user.factory";
import { loginAdmin, loginClient } from "../../test/helpers/auth.helper";

function buildTomorrowLocalDateTime(hour: number, minute: number) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, minute, 0, 0);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = "00";

  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
}

describe("Bookings rules", () => {
  it("should block booking outside room working hours (422)", async () => {
    const uid = Date.now();
    const adminEmail = `admin-hours-${uid}@portal.com`;
    const clientEmail = `client-hours-${uid}@portal.com`;
    const roomName = `Sala Horario ${uid}`;

    await createUser({ name: "Admin", lastName: "Portal", email: adminEmail, password: "Admin@123", role: "ADMIN" });

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

    const adminLogin = await loginAdmin(adminEmail, "Admin@123");
    const clientLogin = await loginClient(clientEmail, "Client@123");

    await http
      .post("/api/admin/rooms")
      .set("Authorization", `Bearer ${adminLogin.token}`)
      .send({ name: roomName, startTime: "08:00", endTime: "18:00", slotMinutes: 30 });

    const rooms = await http.get("/api/admin/rooms").set("Authorization", `Bearer ${adminLogin.token}`);
    const room = (rooms.body.items ?? []).find((r: any) => r.name === roomName);
    expect(room).toBeTruthy();

    const scheduledAt = buildTomorrowLocalDateTime(7, 0);

    const res = await http
      .post("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`)
      .send({ roomId: room.id, scheduledAt });

    expect(res.status).toBe(422);
  });

  it("should block booking not aligned with slotMinutes (422)", async () => {
    const uid = Date.now();
    const adminEmail = `admin-slot-${uid}@portal.com`;
    const clientEmail = `client-slot-${uid}@portal.com`;
    const roomName = `Sala Slot ${uid}`;

    await createUser({ name: "Admin", lastName: "Portal", email: adminEmail, password: "Admin@123", role: "ADMIN" });

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

    const adminLogin = await loginAdmin(adminEmail, "Admin@123");
    const clientLogin = await loginClient(clientEmail, "Client@123");

    await http
      .post("/api/admin/rooms")
      .set("Authorization", `Bearer ${adminLogin.token}`)
      .send({ name: roomName, startTime: "08:00", endTime: "18:00", slotMinutes: 30 });

    const rooms = await http.get("/api/admin/rooms").set("Authorization", `Bearer ${adminLogin.token}`);
    const room = (rooms.body.items ?? []).find((r: any) => r.name === roomName);
    expect(room).toBeTruthy();

    const scheduledAt = buildTomorrowLocalDateTime(10, 10);

    const res = await http
      .post("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`)
      .send({ roomId: room.id, scheduledAt });

    expect(res.status).toBe(422);
  });

  it("should block double booking same room+time (409)", async () => {
    const uid = Date.now();
    const adminEmail = `admin-conflict-${uid}@portal.com`;
    const clientEmail = `client-conflict-${uid}@portal.com`;
    const roomName = `Sala Conflito ${uid}`;

    await createUser({ name: "Admin", lastName: "Portal", email: adminEmail, password: "Admin@123", role: "ADMIN" });

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

    const adminLogin = await loginAdmin(adminEmail, "Admin@123");
    const clientLogin = await loginClient(clientEmail, "Client@123");

    await http
      .post("/api/admin/rooms")
      .set("Authorization", `Bearer ${adminLogin.token}`)
      .send({ name: roomName, startTime: "08:00", endTime: "18:00", slotMinutes: 30 });

    const rooms = await http.get("/api/admin/rooms").set("Authorization", `Bearer ${adminLogin.token}`);
    const room = (rooms.body.items ?? []).find((r: any) => r.name === roomName);
    expect(room).toBeTruthy();

    const scheduledAt = buildTomorrowLocalDateTime(10, 0);

    const first = await http
      .post("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`)
      .send({ roomId: room.id, scheduledAt });

    expect([200, 201]).toContain(first.status);

    const second = await http
      .post("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`)
      .send({ roomId: room.id, scheduledAt });

    expect(second.status).toBe(409);
  });
});
