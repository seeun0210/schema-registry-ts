import { HttpClient } from "../utils/HttpClient";
import { SchemaRegistryError } from "../errors/SchemaRegistryError";
import { AuthOptions } from "../interfaces/SchemaRegistryOptions";

interface Schema {
  schema: string;
}

interface CompatibilityResponse {
  isCompatible: boolean;
}

export class SchemaService {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  async registerSchema(subject: string, schema: string): Promise<{ id: number }> {
    const path = `/subjects/${subject}/versions`;
    try {
      const response = await this.httpClient.request<{ id: number }>({
        method: "POST",
        url: path,
        data: { schema },
      });
      return response;
    } catch (error) {
      throw new SchemaRegistryError(`Failed to register schema: ${error.message}`);
    }
  }

  async getAllSubjects(): Promise<string[]> {
    const path = `/subjects`;
    try {
      const response = await this.httpClient.request<string[]>({
        method: "GET",
        url: path,
      });
      return response;
    } catch (error) {
      throw new SchemaRegistryError(`Failed to get subjects: ${error.message}`);
    }
  }

  async getSubjectVersions(subject: string): Promise<number[]> {
    const path = `/subjects/${subject}/versions`;
    try {
      const response = await this.httpClient.request<number[]>({
        method: "GET",
        url: path,
      });
      return response;
    } catch (error) {
      throw new SchemaRegistryError(`Failed to get versions for subject: ${error.message}`);
    }
  }

  async getSchemaById(schemaId: number): Promise<Schema> {
    const path = `/schemas/ids/${schemaId}`;
    try {
      const response = await this.httpClient.request<Schema>({
        method: "GET",
        url: path,
      });
      return response;
    } catch (error) {
      throw new SchemaRegistryError(`Failed to fetch schema by ID: ${error.message}`);
    }
  }

  async checkCompatibility(subject: string, schema: string): Promise<CompatibilityResponse> {
    const path = `/compatibility/subjects/${subject}/versions/latest`;
    try {
      const response = await this.httpClient.request<CompatibilityResponse>({
        method: "POST",
        url: path,
        data: { schema },
      });
      return response;
    } catch (error) {
      throw new SchemaRegistryError(`Failed to check schema compatibility: ${error.message}`);
    }
  }

  async deleteSchemaById(schemaId: number): Promise<void> {
    const path = `/schemas/ids/${schemaId}`;
    try {
      await this.httpClient.request<void>({
        method: "DELETE",
        url: path,
      });
    } catch (error) {
      throw new SchemaRegistryError(`Failed to delete schema: ${error.message}`);
    }
  }

  async getSchemaVersion(subject: string, version: number): Promise<Schema> {
    const path = `/subjects/${subject}/versions/${version}`;
    try {
      const response = await this.httpClient.request<Schema>({
        method: "GET",
        url: path,
      });
      return response;
    } catch (error) {
      throw new SchemaRegistryError(`Failed to fetch schema version: ${error.message}`);
    }
  }

  async checkVersionCompatibility(subject: string, version: number, schema: string): Promise<CompatibilityResponse> {
    const path = `/compatibility/subjects/${subject}/versions/${version}`;
    try {
      const response = await this.httpClient.request<CompatibilityResponse>({
        method: "POST",
        url: path,
        data: { schema },
      });
      return response;
    } catch (error) {
      throw new SchemaRegistryError(`Failed to check version compatibility: ${error.message}`);
    }
  }

  async updateSchemaVersion(subject: string, version: number, schema: string): Promise<{ id: number }> {
    const path = `/subjects/${subject}/versions/${version}`;
    try {
      const response = await this.httpClient.request<{ id: number }>({
        method: "PUT",
        url: path,
        data: { schema },
      });
      return response;
    } catch (error) {
      throw new SchemaRegistryError(`Failed to update schema version: ${error.message}`);
    }
  }
}
