import { env } from "./config/env";
import { sequelize } from "./config/database";
import "./models";
import { createApp } from "./app";

const bootstrap = async () => {
  await sequelize.authenticate();

  await sequelize.sync({alter: true});
  const app = createApp();

  app.listen(env.port, () => {
    console.log(`API running on port ${env.port}`);
  });
};

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
