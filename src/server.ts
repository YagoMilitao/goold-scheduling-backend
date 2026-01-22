import { env } from "./config/env";
import { sequelize } from "./config/database";
import "./models";
import { createApp } from "./app";

const bootstrap = async () => {
  await sequelize.authenticate();

  const isProd = env.nodeEnv === "production";

  if (!isProd) {
    await sequelize.sync({ alter: true });
  }

  const app = createApp();

  const port = Number(process.env.PORT || env.port || 3001);

  app.listen(port, () => {
    console.log(`API running on port ${port}`);
  });
};

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});