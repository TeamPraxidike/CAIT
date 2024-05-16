import {
    getCircuitByPublicationId, prisma, handleConnections, type NodeInfo, deleteCircuitByPublicationId,
} from "$lib/database";


export async function GET({ params }) {
	// Authentication step
	// return 401 if user not authenticated

	const publicationId = parseInt(params.publicationId);

	if (isNaN(publicationId) || publicationId <= 0) {
		return new Response(JSON.stringify({ error: 'Bad Request - Invalid ID' }), {
			status: 400,
		});
	}

	try {
		const circuit = await getCircuitByPublicationId(publicationId);
		if (!circuit) {
			return new Response(JSON.stringify({ error: 'Circuit Not Found' }), {
				status: 404,
			});
		}
		return new Response(JSON.stringify(circuit), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

/**
 * Update circuit
 * @param request
 * @param params
 */
export async function PUT({ request, params }) {
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

            const nodeInfo: NodeInfo = body.NodeInfo;

            // add nodes
            for (const node of nodeInfo.add) {
                await addNode(node.circuitId, node.publicationId, prismaTransaction);
            }

            // delete nodes
            for (const node of nodeInfo.delete) {
                await deleteNode(node.nodeId, prismaTransaction);
            }

            // edit existing nodes
            for (const node of nodeInfo.edit) {
                await editNode(node.nodeId, node.publicationId, prismaTransaction);
            }

            await handleEdges(nodeInfo.next);

            const circuit = await updateCircuitByPublicationId(
                publicationId, body.title, body.description,
                body.difficulty, body.learningObjectives,
                body.prerequisites, prismaTransaction
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

export async function DELETE({ params }) {
	const id = parseInt(params.publicationId);
	if (isNaN(id) || id <= 0) {
		return new Response(
			JSON.stringify({ error: 'Bad Delete Request - Invalid Circuit Id' }),
			{ status: 400 },
		);
	}
	try {
		const circuit = await getCircuitByPublicationId(id);
		if (!circuit) {
			return new Response(JSON.stringify({ error: 'Circuit Not Found' }), {
				status: 404,
			});
		}
		await deleteCircuitByPublicationId(id);
		return new Response(JSON.stringify(circuit), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

