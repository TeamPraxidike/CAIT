import {
    getCircuitByPublicationId, connectTags, disconnectTags,
    disconnectMaintainers, connectMaintainers, prisma, handleConnections
} from "$lib/database";
import {updateCircuitByPublicationId} from "$lib/database/circuit";

export async function GET({ params }) {
    // Authentication step
    // return 401 if user not authenticated

    const publicationId = parseInt(params.publicationId);

    if (isNaN(publicationId) || publicationId <= 0) {
        return new Response(
            JSON.stringify(
                { error: "Bad Request - Invalid ID" }
            ), { status: 400 });
    }

    try {
        const circuit = await getCircuitByPublicationId(publicationId);
        if (!circuit) {
            return new Response(
                JSON.stringify({ error: "Circuit Not Found"}
                ), { status: 404 });
        }
        return new Response(JSON.stringify(circuit), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
    }
}

/**
 * Update material
 * @param request
 * @param params
 */
export async function POST({ request, params }) {
    // Authentication step
    // return 401 if user not authenticated

    const publicationId = parseInt(params.publicationId);

    if (isNaN(publicationId) || publicationId <= 0) {
        return new Response(JSON.stringify({ error: 'Bad Request - Invalid ID' }), {
            status: 400,
        });
    }

    try {
        const circuit = await prisma.$transaction(async (prismaTransaction) => {
            await handleConnections(request, publicationId, prismaTransaction);

            const body = await request.json();

            const circuit = await updateCircuitByPublicationId(
                publicationId,
                body.title,
                body.description,
                body.difficulty,
                body.learningObjectives,
                body.prerequisites,
                prismaTransaction
            );
            if (!circuit) {
                return new Response(JSON.stringify({error: 'Circuit Not Found'}), {
                    status: 404,
                });
            }

            return circuit;
        });

        return new Response(JSON.stringify({ circuit }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Server Error' }), {
            status: 500,
        });
    }
}