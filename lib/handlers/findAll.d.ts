import { QueryResult, Shape } from '../shape';
export interface FindAllArgs<ShapeType> {
    doc: string | string[];
    where?: {
        id?: string[];
    } & Partial<Omit<ShapeType, 'id'>>;
}
export declare function findAll<ShapeType, CreateShapeArgs>(shape: Shape<ShapeType, CreateShapeArgs>, { where, doc }: FindAllArgs<ShapeType>): Promise<QueryResult<ShapeType[]>>;
//# sourceMappingURL=findAll.d.ts.map