import "server-only";
import { getSessionUser } from "@/lib/server-auth";

// Админ — обычный пользователь с role='admin' (назначается через ADMIN_EMAIL
// в scripts/db-setup.mjs). Отдельного входа для админки нет.
export async function isAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  return user?.role === "admin";
}
