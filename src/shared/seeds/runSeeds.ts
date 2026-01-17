import { seedRooms } from "./seedRooms";
import { sequelize } from "../../config/database";

(async () => {
  try {
    await seedRooms();
  } catch (e) {
    console.error(e);
  } finally {
    await sequelize.close();
  }
})();
