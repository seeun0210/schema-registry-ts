import { HttpClient } from "../utils/HttpClient";
import { SchemaService } from "../services/SchemaRegistry";
import { AuthOptions } from "../interfaces/SchemaRegistryOptions";

export class SchemaRegistryClient {
  private schemaService: SchemaService;

  constructor(baseUrl: string, authOptions?: AuthOptions, timeout?: number) {
    const httpClient = new HttpClient(baseUrl, authOptions, timeout);
    this.schemaService = new SchemaService(httpClient);
  }

  get schema() {
    return this.schemaService;
  }
}
