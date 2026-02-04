import { http } from "../../test/testApp";
import { createUser } from "../../test/factories/user.factory";
import { loginAdmin, loginClient } from "../../test/helpers/auth.helper";

/**
 * Gera um datetime local "amanhã" em HH:mm, mas retorna como string ISO-like
 * com timezone offset explícito (ex: 2026-02-03T10:00:00-03:00).
 *
 * Isso evita comportamento diferente entre ambientes (CI, Linux, timezone diferente, etc).
 */
function buildTomorrowLocalDateTimeWithOffset(hour: number, minute: number) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, minute, 0, 0);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = "00";

  // getTimezoneOffset() retorna minutos para "UTC - Local"
  // Ex: Brasil (-03:00) -> offset = 180
  const offsetMinutes = d.getTimezoneOffset();
  const sign = offsetMinutes <= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const offH = String(Math.floor(abs / 60)).padStart(2, "0");
  const offM = String(abs % 60).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}${sign}${offH}:${offM}`;
}

describe("Bookings flow", () => {
  jest.setTimeout(20000); // Increase timeout to 20 seconds for slow HTTP tests
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

    // IMPORTANT: envia scheduledAt com offset explícito (evita variação de timezone)
    const scheduledAt = buildTomorrowLocalDateTimeWithOffset(10, 0);

    const createRes = await http
      .post("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`)
      .send({ roomId: room.id, scheduledAt });

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

    const scheduledAt = buildTomorrowLocalDateTimeWithOffset(11, 0);

    const createRes = await http
      .post("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`)
      .send({ roomId: room.id, scheduledAt });

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
