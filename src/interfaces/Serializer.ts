// interfaces/Serializer.ts

export interface Serializer {
  serialize(schema: object, payload: any): Buffer;
  deserialize(schema: object, payload: Buffer): any;
}
