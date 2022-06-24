import { BlankNode, IndexedFormula, NamedNode, Statement, Node } from 'rdflib';
import { Schema } from 'shexj';
import { Shape } from './shape';
export interface ValidateArgs {
    doc?: string | string[];
    schema: Schema;
    store: IndexedFormula;
    statements?: Statement[];
    type?: string[];
    shapeId: string;
    ids?: string[];
    contexts: Record<string, string>[];
    prefixes: Record<string, string>;
}
export declare type ValidationResult<ShapeType> = [
    ShapeType[] | undefined,
    string[] | undefined
];
export declare function validateShapes<ShapeType, CreateShapeArgs>(shape: Shape<ShapeType, CreateShapeArgs>, ids: string[] | undefined, doc?: string | string[]): Promise<ValidationResult<ShapeType>>;
export declare function validateShex<ShapeType>({ schema, store, type, ids, shapeId, contexts, prefixes, doc, }: ValidateArgs): Promise<ValidationResult<ShapeType>>;
export declare function getAllStatementsOfNode(store: IndexedFormula, doc: string, node?: Node | NamedNode | BlankNode): Statement[];
//# sourceMappingURL=validate.d.ts.map