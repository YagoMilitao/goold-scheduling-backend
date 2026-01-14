import { Booking } from "./Booking";
import { Room } from "./Room";
import { User } from "./User";

User.hasMany(Booking, { foreignKey: "userId", as: "bookings" });
Booking.belongsTo(User, { foreignKey: "userId", as: "user" });

Room.hasMany(Booking, { foreignKey: "roomId", as: "bookings" });
Booking.belongsTo(Room, { foreignKey: "roomId", as: "room" });

export { User, Room, Booking };
