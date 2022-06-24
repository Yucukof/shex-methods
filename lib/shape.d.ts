import { Fetcher, Statement, UpdateManager, IndexedFormula } from 'rdflib';
import { Schema } from 'shexj';
import { CreateArgs } from './handlers/create';
import { FindAllArgs } from './handlers/findAll';
import { FindUniqueArgs } from './handlers/findOne';
import { UpdateArgs } from './handlers/update';
import { DeleteArgs, DeleteQueryResult } from './handlers/delete';
export interface QueryResult<Type> {
    errors?: string[];
    data?: Type;
    doc: string | string[];
}
export interface ShapeConstructorArgs {
    id: string;
    shape: string;
    context: Record<string, string>;
    childContexts?: Record<string, string>[];
    type?: Record<string, string> | string[];
}
export declare class Shape<ShapeType, CreateShapeArgs> {
    id: string;
    shape: string;
    schema: Schema;
    prefixes: Record<string, string>;
    type?: string[];
    context: Record<string, string>;
    childContexts: Record<string, string>[];
    store: IndexedFormula;
    fetcher: Fetcher;
    updater: UpdateManager;
    constructor({ id, shape, context, childContexts, type, }: ShapeConstructorArgs);
    dataToStatements(this: Shape<ShapeType, CreateShapeArgs>, data: Partial<CreateShapeArgs>, doc: string): [Statement[], Statement[]];
    findOne(this: Shape<ShapeType, CreateShapeArgs>, args: FindUniqueArgs): Promise<QueryResult<ShapeType>>;
    findAll(this: Shape<ShapeType, CreateShapeArgs>, args: FindAllArgs<ShapeType>): Promise<QueryResult<ShapeType[]>>;
    create(this: Shape<ShapeType, CreateShapeArgs>, args: CreateArgs<CreateShapeArgs>): Promise<QueryResult<ShapeType>>;
    update(this: Shape<ShapeType, CreateShapeArgs>, args: UpdateArgs<CreateShapeArgs>): Promise<QueryResult<ShapeType>>;
    delete(this: Shape<ShapeType, CreateShapeArgs>, args: DeleteArgs): Promise<DeleteQueryResult<ShapeType>>;
}
//# sourceMappingURL=shape.d.ts.map