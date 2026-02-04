import { sequelize } from "../src/config/database";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

beforeAll(async () => {
  await waitForDb();
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});


async function waitForDb(retries = 30) {
  let lastErr: unknown = null;

  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      return;
    } catch (e) {
      lastErr = e;
      await sleep(1000);
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error("DB not ready");
}

export async function connectTestDb() {
  await sequelize.authenticate();
}

export async function syncTestDb() {
  await sequelize.sync({ force: true });
}

export async function resetTestDb() {
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
  await sequelize.truncate({ cascade: true });
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
}

export async function closeTestDb() {
  await sequelize.close();
}

