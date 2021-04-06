import { Fetcher, IndexedFormula } from "rdflib";
import { findAll, FindAllArgs } from "./handlers/findAll";
import { findOne, FindUniqueArgs } from "./handlers/findOne";
import { validatedToDataResult } from "./rdfTransform";
import { validateShex } from "./validate";
const shex = require("shex");

export interface QueryResult<Type> {
  errors: string[];
  data: Type;
  from: string | string[];
}

export interface ShapeConstructorArgs {
  id: string;
  shape: string;
  context: Record<string, string>;
  type: Record<string, string> | string[];
}

export class Shape<ShapeType> {
  id: string;
  shape: string;
  schema: any;
  prefixes: any;
  type: string[];
  context: Record<string, string>;
  store: IndexedFormula;
  fetcher: Fetcher;
  findAll: (args: FindAllArgs<ShapeType>) => Promise<QueryResult<ShapeType[]>>;
  findOne: (args: FindUniqueArgs) => Promise<QueryResult<ShapeType>>;
  validateShex: (ids: string[]) => any;
  validatedToDataResult: (
    validated: any,
    baseUrl: string,
    shapeUrl: string
  ) => ShapeType;
  constructor({ id, shape, context, type }: ShapeConstructorArgs) {
    this.id = id;
    this.shape = shape;
    this.schema = shex.Parser.construct(this.id).parse(this.shape);
    this.prefixes = {
      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
      ...this.schema.prefixes,
    };
    this.type = Object.values(type);
    this.context = context;
    this.store = new IndexedFormula();
    this.fetcher = new Fetcher(this.store);

    this.findAll = function (
      this: Shape<ShapeType>,
      args: FindAllArgs<ShapeType>
    ) {
      return findAll<ShapeType>(this, args);
    }.bind(this);
    this.findOne = function (this: Shape<ShapeType>, args: FindUniqueArgs) {
      return findOne<ShapeType>(this, args);
    }.bind(this);
    this.validateShex = function (this: Shape<ShapeType>, ids: string[]) {
      return validateShex<ShapeType>(this, ids);
    }.bind(this);
    this.validatedToDataResult = function (
      this: Shape<ShapeType>,
      validated: any,
      baseUrl: string,
      shapeUrl: string
    ) {
      return validatedToDataResult<ShapeType>(
        this,
        validated,
        baseUrl,
        shapeUrl
      );
    }.bind(this);
  }
}
