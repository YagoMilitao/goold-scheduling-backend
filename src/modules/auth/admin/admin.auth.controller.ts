import { Request, Response } from "express";
import { adminAuthService } from "./admin.auth.service";

export const adminAuthController = {
  async loginAdmin(req: Request, res: Response) {
    const { email, password } = (req as any).validated.body as { email: string; password: string };
    const result = await adminAuthService.loginAdmin(email, password);
    res.status(200).json(result);
  }
};
