import { SchemaRegistryClient } from "../client/SchemaRegistryClient";
import { Type, Schema } from "avsc";

export class AvroSerializer {
  private typeCache: Map<number, Type> = new Map();

  constructor(private registryClient: SchemaRegistryClient) {}

  async encode(schemaId: number, payload: any): Promise<Buffer> {
    let type = this.typeCache.get(schemaId);

    if (!type) {
      const schema = (await this.registryClient.getSchemaById(
        schemaId
      )) as Schema;
      type = Type.forSchema(schema);
      this.typeCache.set(schemaId, type);
    }

    const payloadBuffer = type.toBuffer(payload);
    const message = Buffer.alloc(payloadBuffer.length + 5);

    message.writeUInt8(0, 0);
    message.writeUInt32BE(schemaId, 1);
    payloadBuffer.copy(message, 5);

    return message;
  }

  async decode(buffer: Buffer): Promise<{ schemaId: number; payload: any }> {
    const magicByte = buffer.readUInt8(0);
    if (magicByte !== 0) {
      throw new Error("Unknown magic byte!");
    }

    const schemaId = buffer.readUInt32BE(1);
    let type = this.typeCache.get(schemaId);

    if (!type) {
      const schema = (await this.registryClient.getSchemaById(
        schemaId
      )) as Schema;
      type = Type.forSchema(schema);
      this.typeCache.set(schemaId, type);
    }

    const payloadBuffer = buffer.slice(5);
    const payload = type.fromBuffer(payloadBuffer);

    return { schemaId, payload };
  }
}
