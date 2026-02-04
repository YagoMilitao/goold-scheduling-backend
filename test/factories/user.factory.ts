import { User } from "../../src/models";
import { hashPassword } from "../../src/shared/utils/password";

type CreateUserInput = {
  name: string;
  lastName?: string;
  email: string;
  password: string;
  role: "ADMIN" | "CLIENT";
  isActive?: boolean;
  canViewBookings?: boolean;
  canViewLogs?: boolean;
};

export async function createUser(input: CreateUserInput) {
  const isClient = input.role === "CLIENT";
  const password = input.password ?? (input.role === "ADMIN" ? "Admin@123" : "Client@123");
  const passwordHash = await hashPassword(password);

  const user = await User.create({
    name: input.name,
    lastName: input.lastName ?? null,
    email: input.email,
    passwordHash,
    role: input.role,

    isActive: input.isActive ?? (isClient ? true : true),
    canViewBookings: input.canViewBookings ?? (isClient ? true : true),
    canViewLogs: input.canViewLogs ?? (isClient ? true : true)
  } as any);

  return user;
}
