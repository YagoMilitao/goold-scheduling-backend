import { User } from "../src/models/User";
import { Room } from "../src/models/Room";
import { hashPassword } from "../src/shared/utils/password";

export async function createClient(input?: Partial<{ name: string; lastName: string; email: string; password: string }>) {
  const password = input?.password ?? "Client@123";
  const passwordHash = await hashPassword(password);

  const user = await User.create({
    name: input?.name ?? "Cliente",
    lastName: input?.lastName ?? "Demo",
    email: input?.email ?? "cliente@portal.com",
    passwordHash,
    role: "CLIENT",
    cep: "01000-000",
    address: "Rua Teste",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    number: null,
    complement: null
  });

  return { user, password };
}

export async function createAdmin(input?: Partial<{ name: string; email: string; password: string }>) {
  const password = input?.password ?? "Admin@123";
  const passwordHash = await hashPassword(password);

  const user = await User.create({
    name: input?.name ?? "Admin",
    lastName: null,
    email: input?.email ?? "admin@portal.com",
    passwordHash,
    role: "ADMIN",
    cep: "01000-000",
    address: "Rua Teste",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    number: null,
    complement: null
  });

  return { user, password };
}

export async function createRoom(input?: Partial<{ name: string; startTime: string; endTime: string; slotMinutes: number }>) {
  const room = await Room.create({
    name: input?.name ?? "Sala 01",
    startTime: input?.startTime ?? "08:00",
    endTime: input?.endTime ?? "18:00",
    slotMinutes: input?.slotMinutes ?? 30
  });

  return room;
}
