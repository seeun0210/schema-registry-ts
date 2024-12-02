import { request as httpRequest, RequestOptions } from "http";
import { request as httpsRequest } from "https";
import { URL } from "url";
import { AuthOptions } from "../interfaces/SchemaRegistryOptions";
import { createAuthHeader } from "./AuthUtils";
import { SchemaRegistryError } from "../errors/SchemaRegistryError";

interface HttpRequestOptions {
  method: "GET" | "POST" | "DELETE" | "PUT";
  url: string;
  data?: any;
  headers?: Record<string, string>;
}

export class HttpClient {
  private baseUrl: string;
  private authOptions?: AuthOptions;
  private timeout: number;

  constructor(baseUrl: string, authOptions?: AuthOptions, timeout: number = 5000) {
    this.baseUrl = baseUrl;
    this.authOptions = authOptions;
    this.timeout = timeout;
  }

  async request<T>({ method, url, data, headers = {} }: HttpRequestOptions): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      try {
        const fullUrl = new URL(url, this.baseUrl);
        const isHttps = fullUrl.protocol === "https:";
        
        const requestOptions: RequestOptions = {
          method,
          hostname: fullUrl.hostname,
          port: fullUrl.port ? parseInt(fullUrl.port) : isHttps ? 443 : 80,
          path: fullUrl.pathname + fullUrl.search,
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

        if (data) {
          req.write(JSON.stringify(data));
        }

        req.end();
      } catch (error) {
        reject(new SchemaRegistryError(`Unexpected error: ${error.message}`));
      }
    });
  }
}
