// TODO: THIS NEEDS TO BE TESTED!!!

/**
 * A text splitter that recursively splits text into chunks based on character separators
 */
class CustomRecursiveCharacterTextSplitter {
	constructor({
					chunkSize = 200,
					chunkOverlap = 50,
					separators = ["\n\n", "\n", ". ", " ", ""],
					keepSeparator = false,
					minimumChunkSize = 50
				} = {}) {
		this.chunkSize = chunkSize;
		this.chunkOverlap = chunkOverlap;
		this.separators = separators;
		this.keepSeparator = keepSeparator;
		this.minimumChunkSize = minimumChunkSize;
	}

	/**
	 * Split text into chunks
	 * @param {string} text - The text to split
	 */
	async splitText(text) {
		// Start with the most preferred separator
		let finalChunks = [];

		// Handle empty or undefined text
		if (!text || text.length === 0) {
			return [];
		}

		// Try to split the text with each separator in the list
		const splits = this.splitTextRecursively(text, this.separators);

		// Merge smaller pieces and respect chunk size and overlap
		finalChunks = this.mergeSplits(splits, this.chunkSize, this.chunkOverlap);

		return finalChunks;
	}

	/**
	 * Recursively split text by separators
	 * @param {string} text - The text to split
	 * @param {string[]} separators - List of separators to try
	 * @returns {string[]} - Array of split text pieces
	 */
	splitTextRecursively(text, separators) {
		// Base case: no more separators to try
		if (separators.length === 0) {
			return [text];
		}

		// Get the current separator
		const separator = separators[0];

		// If the separator is empty, split by character
		if (separator === "") {
			return text.split("");
		}

		// Try to split with the current separator
		const splits = text.split(separator);

		// If we only got one piece back, try the next separator
		if (splits.length === 1) {
			return this.splitTextRecursively(text, separators.slice(1));
		}

		// Process each split with the remaining separators
		const results = [];
		for (const split of splits) {
			// Skip empty splits
			if (split.trim() === "") {
				continue;
			}

			// Add the separator back if needed
			const textToProcess = this.keepSeparator && separator !== ""
				? split + separator
				: split;

			// If the chunk is small enough, add it as is
			if (textToProcess.length < this.chunkSize) {
				results.push(textToProcess);
			} else {
				// Otherwise, recursively split with remaining separators
				const subResults = this.splitTextRecursively(
					textToProcess,
					separators.slice(1)
				);
				results.push(...subResults);
			}
		}

		return results;
	}

	/**
	 * Merge splits into chunks with respect to size and overlap
	 * @param {string[]} splits - Array of text pieces
	 * @param {number} chunkSize - Target size of each chunk
	 * @param {number} chunkOverlap - Overlap between chunks
	 * @returns {string[]} - Array of final chunks
	 */
	mergeSplits(splits, chunkSize, chunkOverlap) {
		const chunks = [];
		let currentChunk = [];
		let currentLength = 0;

		for (const split of splits) {
			// If adding this split would exceed the chunk size
			if (currentLength + split.length > chunkSize && currentChunk.length > 0) {
				// Add the current chunk to our list of chunks
				chunks.push(currentChunk.join(""));

				// Create a new chunk with overlap
				const overlap = [];
				let overlapLength = 0;

				// Add splits from the end of the previous chunk to maintain overlap
				for (let i = currentChunk.length - 1; i >= 0; i--) {
					const lastSplit = currentChunk[i];
					if (overlapLength + lastSplit.length > chunkOverlap) {
						// We have enough for the overlap
						break;
					}
					overlap.unshift(lastSplit);
					overlapLength += lastSplit.length;
				}

				// Start the new chunk with the overlap
				currentChunk = overlap;
				currentLength = overlapLength;
			}

			// Add the current split to the current chunk
			currentChunk.push(split);
			currentLength += split.length;
		}

		// Add the last chunk if it has content and meets minimum size
		if (currentChunk.length > 0 && currentLength >= this.minimumChunkSize) {
			chunks.push(currentChunk.join(""));
		}

		return chunks;
	}
}

export default CustomRecursiveCharacterTextSplitter;