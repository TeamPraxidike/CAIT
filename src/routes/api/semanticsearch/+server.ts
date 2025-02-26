import { verifyAuth } from '$lib/database/auth';
import { getDocuments } from '$lib/database/document';
import { model } from '$lib/similarityIndex.mjs';

export async function POST({ request , locals}) {
	// Authentication step
	// return 401 if user not authenticated
	// Add 400 Bad Request check

	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const body = await request.json();

	// if ((await locals.safeGetSession()).user!.id !== body.userId) {
	// 	return new Response(
	// 		JSON.stringify({
	// 			error: 'Bad Request - User IDs not matching',
	// 		}),
	// 		{ status: 401 },
	// 	);
	// }

	const queryText = body.message;

	try {

		const documents = await getDocuments();

		const embeddedText = await model.computeEmbeddingSingleText(queryText);

		console.log(queryText);
		console.log(embeddedText);

		const results = []

		for (const doc of documents){
			console.log(doc)
			const sim = await calculateCosineSimilarityTEMP(doc.embedding, embeddedText);
			results.push({
				"similarity": sim,
				"content": doc.content,
				"filePath": doc.file_path
			})
		}

		// Sort in descending order (highest similarity first)
		results.sort((a, b) => b.similarity - a.similarity);

		// Return the top 3 most similar
		const topResults = results.slice(0, 3);

		return new Response(JSON.stringify({ results: topResults }), {
			status: 200,
		});
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

async function calculateCosineSimilarityTEMP(vector1: number[], vector2: number[]) {
	if (vector1.length !== vector2.length) {
		throw new Error("Vectors must be of the same length");
	}

	let dotProduct = 0;
	let magnitude1 = 0;
	let magnitude2 = 0;

	for (let i = 0; i < vector1.length; i++) {
		dotProduct += vector1[i] * vector2[i];
		magnitude1 += vector1[i] * vector1[i];
		magnitude2 += vector2[i] * vector2[i];
	}

	magnitude1 = Math.sqrt(magnitude1);
	magnitude2 = Math.sqrt(magnitude2);

	if (dotProduct === 0) return 0;
	if (magnitude1 === 0 || magnitude2 === 0) {
		return 0; // Avoid division by zero
	}

	return (dotProduct / (magnitude1 * magnitude2));
}

