import { validateShapes } from '../validate';
export async function findAll(shape, { where, doc }) {
    const ids = where?.id;
    await shape.fetcher.load(doc);
    const [data, errors] = await validateShapes(shape, ids, doc);
    return {
        doc,
        data,
        errors,
    };
}
//# sourceMappingURL=findAll.js.map