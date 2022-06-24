import { QueryResult, Shape } from '../shape';
export interface UpdateArgs<CreateShapeArgs> {
    doc: string;
    data: Partial<CreateShapeArgs> & {
        id: string;
    };
}
export declare function update<ShapeType, CreateShapeArgs>(shape: Shape<ShapeType, CreateShapeArgs>, { doc, data }: UpdateArgs<CreateShapeArgs>): Promise<QueryResult<ShapeType>>;
//# sourceMappingURL=update.d.ts.map