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

describe("Bookings flow", () => {
  it("CLIENT creates booking -> ADMIN confirms only EM_ANALISE -> CLIENT cancels", async () => {
    const uid = Date.now();

    const adminEmail = `admin-${uid}@portal.com`;
    const clientEmail = `client-${uid}@portal.com`;
    const roomName = `Sala Teste ${uid}`;

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

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const date = formatDate(tomorrow);
    const time = "10:00";

    const createRes = await http
      .post("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`)
      .send({ roomId: room.id, date, time });

    if (![200, 201].includes(createRes.status)) {
      console.log("Create booking failed:", createRes.status, JSON.stringify(createRes.body, null, 2));
    }

    expect([200, 201]).toContain(createRes.status);

    const listClientRes = await http
      .get("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`);

    expect(listClientRes.status).toBe(200);

    const created = (listClientRes.body.items ?? []).find((x: any) => x.room?.id === room.id);
    expect(created).toBeTruthy();
    expect(created.status).toBe("EM_ANALISE");

    const bookingId = created.id;

    const confirmRes = await http
      .patch(`/api/admin/bookings/${bookingId}/confirm`)
      .set("Authorization", `Bearer ${adminLogin.token}`);

    expect(confirmRes.status).toBe(200);

    const cancelRes = await http
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${clientLogin.token}`);

    expect(cancelRes.status).toBe(200);

    const listAfterRes = await http
      .get("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`);

    const after = (listAfterRes.body.items ?? []).find((x: any) => x.id === bookingId);
    expect(after).toBeTruthy();
    expect(after.status).toBe("CANCELADO");
  });

  it("ADMIN cannot confirm a booking that is not EM_ANALISE", async () => {
    const uid = Date.now();

    const adminEmail = `admin2-${uid}@portal.com`;
    const clientEmail = `client2-${uid}@portal.com`;
    const roomName = `Sala Teste 2 ${uid}`;

    await createUser({
      name: "Admin",
      lastName: "2",
      email: adminEmail,
      password: "Admin@123",
      role: "ADMIN"
    });

    await createUser({
      name: "Client",
      lastName: "2",
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

    const listRoomsRes = await http
      .get("/api/admin/rooms")
      .set("Authorization", `Bearer ${adminLogin.token}`);

    const room = (listRoomsRes.body.items ?? []).find((r: any) => r.name === roomName);
    expect(room).toBeTruthy();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const date = formatDate(tomorrow);
    const time = "11:00";

    const createRes = await http
      .post("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`)
      .send({ roomId: room.id, date, time });

    if (![200, 201].includes(createRes.status)) {
      console.log("Create booking failed:", createRes.status, JSON.stringify(createRes.body, null, 2));
    }

    expect([200, 201]).toContain(createRes.status);

    const listClientRes = await http
      .get("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`);

    const created = (listClientRes.body.items ?? []).find((x: any) => x.room?.id === room.id);
    expect(created).toBeTruthy();

    const bookingId = created.id;

    const cancelRes = await http
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${clientLogin.token}`);

    expect(cancelRes.status).toBe(200);

    const confirmRes = await http
      .patch(`/api/admin/bookings/${bookingId}/confirm`)
      .set("Authorization", `Bearer ${adminLogin.token}`);

    expect([400, 409, 422]).toContain(confirmRes.status);
  });
});
