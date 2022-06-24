import camelcase from 'camelcase';
export function validatedToDataResult({ validated, baseUrl, shapeUrl, contexts, prefixes, }) {
    const absoluteData = validatedToAbsolute(validated, baseUrl);
    const data = absoluteToNormalized(absoluteData, contexts, prefixes);
    return proxifyShape({ __shapeName: shapeUrl, id: validated.node, ...data }, contexts, prefixes);
}
export function validatedToAbsolute(data, baseUrl) {
    return Object.assign({ id: baseUrl }, ...Object.keys(data).map((key) => {
        const value = data[key];
        if (Array.isArray(value)) {
            if (value.length === 1) {
                return { [key]: validatedToAbsoluteValue(value[0]) };
            }
            return { [key]: value.map((value) => validatedToAbsoluteValue(value)) };
        }
        else {
            return { [key]: validatedToAbsoluteValue(value) };
        }
    }));
}
export function validatedToAbsoluteValue(value) {
    if (value.nested) {
        const { nested, ldterm } = value;
        return validatedToAbsolute(nested, ldterm);
    }
    else if (value.ldterm.value) {
        return value.ldterm.value;
    }
    else {
        return value.ldterm;
    }
}
export function absoluteToNormalized(data, contexts, prefixes) {
    return Object.assign({}, ...Object.keys(data).map((key) => {
        if (key === 'id') {
            return { [key]: data[key] };
        }
        const contextKey = getNormalizedKeyFromContextOrSchemaPrefixes(key, contexts, prefixes);
        if (contextKey) {
            const value = data[key];
            if (Array.isArray(value)) {
                return {
                    [contextKey]: value.map((value) => absoluteToNormalizedValue(value, contexts, prefixes)),
                };
            }
            else if (typeof value === 'object') {
                return {
                    [contextKey]: absoluteToNormalized(value, contexts, prefixes),
                };
            }
            else {
                return {
                    [contextKey]: absoluteToNormalizedValue(value, contexts, prefixes),
                };
            }
        }
        else {
            throw Error(`Could not find field name for: ${key}\nContext objects used: \n${JSON.stringify(contexts)}`);
        }
    }));
}
export function absoluteToNormalizedValue(value, contexts, prefixes) {
    if (typeof value === 'object') {
        return absoluteToNormalized(value, contexts, prefixes);
    }
    else {
        return value;
    }
}
export function getNormalizedKeyFromContextOrSchemaPrefixes(key, contexts, prefixes) {
    const prefix = Object.keys(prefixes).find((prefix) => {
        return key.includes(prefixes[prefix]);
    });
    const prefixedKey = `${prefix}:${normalizeUrl(key)}`;
    return contexts.reduce((key, context) => {
        if (!key)
            return Object.keys(context).find((key) => context[key] === prefixedKey);
        else
            return key;
    }, '');
}
export function getNameOfPath(path) {
    return path.substr(path.lastIndexOf('/') + 1).split('.')[0];
}
export function normalizeUrl(url, capitalize, not, prefixes) {
    const urlObject = new URL(url);
    let normalized = camelcase(urlObject.hash === ''
        ? getNameOfPath(urlObject.pathname)
        : urlObject.hash.replace(/#+/, ''));
    if (not && normalized.toLowerCase() === not.toLowerCase()) {
        const namespaceUrl = url.replace(urlObject.hash === ''
            ? getNameOfPath(urlObject.pathname)
            : urlObject.hash, '');
        const namespacePrefix = Object.keys(prefixes ?? {}).find((key) => (prefixes ?? {})[key] === namespaceUrl);
        normalized =
            namespacePrefix + normalized.replace(/^\w/, (c) => c.toUpperCase());
    }
    if (capitalize) {
        return normalized.replace(/^\w/, (c) => c.toUpperCase());
    }
    return normalized;
}
function proxifyShape(shape, contexts, prefixes) {
    return new Proxy(shape, {
        get: (target, key) => {
            if (typeof key == 'string') {
                const directValue = proxyGetHandler(target, key, contexts, prefixes);
                if (directValue)
                    return directValue;
                const [prefix, normalizedKey] = key.split(':');
                if (!normalizedKey || !prefix)
                    return undefined;
                if (contexts.find((context) => context[normalizedKey])) {
                    return proxyGetHandler(target, normalizedKey, contexts, prefixes);
                }
                else {
                    const absoluteKey = prefixes[prefix] + normalizedKey;
                    const foundKey = getNormalizedKeyFromContextOrSchemaPrefixes(absoluteKey, contexts, prefixes);
                    return proxyGetHandler(target, foundKey, contexts, prefixes);
                }
            }
            else {
                return '[object Object]';
            }
        },
    });
}
function proxyGetHandler(target, key, contexts, prefixes) {
    if (typeof target[key] === 'object' && !Array.isArray(target[key])) {
        return proxifyShape(target[key], contexts, prefixes);
    }
    else {
        return target[key];
    }
}
//# sourceMappingURL=rdfToData.js.map