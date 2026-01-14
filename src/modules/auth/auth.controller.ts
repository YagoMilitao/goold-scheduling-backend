import { Request, Response } from "express";
import { authService } from "./auth.service";

export const authController = {
  async loginAdmin(req: Request, res: Response) {
    const { email, password } = (req as any).validated.body as { email: string; password: string };
    const result = await authService.loginAdmin(email, password);
    res.status(200).json(result);
  }
};
