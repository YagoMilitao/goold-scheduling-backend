import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./modules/auth/auth.routes";
import bookingsRoutes from "./modules/bookings/bookings.routes";
import { errorMiddleware } from "./shared/middleware/error.middleware";
import clientAuthRoutes from "./modules/auth/client.auth.routes";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));
  app.use(
    cors({
      origin: ["http://localhost:3000"],
      credentials: true
    })
  );

  app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

  app.use("/api", authRoutes);
  app.use("/api", bookingsRoutes);
  app.use("/api", clientAuthRoutes);
  
  app.use(errorMiddleware);

  return app;
};
