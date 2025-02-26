import { createClient } from '@supabase/supabase-js';

class VectorStoreSingleton {
	static instance;
	client;
	tableName;
	queryName;
	embeddingModel;
	upsertBatchSize;

	constructor() {
		if (VectorStoreSingleton.instance) {
			return VectorStoreSingleton.instance;
		}
		VectorStoreSingleton.instance = this;
	}

	// TODO: this is not a good dep. injection, need to fix in the future
	static async getInstance(embeddingModel) {
		if (!VectorStoreSingleton.instance) {
			VectorStoreSingleton.instance = new VectorStoreSingleton();

			const supabaseClient = createClient(process.env.PUBLIC_SUPABASE_URL,
				process.env.SERVICE_ROLE_KEY);

			VectorStoreSingleton.instance.tableName = "documents";
			VectorStoreSingleton.instance.queryName = "match_documents";
			VectorStoreSingleton.instance.client = supabaseClient;
			VectorStoreSingleton.instance.embeddingModel = embeddingModel;
			VectorStoreSingleton.instance.upsertBatchSize = 500;

		}
		return VectorStoreSingleton.instance;
	}

	async addDocuments(splits, options = undefined) {
		const texts = splits.map(({ pageContent }) => pageContent);
		return this.addVectors(
			await this.embeddingModel.embedDocuments(texts),
			splits,
			options
		);
	}

	async addVectors(
		vectors,
		documents,
		options = undefined,
	) {
		const rows = vectors.map((embedding, idx) => ({
			content: documents[idx].pageContent,
			embedding,
			metadata: documents[idx].metadata,
		}));

		// upsert returns 500/502/504 (yes really any of them) if given too many rows/characters
		// ~2000 trips it, but my data is probably smaller than average pageContent and metadata
		let returnedIds = [];
		for (let i = 0; i < rows.length; i += this.upsertBatchSize) {
			const chunk = rows.slice(i, i + this.upsertBatchSize).map((row, j) => {
				if (options?.ids) {
					return { id: options.ids[i + j], ...row };
				}
				return row;
			});

			const res = await this.client.from(this.tableName).upsert(chunk).select();
			if (res.error) {
				throw new Error(
					`Error inserting: ${res.error.message} ${res.status} ${res.statusText}`
				);
			}
			if (res.data) {
				returnedIds = returnedIds.concat(res.data.map((row) => row.id));
			}
		}
		return returnedIds;
	}


	async delete(params){
		const { ids } = params;
		for (const id of ids) {
			await this.client.from(this.tableName).delete().eq("id", id);
		}
	}

}

export default VectorStoreSingleton;
