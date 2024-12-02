import { AuthOptions } from "../interfaces/SchemaRegistryOptions";

export function createAuthHeader(authOptions?: AuthOptions): string | null {
  if (!authOptions) return null;

  if (authOptions.username && authOptions.password) {
    const credentials = `${authOptions.username}:${authOptions.password}`;
    const encoded = Buffer.from(credentials).toString("base64");
    return `Basic ${encoded}`;
  } else if (authOptions.token) {
    return `Bearer ${authOptions.token}`;
  } else if (authOptions.apiKey) {
    return `ApiKey ${authOptions.apiKey}`;
  }

  return null;
}

