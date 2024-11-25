export interface AuthOptions {
  username?: string;
  password?: string;
  token?: string;
}

export interface SchemaRegistryOptions {
  baseUrl: string;
  auth?: AuthOptions;
  clientConfig?: {
    timeout?: number;
    headers?: Record<string, string>;
  };
}