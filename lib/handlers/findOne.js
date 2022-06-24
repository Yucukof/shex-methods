import { validateShapes } from '../validate';
export async function findOne(shape, { where, doc }) {
    const { id } = where;
    await shape.fetcher.load(doc);
    const [data, errors] = await validateShapes(shape, id ? [id] : undefined);
    return {
        doc,
        data: data ? data[0] : undefined,
        errors: errors,
    };
}
//# sourceMappingURL=findOne.js.map