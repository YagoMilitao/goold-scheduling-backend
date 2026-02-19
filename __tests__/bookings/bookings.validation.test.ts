import { http } from "../../test/testApp";
import { createUser } from "../../test/factories/user.factory";
import { loginAdmin, loginClient } from "../../test/helpers/auth.helper";

jest.setTimeout(30000);

function formatDate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function bootstrap() {
  const uid = Date.now();

  const adminEmail = `admin-v-${uid}@portal.com`;
  const clientEmail = `client-v-${uid}@portal.com`;
  const roomName = `Sala Validação ${uid}`;

  await createUser({
    name: "Admin",
    lastName: "Portal",
    email: adminEmail,
    password: "Admin@123",
    role: "ADMIN"
  });

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

  const createRoomRes = await http
    .post("/api/admin/rooms")
    .set("Authorization", `Bearer ${adminLogin.token}`)
    .send({ name: roomName, startTime: "08:00", endTime: "18:00", slotMinutes: 30 });

  expect([200, 201]).toContain(createRoomRes.status);

  const listRoomsRes = await http
    .get("/api/admin/rooms")
    .set("Authorization", `Bearer ${adminLogin.token}`);

  expect(listRoomsRes.status).toBe(200);

  const room = (listRoomsRes.body.items ?? []).find((r: any) => r.name === roomName);
  expect(room).toBeTruthy();

  return { adminLogin, clientLogin, room };
}

describe("Bookings validations", () => {
  it("should block booking in the past (422)", async () => {
    const { clientLogin, room } = await bootstrap();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const date = formatDate(yesterday);
    const time = "10:00";

    const res = await http
      .post("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`)
      .send({ roomId: room.id, date, time });

    expect(res.status).toBe(422);
  });

  it("should block booking outside room working hours (422)", async () => {
    const { clientLogin, room } = await bootstrap();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const date = formatDate(tomorrow);
    const time = "07:30";

    const res = await http
      .post("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`)
      .send({ roomId: room.id, date, time });

    expect(res.status).toBe(422);
  });

  it("should block booking with misaligned slot time (422)", async () => {
    const { clientLogin, room } = await bootstrap();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const date = formatDate(tomorrow);
    const time = "10:15";

    const res = await http
      .post("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`)
      .send({ roomId: room.id, date, time });

    expect(res.status).toBe(422);
  });

  it("should block booking conflict in same room+time (409)", async () => {
    const { clientLogin, room } = await bootstrap();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const date = formatDate(tomorrow);
    const time = "10:00";

    const first = await http
      .post("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`)
      .send({ roomId: room.id, date, time });

    expect([200, 201]).toContain(first.status);

    const second = await http
      .post("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`)
      .send({ roomId: room.id, date, time });

    expect(second.status).toBe(409);
  });
});
