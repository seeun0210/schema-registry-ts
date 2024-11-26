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

  // Register a new schema
  async registerSchema(subject: string, schema: string): Promise<{ id: number }> {
    const path = `/subjects/${subject}/versions`;
    const body = JSON.stringify({ schema });
    try {
      return await this.httpClient.request<{ id: number }>("POST", path, body);
    } catch (error) {
      throw new SchemaRegistryError(`Failed to register schema: ${error.message}`);
    }
  }

  // Get all subjects
  async getAllSubjects(): Promise<string[]> {
    const path = `/subjects`;
    try {
      return await this.httpClient.request<string[]>("GET", path);
    } catch (error) {
      throw new SchemaRegistryError(`Failed to get subjects: ${error.message}`);
    }
  }

  // Get versions of a subject
  async getSubjectVersions(subject: string): Promise<number[]> {
    const path = `/subjects/${subject}/versions`;
    try {
      return await this.httpClient.request<number[]>("GET", path);
    } catch (error) {
      throw new SchemaRegistryError(`Failed to get versions for subject: ${error.message}`);
    }
  }

  // Get a schema by its ID
  async getSchemaById(schemaId: number): Promise<Schema> {
    const path = `/schemas/ids/${schemaId}`;
    try {
      return await this.httpClient.request<Schema>("GET", path);
    } catch (error) {
      throw new SchemaRegistryError(`Failed to fetch schema by ID: ${error.message}`);
    }
  }

  // Check schema compatibility for a subject
  async checkCompatibility(subject: string, schema: string): Promise<CompatibilityResponse> {
    const path = `/compatibility/subjects/${subject}/versions/latest`;
    const body = JSON.stringify({ schema });
    try {
      return await this.httpClient.request<CompatibilityResponse>("POST", path, body);
    } catch (error) {
      throw new SchemaRegistryError(`Failed to check schema compatibility: ${error.message}`);
    }
  }

  // Delete a schema by ID
  async deleteSchemaById(schemaId: number): Promise<void> {
    const path = `/schemas/ids/${schemaId}`;
    try {
      await this.httpClient.request<void>("DELETE", path);
    } catch (error) {
      throw new SchemaRegistryError(`Failed to delete schema: ${error.message}`);
    }
  }

  // Get a specific version of a schema for a subject
  async getSchemaVersion(subject: string, version: number): Promise<Schema> {
    const path = `/subjects/${subject}/versions/${version}`;
    try {
      return await this.httpClient.request<Schema>("GET", path);
    } catch (error) {
      throw new SchemaRegistryError(`Failed to fetch schema version: ${error.message}`);
    }
  }

  // Check compatibility for a specific version
  async checkVersionCompatibility(subject: string, version: number, schema: string): Promise<CompatibilityResponse> {
    const path = `/compatibility/subjects/${subject}/versions/${version}`;
    const body = JSON.stringify({ schema });
    try {
      return await this.httpClient.request<CompatibilityResponse>("POST", path, body);
    } catch (error) {
      throw new SchemaRegistryError(`Failed to check version compatibility: ${error.message}`);
    }
  }

  // Update a schema version
  async updateSchemaVersion(subject: string, version: number, schema: string): Promise<{ id: number }> {
    const path = `/subjects/${subject}/versions/${version}`;
    const body = JSON.stringify({ schema });
    try {
      return await this.httpClient.request<{ id: number }>("PUT", path, body);
    } catch (error) {
      throw new SchemaRegistryError(`Failed to update schema version: ${error.message}`);
    }
  }
}
