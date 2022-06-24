import { BlankNode, IndexedFormula, Literal, NamedNode, Statement, Variable } from 'rdflib';
import { Shape } from '../shape';
declare type PrimitiveNodeType = NamedNode | BlankNode | Literal | Date | URL | string;
export declare function dataToStatements<ShapeType, CreateShapeArgs>(shape: Shape<ShapeType, CreateShapeArgs>, data: Partial<CreateShapeArgs>, doc: string): [Statement[], Statement[]];
export declare function deleteStatementsForEmptyValues(store: IndexedFormula, data: Record<string, any>, doc: string): Statement[];
export declare function oldFromNewStatements(store: IndexedFormula, ins: Statement[]): Statement[];
export declare function absoluteToStatements(store: IndexedFormula, data: Record<string, any>, doc: string): Statement[];
export declare function safeNode(doc: string, id?: string | Variable): Variable | NamedNode;
export declare function isEmptyValue(obj: Record<string, any> | PrimitiveNodeType): boolean;
export declare function absoluteNodeToStatements(store: IndexedFormula, id: string, prop: string, value: Record<string, any> | Record<string, any>[] | PrimitiveNodeType | PrimitiveNodeType[], doc: string): Statement | Statement[];
export declare function normalizedToAbsolute(data: Record<string, any>, contexts: Record<string, string>[], prefixes: Record<string, string>): Record<string, any | PrimitiveNodeType>;
export declare function normalizedToAbsoluteNode(key: string, nodeValue: Record<string, any> | string, contexts: Record<string, string>[], prefixes: Record<string, string>): Record<string, any | PrimitiveNodeType>;
export {};
//# sourceMappingURL=dataToRdf.d.ts.map