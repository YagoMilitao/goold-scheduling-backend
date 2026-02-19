import { http } from "../../test/testApp";
import { createUser } from "../../test/factories/user.factory";
import { loginClient, loginAdmin } from "../../test/helpers/auth.helper";

/**
 * Helper para gerar data futura válida
 * Evita erro de data passada
 */
function buildTomorrowLocalDateTime(hour: number, minute: number) {
  const d = new Date();

  // Avança para amanhã
  d.setDate(d.getDate() + 1);

  // Define hora/minuto
  d.setHours(hour, minute, 0, 0);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");

  // Retorna formato aceito pela API
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:00`;
}

describe("Logs – Booking flow", () => {
  it("should create logs when CLIENT creates and cancels a booking", async () => {
    const uid = Date.now();

    const clientEmail = `client-${uid}@portal.com`;
    const adminEmail = `admin-${uid}@portal.com`;

    /**
     * Cria CLIENT com permissão para ver logs
     */
    await createUser({
      name: "Client",
      email: clientEmail,
      password: "Client@123",
      role: "CLIENT",
      isActive: true,
      canViewBookings: true,
      canViewLogs: true
    });

    /**
     * Cria ADMIN (necessário para criar sala)
     */
    await createUser({
      name: "Admin",
      email: adminEmail,
      password: "Admin@123",
      role: "ADMIN"
    });

    /**
     * Login real
     */
    const clientLogin = await loginClient(clientEmail, "Client@123");
    const adminLogin = await loginAdmin(adminEmail, "Admin@123");

    /**
     * ADMIN cria sala
     */
    const roomRes = await http
      .post("/api/admin/rooms")
      .set("Authorization", `Bearer ${adminLogin.token}`)
      .send({
        name: `Sala Logs ${uid}`,
        startTime: "08:00",
        endTime: "18:00",
        slotMinutes: 30
      });

    expect([200, 201]).toContain(roomRes.status);

    /**
     * ADMIN lista salas para obter ID
     */
    const roomsList = await http
      .get("/api/admin/rooms")
      .set("Authorization", `Bearer ${adminLogin.token}`);

    const room = roomsList.body.items[0];
    expect(room).toBeTruthy();

    /**
     * CLIENT cria booking
     * → deve gerar LOG automaticamente
     */
    const scheduledAt = buildTomorrowLocalDateTime(9, 0);

    const createBookingRes = await http
      .post("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`)
      .send({
        roomId: room.id,
        scheduledAt
      });

    expect([200, 201]).toContain(createBookingRes.status);

    /**
     * CLIENT lista bookings para pegar ID
     */
    const bookingsList = await http
      .get("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`);

    const booking = bookingsList.body.items[0];
    expect(booking).toBeTruthy();

    /**
     * CLIENT cancela booking
     * → deve gerar OUTRO LOG automaticamente
     */
    const cancelRes = await http
      .patch(`/api/bookings/${booking.id}/cancel`)
      .set("Authorization", `Bearer ${clientLogin.token}`);

    expect(cancelRes.status).toBe(200);

    /**
     * CLIENT lista seus logs
     */
    const logsRes = await http
      .get("/api/logs")
      .set("Authorization", `Bearer ${clientLogin.token}`);

    expect(logsRes.status).toBe(200);

    const logs = logsRes.body.items ?? [];

    /**
     * Verifica se existe log de criação
     */
    const createLog = logs.find(
      (l: any) =>
        l.module === "AGENDAMENTOS" &&
        l.activityType === "Criação de agendamento"
    );

    expect(createLog).toBeTruthy();

    /**
     * Verifica se existe log de cancelamento
     */
    const cancelLog = logs.find(
      (l: any) =>
        l.module === "AGENDAMENTOS" &&
        l.activityType === "Cancelamento de agendamento"
    );

    expect(cancelLog).toBeTruthy();
  });
});
