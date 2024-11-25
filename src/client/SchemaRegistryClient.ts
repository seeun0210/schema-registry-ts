// client/SchemaRegistryClient.ts

import { HttpClient } from "../utils/HttpClient";
import { SchemaRegistryOptions } from "../interfaces/SchemaRegistryOptions";
import { SchemaCache } from "../cache/SchemaCache";
import { Serializer } from "../interfaces/Serializer";
import { SchemaType } from "../interfaces/SchemaType";
import { SchemaRegistryError } from "../errors/SchemaRegistryError";

export class SchemaRegistryClient {
  private httpClient: HttpClient;
  private cache: SchemaCache;

  constructor(private options: SchemaRegistryOptions) {
    this.httpClient = new HttpClient(
      options.baseUrl,
      options.auth,
      options.clientConfig?.timeout
    );
    this.cache = new SchemaCache();
  }

  async registerSchema(
    subject: string,
    schema: object,
    schemaType: SchemaType = "AVRO"
  ): Promise<number> {
    const path = `/subjects/${encodeURIComponent(subject)}/versions`;
    const requestBody = JSON.stringify({
      schema: JSON.stringify(schema),
      schemaType,
    });

    const headers = {
      "Content-Type": "application/vnd.schemaregistry.v1+json",
    };

    try {
      const { statusCode, body } = await this.httpClient.request(
        "POST",
        path,
        requestBody,
        headers
      );

      if (statusCode === 200 || statusCode === 201) {
        const response = JSON.parse(body);
        return response.id;
      } else {
        throw this.createError(statusCode, body);
      }
    } catch (error) {
      throw new SchemaRegistryError(
        `Failed to register schema: ${error.message}`,
        error.code
      );
    }
  }

  async getSchemaById(schemaId: number): Promise<object> {
    // 캐시 확인
    const cachedSchema = this.cache.get(schemaId);
    if (cachedSchema) {
      return cachedSchema;
    }

    const path = `/schemas/ids/${schemaId}`;
    try {
      const { statusCode, body } = await this.httpClient.request("GET", path);

      if (statusCode === 200) {
        const response = JSON.parse(body);
        const schema = JSON.parse(response.schema);
        this.cache.set(schemaId, schema);
        return schema;
      } else {
        throw this.createError(statusCode, body);
      }
    } catch (error) {
      throw new SchemaRegistryError(
        `Failed to get schema by ID: ${error.message}`,
        error.code
      );
    }
  }

  private createError(statusCode: number, responseBody: string): Error {
    let message = `HTTP ${statusCode}`;
    try {
      const errorResponse = JSON.parse(responseBody);
      if (errorResponse.message) {
        message += ` - ${errorResponse.message}`;
      }
    } catch {
      message += ` - ${responseBody}`;
    }
    const error = new Error(message);
    (error as any).code = statusCode;
    return error;
  }

  // 필요한 추가 메서드 구현...
}
