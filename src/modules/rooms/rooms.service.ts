import { Op } from "sequelize";
import { Booking } from "../../models";
import { Room } from "../../models/Room";
import { AppError } from "../../shared/errors/AppError";

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const buildLocalDate = (date: string, time: string) => {
  const [y, mo, da] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);

  const dt = new Date(y, mo - 1, da, hh, mm, 0, 0);

  if (Number.isNaN(dt.getTime())) {
    throw new AppError("Data/hora inválida", 422);
  }

  return dt;
};

export const roomsService = {
  async list() {
    // Busca todas as salas ordenadas por nome
    const rooms = await Room.findAll({ order: [["name", "ASC"]] });

    // Normaliza o retorno para o formato esperado pelo frontend
    return rooms.map((r) => ({
      id: r.id,
      name: r.name,
      startTime: r.startTime,
      endTime: r.endTime,
      slotMinutes: r.slotMinutes
    }));
  },

  async create(input: { name: string; startTime: string; endTime: string; slotMinutes: number }) {
    // Converte horários para minutos para facilitar validações
    const start = timeToMinutes(input.startTime);
    const end = timeToMinutes(input.endTime);

    // Só permitimos horários alinhados em 30 minutos (ex: 08:00, 08:30, 09:00...)
    const isAligned30 = (t: string) => timeToMinutes(t) % 30 === 0;

    // end precisa ser maior que start
    if (end <= start) throw new AppError("Horário final deve ser maior que o inicial", 422);

    // por enquanto, regra do sistema: apenas slots de 30
    if (input.slotMinutes !== 30) throw new AppError("Bloco inválido. Permitido apenas 30 minutos.", 422);

    // startTime e endTime precisam estar em blocos de 30
    if (!isAligned30(input.startTime) || !isAligned30(input.endTime)) {
      throw new AppError("Horários devem ser cadastrados de 30 em 30 minutos", 422);
    }

    // não pode duplicar sala pelo nome
    const exists = await Room.findOne({ where: { name: input.name } });
    if (exists) throw new AppError("Já existe uma sala com esse nome", 409);

    // cria a sala no banco
    const room = await Room.create({
      name: input.name,
      startTime: input.startTime,
      endTime: input.endTime,
      slotMinutes: input.slotMinutes
    });

    // retorna o payload que o frontend precisa
    return {
      id: room.id,
      name: room.name,
      startTime: room.startTime,
      endTime: room.endTime,
      slotMinutes: room.slotMinutes
    };
  },

  async listAvailable(input: { date: string; time: string }) {
    // Construímos a data/hora em formato LOCAL (igual você faz no createClientBookingService)
    // Isso evita inconsistência de timezone/parsing quando usar new Date("YYYY-MM-DDTHH:mm:ss")
    const scheduledAt = buildLocalDate(input.date, input.time);

    // Carrega salas
    const rooms = await Room.findAll({ order: [["name", "ASC"]] });

    // Busca bookings que ocupam exatamente esse scheduledAt e ainda estão ativos (EM_ANALISE/AGENDADO)
    const bookings = await Booking.findAll({
      where: {
        scheduledAt,
        status: { [Op.in]: ["EM_ANALISE", "AGENDADO"] }
      },
      attributes: ["roomId"]
    });

    // Set com ids de salas ocupadas nesse horário
    const busy = new Set(bookings.map((b) => b.roomId));

    // Hora em minutos (ex: "10:30" => 630)
    const t = timeToMinutes(input.time);

    // Para cada sala, define se ela está disponível respeitando:
    // - horário de funcionamento: start <= time < end
    // - alinhamento por slot: (time - start) % slotMinutes === 0
    // - ausência de conflito no banco
    return rooms.map((r) => {
      const start = timeToMinutes(r.startTime);
      const end = timeToMinutes(r.endTime);

      const withinHours = t >= start && t < end;

      const alignedToSlot = withinHours ? (t - start) % r.slotMinutes === 0 : false;

      const available = withinHours && alignedToSlot && !busy.has(r.id);

      return {
        id: r.id,
        name: r.name,
        startTime: r.startTime,
        endTime: r.endTime,
        slotMinutes: r.slotMinutes,
        available
      };
    });
  }
};
