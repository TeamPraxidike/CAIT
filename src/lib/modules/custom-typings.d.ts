declare module 'cytoscape-node-html-label';
declare module 'fuzzy-search' {
	interface FuzzySearchOptions {
		caseSensitive?: boolean;
		sort?: boolean;
		threshold?: number;
	}

	class FuzzySearch<T> {
		constructor(
			haystack: T[],
			keys: (keyof T)[],
			options?: FuzzySearchOptions,
		);

		search(query: string): T[];
	}

	export default FuzzySearch;
}
