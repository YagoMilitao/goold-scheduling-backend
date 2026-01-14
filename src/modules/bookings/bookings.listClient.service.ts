import { Booking } from "../../models/Booking";
import { Room } from "../../models/Room";
import { User } from "../../models/User";

export const listClientBookingsService = {
  async execute(input: { userId: number }) {
    const items = await Booking.findAll({
      where: { userId: input.userId },
      order: [["scheduledAt", "DESC"]],
      include: [
        { model: Room, as: "room", attributes: ["id", "name"] },
        { model: User, as: "user", attributes: ["id", "name", "role"] }
      ]
    });

    return { items };
  }
};
