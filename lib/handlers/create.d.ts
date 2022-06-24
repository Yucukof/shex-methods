import { Statement, UpdateManager } from 'rdflib';
import { QueryResult, Shape } from '../shape';
import { ValidationResult } from '../validate';
export interface CreateArgs<CreateShapeArgs> {
    doc: string;
    data: CreateShapeArgs & {
        id: string;
    };
}
export declare function create<ShapeType, CreateShapeArgs>(shape: Shape<ShapeType, CreateShapeArgs>, { doc, data }: CreateArgs<CreateShapeArgs>): Promise<QueryResult<ShapeType>>;
export declare function validateNewShape<ShapeType, CreateShapeArgs>(shape: Shape<ShapeType, CreateShapeArgs>, node: string, del: Statement[], ins: Statement[], doc: string): Promise<ValidationResult<ShapeType>>;
export declare function updateExisting(updater: UpdateManager, del: Statement[], ins: Statement[]): Promise<void>;
//# sourceMappingURL=create.d.ts.map