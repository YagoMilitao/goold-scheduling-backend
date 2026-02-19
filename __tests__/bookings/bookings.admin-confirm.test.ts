import { http } from "../../test/testApp";
import { createUser } from "../../test/factories/user.factory";
import { loginAdmin, loginClient } from "../../test/helpers/auth.helper";

/**
 * Helper para gerar uma data futura válida no formato ISO
 * Isso evita erro de "data passada" nos testes
 */
function buildTomorrowLocalDateTime(hour: number, minute: number) {
  const d = new Date();

  // Avança 1 dia (amanhã)
  d.setDate(d.getDate() + 1);

  // Define hora e minuto
  d.setHours(hour, minute, 0, 0);

  // Constrói string ISO manualmente (sem timezone explícito)
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:00`;
}

describe("Bookings – Admin confirmation rules", () => {
  /**
   * TESTE 1
   * ADMIN pode confirmar um booking apenas se o status for EM_ANALISE
   */
  it("ADMIN should confirm booking when status is EM_ANALISE", async () => {
    const uid = Date.now();

    // Emails únicos para evitar conflito no banco
    const adminEmail = `admin-${uid}@portal.com`;
    const clientEmail = `client-${uid}@portal.com`;

    /**
     * Criação de usuários reais no banco
     */
    await createUser({
      name: "Admin",
      email: adminEmail,
      password: "Admin@123",
      role: "ADMIN"
    });

    await createUser({
      name: "Client",
      email: clientEmail,
      password: "Client@123",
      role: "CLIENT",
      isActive: true,
      canViewBookings: true
    });

    /**
     * Login real (gera JWT real)
     */
    const adminLogin = await loginAdmin(adminEmail, "Admin@123");
    const clientLogin = await loginClient(clientEmail, "Client@123");

    /**
     * ADMIN cria uma sala válida
     */
    const roomRes = await http
      .post("/api/admin/rooms")
      .set("Authorization", `Bearer ${adminLogin.token}`)
      .send({
        name: `Sala ${uid}`,
        startTime: "08:00",
        endTime: "18:00",
        slotMinutes: 30
      });

    expect([200, 201]).toContain(roomRes.status);

    /**
     * ADMIN lista salas para obter o ID
     */
    const roomsList = await http
      .get("/api/admin/rooms")
      .set("Authorization", `Bearer ${adminLogin.token}`);

    const room = roomsList.body.items[0];
    expect(room).toBeTruthy();

    /**
     * CLIENT cria um booking (status inicial = EM_ANALISE)
     */
    const scheduledAt = buildTomorrowLocalDateTime(10, 0);

    const createBooking = await http
      .post("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`)
      .send({
        roomId: room.id,
        scheduledAt
      });

    expect([200, 201]).toContain(createBooking.status);

    /**
     * CLIENT lista seus bookings
     */
    const clientBookings = await http
      .get("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`);

    const booking = clientBookings.body.items[0];
    expect(booking.status).toBe("EM_ANALISE");

    /**
     * ADMIN confirma o booking
     */
    const confirmRes = await http
      .patch(`/api/admin/bookings/${booking.id}/confirm`)
      .set("Authorization", `Bearer ${adminLogin.token}`);

    expect(confirmRes.status).toBe(200);

    /**
     * CLIENT lista novamente e verifica status atualizado
     */
    const afterConfirm = await http
      .get("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`);

    const updated = afterConfirm.body.items[0];
    expect(updated.status).toBe("AGENDADO");
  });

  /**
   * TESTE 2
   * CLIENT não pode confirmar booking (403)
   */
  it("CLIENT should NOT confirm booking (403)", async () => {
    const uid = Date.now();

    const adminEmail = `admin2-${uid}@portal.com`;
    const clientEmail = `client2-${uid}@portal.com`;

    await createUser({
      name: "Admin",
      email: adminEmail,
      password: "Admin@123",
      role: "ADMIN"
    });

    await createUser({
      name: "Client",
      email: clientEmail,
      password: "Client@123",
      role: "CLIENT",
      isActive: true,
      canViewBookings: true
    });

    const adminLogin = await loginAdmin(adminEmail, "Admin@123");
    const clientLogin = await loginClient(clientEmail, "Client@123");

    const roomRes = await http
      .post("/api/admin/rooms")
      .set("Authorization", `Bearer ${adminLogin.token}`)
      .send({
        name: `Sala ${uid}`,
        startTime: "08:00",
        endTime: "18:00",
        slotMinutes: 30
      });

    const roomsList = await http
      .get("/api/admin/rooms")
      .set("Authorization", `Bearer ${adminLogin.token}`);

    const room = roomsList.body.items[0];

    const scheduledAt = buildTomorrowLocalDateTime(11, 0);

    await http
      .post("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`)
      .send({
        roomId: room.id,
        scheduledAt
      });

    const clientBookings = await http
      .get("/api/bookings")
      .set("Authorization", `Bearer ${clientLogin.token}`);

    const booking = clientBookings.body.items[0];

    /**
     * CLIENT tenta confirmar (não permitido)
     */
    const forbiddenConfirm = await http
      .patch(`/api/admin/bookings/${booking.id}/confirm`)
      .set("Authorization", `Bearer ${clientLogin.token}`);

    expect(forbiddenConfirm.status).toBe(403);
  });
});
