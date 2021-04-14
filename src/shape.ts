import { Fetcher, IndexedFormula, Statement, UpdateManager } from "rdflib";
import { dataToStatements } from "./transform/dataToRdf";
import { create, CreateArgs } from "./handlers/create";
import { findAll, FindAllArgs } from "./handlers/findAll";
import { findOne, FindUniqueArgs } from "./handlers/findOne";
import { update, UpdateArgs } from "./handlers/update";
import { DeleteArgs, deleteShape } from "./handlers/delete";
const shex = require("shex");

export interface QueryResult<Type> {
  errors?: string[];
  data?: Type;
  from: string | string[];
}

export interface ShapeConstructorArgs {
  id: string;
  shape: string;
  context: Record<string, string>;
  childContexts?: Record<string, string>[];
  type?: Record<string, string> | string[];
}

export class Shape<ShapeType> {
  id: string;
  shape: string;
  schema: any;
  prefixes: any;
  type?: string[];
  context: Record<string, string>;
  childContexts: Record<string, string>[];
  store: IndexedFormula;
  fetcher: Fetcher;
  updater: UpdateManager;
  findAll: (args: FindAllArgs<ShapeType>) => Promise<QueryResult<ShapeType[]>>;
  findOne: (args: FindUniqueArgs) => Promise<QueryResult<ShapeType>>;
  create: (args: CreateArgs<ShapeType>) => Promise<QueryResult<ShapeType>>;
  update: (args: UpdateArgs<ShapeType>) => Promise<QueryResult<ShapeType>>;
  delete: (args: DeleteArgs) => Promise<void>;
  dataToStatements: (
    data: Partial<ShapeType>,
    doc: string
  ) => [Statement[], Statement[]];
  constructor({
    id,
    shape,
    context,
    childContexts,
    type,
  }: ShapeConstructorArgs) {
    this.id = id;
    this.shape = shape;
    this.schema = shex.Parser.construct(this.id).parse(this.shape);
    this.prefixes = {
      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      ...this.schema.prefixes,
    };
    this.type = type && Object.values(type);
    this.context = context;
    this.childContexts = childContexts ?? [];
    this.store = new IndexedFormula();
    this.fetcher = new Fetcher(this.store);
    this.updater = new UpdateManager(this.store);

    this.findAll = function (
      this: Shape<ShapeType>,
      args: FindAllArgs<ShapeType>
    ) {
      return findAll<ShapeType>(this, args);
    }.bind(this);
    this.findOne = function (this: Shape<ShapeType>, args: FindUniqueArgs) {
      return findOne<ShapeType>(this, args);
    }.bind(this);
    this.create = function (
      this: Shape<ShapeType>,
      args: CreateArgs<ShapeType>
    ) {
      return create<ShapeType>(this, args);
    }.bind(this);
    this.update = function (
      this: Shape<ShapeType>,
      args: UpdateArgs<ShapeType>
    ) {
      return update<ShapeType>(this, args);
    }.bind(this);
    this.delete = function (this: Shape<ShapeType>, args: DeleteArgs) {
      return deleteShape<ShapeType>(this, args);
    }.bind(this);
    this.dataToStatements = function (
      this: Shape<ShapeType>,
      data: Partial<ShapeType>,
      doc: string
    ) {
      return dataToStatements<ShapeType>(this, data, doc);
    }.bind(this);
  }
}
