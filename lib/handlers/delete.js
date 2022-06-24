import { NamedNode } from 'rdflib';
export async function deleteShape(shape, { doc, where }) {
    return new Promise(async (resolve) => {
        await shape.fetcher
            .load(doc, { force: true, clearPreviousData: true })
            .catch((err) => resolve({ doc, errors: [err] }));
        const { id } = where;
        const statementsOfId = shape.store.statementsMatching(new NamedNode(id), null, null, new NamedNode(doc));
        if (statementsOfId.length === 0) {
            resolve({ doc });
        }
        await shape.updater.update(statementsOfId, [], (_uri, ok, err) => {
            if (ok) {
                console.debug('Successfully deleted ' + id);
                resolve({ doc });
            }
            else {
                resolve({ doc, errors: [err] });
            }
        });
    });
}
//# sourceMappingURL=delete.js.map