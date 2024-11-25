// utils/AuthUtils.ts

import { AuthOptions } from "../interfaces/SchemaRegistryOptions";

export function createAuthHeader(authOptions?: AuthOptions): string | null {
  if (!authOptions) return null;

  if (authOptions.username && authOptions.password) {
    const credentials = `${authOptions.username}:${authOptions.password}`;
    const encoded = Buffer.from(credentials).toString("base64");
    return `Basic ${encoded}`;
  } else if (authOptions.token) {
    return `Bearer ${authOptions.token}`;
  }

  return null;
}
