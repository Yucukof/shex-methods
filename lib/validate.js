import { NamedNode, graph, } from 'rdflib';
import createSerializer from 'rdflib/lib/serializer';
import { Parser, Store } from 'n3';
import { validatedToDataResult } from './transform/rdfToData';
const shex = require('shex');
export function validateShapes(shape, ids, doc) {
    const { schema, context, prefixes, childContexts, type, store, id: shapeId, } = shape;
    return validateShex({
        schema,
        prefixes,
        type,
        store,
        shapeId,
        contexts: [context, ...childContexts],
        ids,
        doc,
    });
}
export async function validateShex({ schema, store, type, ids, shapeId, contexts, prefixes, doc, }) {
    const validator = shex.Validator.construct(schema, {
        results: 'api',
    });
    let n3db;
    if (doc) {
        const docExclusiveStore = graph();
        if (Array.isArray(doc)) {
            doc.map((d) => {
                docExclusiveStore.addAll(store.statementsMatching(null, null, null, new NamedNode(d)));
            });
        }
        else {
            docExclusiveStore.addAll(store.statementsMatching(null, null, null, new NamedNode(doc)));
        }
        n3db = await createN3DB(docExclusiveStore, type);
    }
    else {
        n3db = await createN3DB(store, type);
    }
    const [db, potentialShapes] = n3db;
    let allErrors = undefined;
    let allShapes = undefined;
    if (!ids && potentialShapes.length === 0) {
        return [undefined, ['No shapes found of type ' + shapeId]];
    }
    try {
        const validated = validator.validate(db, (ids ?? potentialShapes).map((id) => ({ node: id, shape: shapeId })));
        validated.forEach((validation) => {
            const [foundShape, foundErrors] = mapValidationResult(shapeId, validation);
            if (!foundErrors)
                allShapes = [
                    ...(allShapes ?? []),
                    validatedToDataResult({
                        contexts,
                        prefixes,
                        ...foundShape,
                    }),
                ];
            if (foundErrors) {
                allErrors = [...(allErrors ?? []), ...foundErrors];
            }
        });
        return [allShapes, allErrors];
    }
    catch (err) {
        console.debug(err);
        return [undefined, [err.message]];
    }
}
function mapValidationResult(shapeId, validated) {
    const foundErrors = validated.status === 'nonconformant' &&
        shex.Util.errsToSimple(validated.appinfo, validated.node, shapeId);
    const foundShapes = validated.status === 'conformant' &&
        {
            validated: shex.Util.valToValues(validated.appinfo),
            baseUrl: validated.node,
            shapeUrl: validated.shape,
        };
    return [foundShapes, foundErrors];
}
function getNodesFromStore(store, type) {
    return (type
        ? type.reduce((allNodes, type) => {
            return [
                ...allNodes,
                ...store.each(null, new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), new NamedNode(type)),
            ];
        }, [])
        : store.each(null)).filter((node, index, allNodes) => {
        return (allNodes.findIndex((possiblySameNode) => possiblySameNode.value === node.value) === index);
    });
}
export function getAllStatementsOfNode(store, doc, node) {
    if (!node) {
        return [];
    }
    return [
        ...store
            .statementsMatching(node, null, null, new NamedNode(doc))
            .reduce((allStatements, statement) => {
            if (statement.object.termType === 'BlankNode' ||
                statement.object.termType === 'NamedNode') {
                const allObjectStatements = getAllStatementsOfNode(store, doc, statement.object);
                return [...allStatements, statement, ...allObjectStatements];
            }
            else {
                return [...allStatements, statement];
            }
        }, []),
        ...store.statementsMatching(null, null, node, new NamedNode(doc)),
    ];
}
function createN3DB(store, types) {
    const foundNodes = getNodesFromStore(store, types);
    const turtle = createSerializer(store).statementsToN3(store.statements);
    const n3Store = new Store();
    return new Promise((resolve, reject) => {
        new Parser({
            baseIRI: null,
            blankNodePrefix: '',
            format: 'text/turtle',
        }).parse(turtle, function (error, triple) {
            if (error) {
                reject(error);
            }
            else if (triple) {
                n3Store.addTriple(triple);
            }
            else {
                resolve([
                    shex.Util.makeN3DB(n3Store),
                    foundNodes.map((node) => node.value),
                ]);
            }
        });
    });
}
//# sourceMappingURL=validate.js.map