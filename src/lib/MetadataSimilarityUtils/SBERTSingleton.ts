import { pipeline } from '@xenova/transformers';

type Embeddings = {
    embeddingFirst: number[]
    embeddingSecond: number[]
}

class SBERTSingleton {
    private static instance: SBERTSingleton;
    public extractor: any;

    private constructor() {}

    public static async getInstance(): Promise<SBERTSingleton> {
        if (!SBERTSingleton.instance) {
            SBERTSingleton.instance = new SBERTSingleton();
            await SBERTSingleton.instance.initialize();
        }
        return SBERTSingleton.instance;
    }

    private async initialize() {
        // load the feature extraction pipeline
        this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        await this.extractor('Warm-up request.', { pooling: 'mean', normalize: true });
        //console.log('Model warmed up and ready for use.');
    }

    public async computeEmbeddings(textFirst: string, textSecond: string): Promise<Embeddings> {
        //compute embeddings for both texts
        const tensorFirst = await this.extractor(textFirst, { pooling: 'mean', normalize: true });
        const tensorSecond = await this.extractor(textSecond, { pooling: 'mean', normalize: true });

        // convert DataArray to number[], otherwise use 'data = new Float32Array(tensor.data)'
        const dataFirst: number[] = Array.from(tensorFirst.data)
        const dataSecond: number[] = Array.from(tensorSecond.data)

        return {embeddingFirst: dataFirst, embeddingSecond: dataSecond}
    }
}

export default SBERTSingleton;