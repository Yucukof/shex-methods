import { QueryResult, Shape } from '../shape';
export interface DeleteArgs {
    doc: string;
    where: {
        id: string;
    };
}
export declare type DeleteQueryResult<ShapeType> = Omit<QueryResult<ShapeType>, 'data'>;
export declare function deleteShape<ShapeType, CreateShapeArgs>(shape: Shape<ShapeType, CreateShapeArgs>, { doc, where }: DeleteArgs): Promise<DeleteQueryResult<ShapeType>>;
//# sourceMappingURL=delete.d.ts.map