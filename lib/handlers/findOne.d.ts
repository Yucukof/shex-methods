import { QueryResult, Shape } from '../shape';
export interface FindUniqueArgs {
    doc: string | string[];
    where: {
        id?: string;
    };
}
export declare function findOne<ShapeType, CreateShapeArgs>(shape: Shape<ShapeType, CreateShapeArgs>, { where, doc }: FindUniqueArgs): Promise<QueryResult<ShapeType>>;
//# sourceMappingURL=findOne.d.ts.map