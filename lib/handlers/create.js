import { IndexedFormula, NamedNode } from 'rdflib';
import { getAllStatementsOfNode, validateShex, } from '../validate';
export async function create(shape, { doc, data }) {
    return new Promise(async (resolve) => {
        let doesntExist = false;
        await shape.fetcher
            .load(doc, { clearPreviousData: true })
            .then((res) => {
            if (res.status === 404)
                doesntExist = true;
        })
            .catch((err) => {
            if (err.status === 404)
                doesntExist = true;
            shape.store.removeDocument(new NamedNode(doc));
        });
        const { id } = data;
        if (shape.store.any(new NamedNode(id), null, null, new NamedNode(doc))) {
            resolve({
                doc,
                errors: ['Node with id: ' + id + ' already exists in doc:' + doc],
            });
        }
        const [_, ins] = await shape.dataToStatements(data, doc);
        const [newShape, errors] = await validateNewShape(shape, id, [], ins, doc);
        if (!newShape || (errors && !doesntExist)) {
            resolve({ doc, errors });
        }
        else {
            if (!doesntExist) {
                await updateExisting(shape.updater, [], ins)
                    .catch((err) => resolve({ doc, errors: [err] }))
                    .then(() => resolve({ doc, data: newShape[0], errors }));
            }
            else {
                await createNew(shape.updater, doc, ins)
                    .catch((err) => resolve({ doc, errors: [err] }))
                    .then(() => resolve({ doc, data: newShape[0], errors }));
            }
        }
    });
}
export function validateNewShape(shape, node, del, ins, doc) {
    const updatedStore = new IndexedFormula();
    const changedNodes = [...del, ...ins].reduce((allNodes, st) => {
        const changed = [];
        if (allNodes.indexOf(st.subject.value) === -1) {
            changed.push(st.subject.value);
        }
        if (allNodes.indexOf(st.object.value) === -1 &&
            st.object.termType === 'NamedNode') {
            changed.push(st.object.value);
        }
        return [...allNodes, ...changed];
    }, []);
    changedNodes.forEach((node) => {
        updatedStore.add(getAllStatementsOfNode(shape.store, doc, new NamedNode(node)));
    });
    updatedStore.remove(del);
    updatedStore.add(ins);
    const { schema, context, prefixes, childContexts, type, id: shapeId } = shape;
    return validateShex({
        ids: [node],
        schema,
        type,
        shapeId,
        prefixes,
        store: updatedStore,
        contexts: [context, ...childContexts],
    });
}
export function updateExisting(updater, del, ins) {
    return new Promise((resolve, reject) => {
        updater.update(del, ins, async (_uri, ok, error) => {
            !ok ? reject(error) : resolve();
        });
    });
}
function createNew(updater, doc, ins) {
    return new Promise((resolve, reject) => {
        updater.put(new NamedNode(doc), ins, 'text/turtle', async (_uri, ok, error) => {
            !ok ? reject(error) : resolve();
        });
    });
}
//# sourceMappingURL=create.js.map