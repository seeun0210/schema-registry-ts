import "reflect-metadata";
import { SchemaType } from "../interfaces/SchemaType";

export interface SchemaOptions {
  subject: string;
  schema: object;
  schemaType?: SchemaType;
}

export function Schema(options: SchemaOptions) {
  return function (constructor: Function) {
    Reflect.defineMetadata("schema:options", options, constructor);
  };
}
