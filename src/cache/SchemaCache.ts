export class SchemaCache {
  private cache: Map<number, object> = new Map();

  get(schemaId: number): object | undefined {
    return this.cache.get(schemaId);
  }

  set(schemaId: number, schema: object): void {
    this.cache.set(schemaId, schema);
  }

  clear(): void {
    this.cache.clear();
  }
}
