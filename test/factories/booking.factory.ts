import { Booking } from "../../src/models/Booking";

export async function createBooking(input: {
  scheduledAt: Date;
  status: "EM_ANALISE" | "AGENDADO" | "CANCELADO";
  createdByRole: "ADMIN" | "CLIENT";
  userId: number;
  roomId: number;
}) {
  const booking = await Booking.create({
    scheduledAt: input.scheduledAt,
    status: input.status,
    createdByRole: input.createdByRole,
    userId: input.userId,
    roomId: input.roomId,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return booking;
}