import { request as httpRequest, RequestOptions } from "http";
import { request as httpsRequest } from "https";
import { URL } from "url";
import { AuthOptions } from "../interfaces/SchemaRegistryOptions";
import { createAuthHeader } from "./AuthUtils";
import { SchemaRegistryError } from "../errors/SchemaRegistryError";

// Make HttpClient more flexible with generics
export class HttpClient {
  private baseUrl: string;
  private authOptions?: AuthOptions;
  private timeout: number;

  constructor(baseUrl: string, authOptions?: AuthOptions, timeout: number = 5000) {
    this.baseUrl = baseUrl;
    this.authOptions = authOptions;
    this.timeout = timeout;
  }

  async request<T>(
    method: "GET" | "POST" | "DELETE" | "PUT" ,
    path: string,
    body?: string,
    headers: Record<string, string> = {}
  ): Promise<T> {
    try {
      const url = new URL(path, this.baseUrl);
      const isHttps = url.protocol === "https:";
      const requestOptions: RequestOptions = {
        method,
        hostname: url.hostname,
        port: url.port ? parseInt(url.port) : isHttps ? 443 : 80,
        path: url.pathname + url.search,
        headers: {
          "Content-Type": "application/vnd.schemaregistry.v1+json",
          ...headers,
        },
        timeout: this.timeout,
      };

      const authHeader = createAuthHeader(this.authOptions);
      if (authHeader) {
        requestOptions.headers!["Authorization"] = authHeader;
      }

      const req = (isHttps ? httpsRequest : httpRequest)(requestOptions, (res) => {
        let responseData = "";
        res.setEncoding("utf-8");

        res.on("data", (chunk) => {
          responseData += chunk;
        });

        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(responseData) as T);
            } catch (parseError) {
              reject(new SchemaRegistryError("Failed to parse response", res.statusCode));
            }
          } else {
            const error = new SchemaRegistryError(
              `HTTP ${res.statusCode}: ${res.statusMessage}`,
              res.statusCode
            );
            (error as any).responseBody = responseData;
            reject(error);
          }
        });
      });

      req.on("error", (err) => {
        reject(new SchemaRegistryError(`Network error: ${err.message}`));
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new SchemaRegistryError("Request timed out", 408));
      });

      if (body) {
        req.write(body);
      }

      req.end();
    } catch (error) {
      throw new SchemaRegistryError(`Unexpected error: ${error.message}`);
    }
  }
}
