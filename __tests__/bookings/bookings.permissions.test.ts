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

  const adminEmail = `admin-p-${uid}@portal.com`;
  const client1Email = `client1-p-${uid}@portal.com`;
  const client2Email = `client2-p-${uid}@portal.com`;
  const roomName = `Sala Permissoes ${uid}`;

  await createUser({
    name: "Admin",
    lastName: "Portal",
    email: adminEmail,
    password: "Admin@123",
    role: "ADMIN"
  });

  await createUser({
    name: "Client1",
    lastName: "Demo",
    email: client1Email,
    password: "Client@123",
    role: "CLIENT",
    isActive: true,
    canViewBookings: true,
    canViewLogs: true
  });

  await createUser({
    name: "Client2",
    lastName: "Demo",
    email: client2Email,
    password: "Client@123",
    role: "CLIENT",
    isActive: true,
    canViewBookings: true,
    canViewLogs: true
  });

  const adminLogin = await loginAdmin(adminEmail, "Admin@123");
  const client1Login = await loginClient(client1Email, "Client@123");
  const client2Login = await loginClient(client2Email, "Client@123");

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

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const date = formatDate(tomorrow);
  const time = "10:00";

  return { adminLogin, client1Login, client2Login, room, date, time };
}

async function createBooking(clientToken: string, roomId: number, date: string, time: string) {
  const res = await http
    .post("/api/bookings")
    .set("Authorization", `Bearer ${clientToken}`)
    .send({ roomId, date, time });

  expect([200, 201]).toContain(res.status);

  const listRes = await http.get("/api/bookings").set("Authorization", `Bearer ${clientToken}`);
  expect(listRes.status).toBe(200);

  const created = (listRes.body.items ?? []).find((x: any) => x.room?.id === roomId && x.status === "EM_ANALISE");
  expect(created).toBeTruthy();

  return created.id as number;
}

describe("Bookings - permissions & state rules", () => {
  it("CLIENT cannot cancel another user's booking (404)", async () => {
    const { client1Login, client2Login, room, date, time } = await bootstrap();

    const bookingId = await createBooking(client1Login.token, room.id, date, time);

    const cancelByOther = await http
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${client2Login.token}`);

    expect(cancelByOther.status).toBe(404);
  });

  it("CLIENT cannot cancel a booking that is already CANCELADO (404)", async () => {
    const { client1Login, room, date, time } = await bootstrap();

    const bookingId = await createBooking(client1Login.token, room.id, date, time);

    const firstCancel = await http
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${client1Login.token}`);

    expect(firstCancel.status).toBe(200);

    const secondCancel = await http
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${client1Login.token}`);

    expect(secondCancel.status).toBe(404);
  });

  it("ADMIN cancel should free the slot, allowing a new booking at same time (201)", async () => {
    const { adminLogin, client1Login, room, date, time } = await bootstrap();

    const bookingId = await createBooking(client1Login.token, room.id, date, time);

    const adminCancel = await http
      .patch(`/api/admin/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${adminLogin.token}`);

    expect([200, 204]).toContain(adminCancel.status);

    const createAgain = await http
      .post("/api/bookings")
      .set("Authorization", `Bearer ${client1Login.token}`)
      .send({ roomId: room.id, date, time });

    expect([200, 201]).toContain(createAgain.status);
  });
});
