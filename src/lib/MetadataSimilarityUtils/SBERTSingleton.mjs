import { pipeline } from '@xenova/transformers';

class SBERTSingleton{
    static instance;
    extractor;

    constructor() {
        if (SBERTSingleton.instance) {
            return SBERTSingleton.instance;
        }
        SBERTSingleton.instance = this;
    }

    static async getInstance() {
        if (!SBERTSingleton.instance) {
            SBERTSingleton.instance = new SBERTSingleton();
            await SBERTSingleton.instance.initialize();
        }
        return SBERTSingleton.instance;
    }

    async initialize() {
        // load the feature extraction pipeline
        this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        await this.extractor('Warm-up request.', { pooling: 'mean', normalize: true });
        //console.log('Model warmed up and ready for use.');
    }

    async computeEmbeddingsTextPair(textFirst, textSecond) {
        //compute embeddings for both texts
        const tensorFirst = await this.extractor(textFirst, { pooling: 'mean', normalize: true });
        const tensorSecond = await this.extractor(textSecond, { pooling: 'mean', normalize: true });

        // convert DataArray to number[], otherwise use 'data = new Float32Array(tensor.data)'
        const dataFirst = Array.from(tensorFirst.data);
        const dataSecond = Array.from(tensorSecond.data);

        return { embeddingFirst: dataFirst, embeddingSecond: dataSecond };
    }

    async computeEmbeddingSingleText(text) {
        const tensor = await this.extractor(text, { pooling: 'mean', normalize: true });
        return Array.from(tensor.data);
    }

    /**
     * Needed for Embeddings implementation
     * https://v03.api.js.langchain.com/classes/_langchain_core.embeddings.Embeddings.html
     * @param documents
     * @returns {Promise<Awaited<unknown>[]>}
     */
    async embedDocuments(documents) {
        return Promise.all(documents.map((doc) => this.computeEmbeddingSingleText(doc)));
    }

    /**
     * Needed for Embeddings implementation
     * https://v03.api.js.langchain.com/classes/_langchain_core.embeddings.Embeddings.html
     * @param document
     * @returns {Promise<Awaited<unknown>[]>}
     */
    async embedQuery(document) {
        return this.computeEmbeddingSingleText(document);
    }
}

export default SBERTSingleton;