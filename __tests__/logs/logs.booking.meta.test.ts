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

describe("Logs - booking meta", () => {
  it("should include meta for create and cancel booking logs", async () => {
    const uid = Date.now();

    const adminEmail = `admin-lm-${uid}@portal.com`;
    const clientEmail = `client-lm-${uid}@portal.com`;
    const roomName = `Sala LogsMeta ${uid}`;

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

    const room = (listRoomsRes.body.items ?? []).find((r: any) => r.name === roomName);
    expect(room).toBeTruthy();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const date = formatDate(tomorrow);
    const time = "10:00";

    const createBookingRes = await http
      .post("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`)
      .send({ roomId: room.id, date, time });

    expect([200, 201]).toContain(createBookingRes.status);

    const listBookings = await http
      .get("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`);

    const created = (listBookings.body.items ?? []).find((b: any) => b.room?.id === room.id && b.status === "EM_ANALISE");
    expect(created).toBeTruthy();

    const bookingId = created.id;

    const cancelRes = await http
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${clientLogin.token}`);

    expect(cancelRes.status).toBe(200);

    const logsRes = await http
      .get("/api/logs")
      .set("Authorization", `Bearer ${clientLogin.token}`)
      .query({ order: "desc" });

    expect(logsRes.status).toBe(200);

    const items = logsRes.body.items ?? [];

    const createLog = items.find(
      (l: any) => l.module === "AGENDAMENTOS" && l.activityType === "Criação de agendamento" && l.meta?.bookingId === bookingId
    );

    expect(createLog).toBeTruthy();
    expect(createLog.meta.roomId).toBe(room.id);
    expect(createLog.meta.date).toBe(date);
    expect(createLog.meta.time).toBe(time);

    const cancelLog = items.find(
      (l: any) => l.module === "AGENDAMENTOS" && l.activityType === "Cancelamento de agendamento" && l.meta?.bookingId === bookingId
    );

    expect(cancelLog).toBeTruthy();
    expect(cancelLog.meta.bookingId).toBe(bookingId);
  });
});
