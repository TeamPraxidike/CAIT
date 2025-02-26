import { prisma } from '$lib/database/prisma';

// Cast the vector to a string format that can be parsed back to an array
export async function getDocuments() {
	const documents = await prisma.$queryRaw`
    SELECT 
      id, 
      content, 
      metadata, 
      file_path,
      embedding::text as embedding_text
    FROM "Document";
  `;

	// Parse the embedding text back to arrays if needed
	return documents.map((doc: any) => ({
		id: doc.id,
		content: doc.content,
		metadata: doc.metadata,
		file_path: doc.file_path,
		embedding: doc.embedding_text ? parseVectorString(doc.embedding_text) : null
	}));
}

// Function to parse vector string back to array
function parseVectorString(vectorStr: string): number[] {
	// The format is likely [1,2,3,...] but might be different
	// Remove brackets and split by commas
	try {
		return vectorStr
			.replace('[', '')
			.replace(']', '')
			.split(',')
			.map(num => parseFloat(num.trim()));
	} catch (e) {
		console.error('Error parsing vector string:', e);
		return [];
	}
}