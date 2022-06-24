import { Fetcher, UpdateManager, graph, } from 'rdflib';
import { dataToStatements } from './transform/dataToRdf';
import { create } from './handlers/create';
import { findAll } from './handlers/findAll';
import { findOne } from './handlers/findOne';
import { update } from './handlers/update';
import { deleteShape } from './handlers/delete';
const shex = require('shex');
export class Shape {
    id;
    shape;
    schema;
    prefixes;
    type;
    context;
    childContexts;
    store;
    fetcher;
    updater;
    constructor({ id, shape, context, childContexts, type, }) {
        this.id = id;
        this.shape = shape;
        this.schema = shex.Parser.construct(this.id).parse(this.shape);
        this.prefixes = {
            rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            ...this.schema
                .prefixes,
        };
        this.type = type && Object.values(type);
        this.context = context;
        this.childContexts = childContexts ?? [];
        this.store = graph();
        this.fetcher = new Fetcher(this.store);
        this.updater = new UpdateManager(this.store);
    }
    dataToStatements(data, doc) {
        return dataToStatements(this, data, doc);
    }
    findOne(args) {
        return findOne(this, args);
    }
    findAll(args) {
        return findAll(this, args);
    }
    create(args) {
        return create(this, args);
    }
    update(args) {
        return update(this, args);
    }
    delete(args) {
        return deleteShape(this, args);
    }
}
//# sourceMappingURL=shape.js.map