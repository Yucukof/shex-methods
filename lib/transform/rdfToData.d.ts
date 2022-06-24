export interface Validated {
    validated: any;
    baseUrl: string;
    shapeUrl: string;
}
export declare function validatedToDataResult({ validated, baseUrl, shapeUrl, contexts, prefixes, }: {
    contexts: Record<string, string>[];
    prefixes: Record<string, string>;
} & Validated): Record<string, any>;
export declare function validatedToAbsolute(data: Record<string, ValidatedNestedNode | ValidatedNode>, baseUrl: string): Record<string, any>;
interface ValidatedNode {
    ldterm: string | {
        value: string;
    };
}
interface ValidatedNestedNode {
    ldterm: string;
    nested: Record<string, ValidatedNestedNode | ValidatedNode>;
}
export declare function validatedToAbsoluteValue(value: ValidatedNestedNode | ValidatedNode): Record<string, any> | string;
export declare function absoluteToNormalized(data: Record<string, any>, contexts: Record<string, string>[], prefixes: Record<string, string>): Record<string, any>;
export declare function absoluteToNormalizedValue(value: Record<string, any>, contexts: Record<string, string>[], prefixes: Record<string, string>): Record<string, any> | string;
export declare function getNormalizedKeyFromContextOrSchemaPrefixes(key: string, contexts: Record<string, string>[], prefixes: Record<string, string>): string;
export declare function getNameOfPath(path: string): string;
export declare function normalizeUrl(url: string, capitalize?: boolean, not?: string, prefixes?: Record<string, string>): string;
export {};
//# sourceMappingURL=rdfToData.d.ts.map