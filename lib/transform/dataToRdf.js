import { Literal, NamedNode, Namespace, Statement, } from 'rdflib';
import { v4 as uuid } from 'uuid';
const xml = Namespace('http://www.w3.org/2001/XMLSchema#');
export function dataToStatements(shape, data, doc) {
    const absoluteData = normalizedToAbsolute(data, [shape.context, ...shape.childContexts], shape.prefixes);
    const ins = absoluteToStatements(shape.store, absoluteData, doc);
    const delEmptyValues = deleteStatementsForEmptyValues(shape.store, absoluteData, doc);
    console.debug(delEmptyValues, ins);
    const delOldValues = oldFromNewStatements(shape.store, ins);
    console.debug(delOldValues, ins);
    const del = [...delOldValues, ...delEmptyValues];
    return [
        del,
        ins.filter(({ subject, predicate, object, graph }) => shape.store.statementsMatching(subject, predicate, object, graph)
            .length === 0),
    ];
}
export function deleteStatementsForEmptyValues(store, data, doc) {
    const { id } = data;
    return Object.keys(data).reduce((allDelStatements, key) => {
        if (isEmptyValue(data[key])) {
            const nodeToDelete = store.any(safeNode(doc, id), new NamedNode(key), null, new NamedNode(doc).doc());
            if (nodeToDelete) {
                return [
                    ...allDelStatements,
                    ...store.statementsMatching(nodeToDelete),
                    ...store.statementsMatching(null, null, nodeToDelete),
                ];
            }
            else {
                return allDelStatements;
            }
        }
        else {
            return allDelStatements;
        }
    }, []);
}
export function oldFromNewStatements(store, ins) {
    const oldStatements = ins.reduce((allDelStatements, st) => {
        const oldStatements = store.statementsMatching(st.subject, st.predicate, null, st.graph);
        return oldStatements.length > 0
            ? [...allDelStatements, ...oldStatements]
            : allDelStatements;
    }, []);
    return oldStatements.filter((oldSt, index, statements) => {
        return (!ins.find((st) => JSON.stringify(st) === JSON.stringify(oldSt)) &&
            statements.findIndex((st) => JSON.stringify(st) === JSON.stringify(oldSt)) === index);
    });
}
export function absoluteToStatements(store, data, doc) {
    const { id, ...props } = data;
    const statements = Object.keys(props).reduce((statements, prop) => {
        const value = props[prop];
        const statement = absoluteNodeToStatements(store, id, prop, value, doc);
        if (Array.isArray(statement)) {
            return [...statements, ...statement];
        }
        else {
            return [...statements, statement];
        }
    }, []);
    return statements.filter((newSt, index, statements) => {
        return (statements.findIndex((st) => JSON.stringify(st) === JSON.stringify(newSt)) === index);
    });
}
export function safeNode(doc, id) {
    let subject;
    if (id?.termType && id?.value)
        return id;
    if (!id) {
        const newNode = new URL(doc);
        newNode.hash = 'id' + uuid();
        return new NamedNode(newNode.toString());
    }
    try {
        subject = new NamedNode(id);
    }
    catch {
        const newNode = new URL(doc);
        newNode.hash = 'id' + uuid();
        subject = new NamedNode(newNode.toString());
    }
    return subject;
}
export function isEmptyValue(obj) {
    return ((!obj && typeof obj !== 'number') ||
        (typeof obj === 'object' &&
            typeof obj.toISOString !== 'function' &&
            typeof obj.href !== 'string' &&
            Object.values(obj).filter((value) => !isEmptyValue(value))
                .length === 0));
}
export function absoluteNodeToStatements(store, id, prop, value, doc) {
    const isNode = value?.termType === 'NamedNode' ||
        value?.termType === 'BlankNode' ||
        value?.termType === 'Literal';
    if (isEmptyValue(value)) {
        return [];
    }
    if (typeof value !== 'object' || isNode) {
        let valueNode;
        if (isNode) {
            valueNode = value;
        }
        else {
            try {
                valueNode = new NamedNode(value);
            }
            catch {
                if (typeof value === 'string') {
                    valueNode = new Literal(value);
                }
                else if (typeof value === 'number') {
                    if (String(value).indexOf('.') !== -1) {
                        valueNode = new Literal(String(value), null, xml('decimal'));
                    }
                    else {
                        valueNode = new Literal(String(value), null, xml('integer'));
                    }
                }
            }
        }
        return new Statement(safeNode(doc, id), new NamedNode(prop), valueNode, new NamedNode(doc).doc());
    }
    else if (Array.isArray(value)) {
        return value.reduce((allStatements, value) => {
            if (Object.keys(value).length > 1) {
                const newNode = safeNode(doc, value.id);
                return [
                    ...allStatements,
                    new Statement(new NamedNode(id), new NamedNode(prop), newNode, new NamedNode(doc).doc()),
                    ...absoluteToStatements(store, { ...value, id: newNode }, doc),
                ];
            }
            else {
                const statements = absoluteToStatements(store, { id, ...value }, doc);
                return [...allStatements, ...statements];
            }
        }, []);
    }
    else {
        if (typeof value.toISOString === 'function') {
            return new Statement(new NamedNode(id), new NamedNode(prop), new Literal(value.toISOString(), null, xml('dateTime')), new NamedNode(doc).doc());
        }
        else if (typeof value.href === 'string') {
            return new Statement(new NamedNode(id), new NamedNode(prop), new NamedNode(value.href), new NamedNode(doc).doc());
        }
        else {
            const newNode = safeNode(doc, value?.id);
            return [
                new Statement(new NamedNode(id), new NamedNode(prop), newNode, new NamedNode(doc).doc()),
                ...absoluteToStatements(store, { ...value, id: newNode }, doc),
            ];
        }
    }
}
export function normalizedToAbsolute(data, contexts, prefixes) {
    let absoluteData = {};
    Object.keys(data).map((key) => {
        if (Array.isArray(data[key])) {
            const absoluteNodes = data[key].map((value) => {
                if (typeof value === 'object' &&
                    !(value instanceof URL) &&
                    !(value instanceof Date) &&
                    !(value.termType || value.value)) {
                    return normalizedToAbsolute(value, contexts, prefixes);
                }
                return normalizedToAbsoluteNode(key, value, contexts, prefixes);
            });
            const absoluteKey = getAbsoluteKey(key, prefixes, contexts);
            absoluteData = {
                ...absoluteData,
                [absoluteKey]: Object.values(absoluteNodes),
            };
        }
        else {
            absoluteData = {
                ...absoluteData,
                ...normalizedToAbsoluteNode(key, data[key], contexts, prefixes),
            };
        }
    });
    return absoluteData;
}
function getAbsoluteKey(key, prefixes, contexts) {
    const contextKey = (contexts.find((context) => context[key]) ?? {})[key];
    if (!contextKey)
        throw new Error('Key: ' +
            key +
            ' could not be found in context: ' +
            JSON.stringify(contexts));
    const prefix = contextKey.split(':')[0];
    return prefixes[prefix] + key;
}
export function normalizedToAbsoluteNode(key, nodeValue, contexts, prefixes) {
    if (key === 'id') {
        return { id: nodeValue };
    }
    const absoluteKey = getAbsoluteKey(key, prefixes, contexts);
    return { [absoluteKey]: nodeValue };
}
//# sourceMappingURL=dataToRdf.js.map