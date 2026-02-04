import { Room } from "../../src/models/Room";

export async function createRoom(input: {
  name: string;
  startTime?: string;
  endTime?: string;
  slotMinutes?: number;
}) {
  const room = await Room.create({
    name: input.name,
    startTime: input.startTime ?? "08:00",
    endTime: input.endTime ?? "18:00",
    slotMinutes: input.slotMinutes ?? 30
  });

  return room;
}
