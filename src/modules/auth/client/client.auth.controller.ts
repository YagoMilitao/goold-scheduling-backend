import { Request, Response } from "express";
import { clientAuthService } from "./client.auth.service";


export const clientAuthController = {
  async emailExists(req: Request, res: Response) {
    const email = String(req.query.email ?? "");
    const result = await clientAuthService.emailExists(email);
    res.status(200).json(result);
  },

  async login(req: Request, res: Response) {
    const { email, password } = (req as any).validated.body as { email: string; password: string };
    const result = await clientAuthService.login(email, password);
    res.status(200).json(result);
  },

  async register(req: Request, res: Response) {
  const { name, lastName, email, password, cep, address, neighborhood, city, state, number, complement } =
    (req as any).validated.body as any;

  const result = await clientAuthService.register({
    name,
    lastName,
    email,
    password,
    cep,
    address,
    neighborhood,
    city,
    state,
    number,
    complement
  });

  res.status(201).json(result);
}

};
