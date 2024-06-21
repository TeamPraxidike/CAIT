import { pipeline } from '@xenova/transformers';

class SBERTSingleton {
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

    async computeEmbeddings(textFirst, textSecond) {
        //compute embeddings for both texts
        const tensorFirst = await this.extractor(textFirst, { pooling: 'mean', normalize: true });
        const tensorSecond = await this.extractor(textSecond, { pooling: 'mean', normalize: true });

        // convert DataArray to number[], otherwise use 'data = new Float32Array(tensor.data)'
        const dataFirst = Array.from(tensorFirst.data);
        const dataSecond = Array.from(tensorSecond.data);

        return { embeddingFirst: dataFirst, embeddingSecond: dataSecond };
    }
}

export default SBERTSingleton;