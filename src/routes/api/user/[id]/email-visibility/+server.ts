import { verifyAuth } from '$lib/database/auth';
import { setEmailVisibility } from '$lib/database';
import { isEmailVisibility } from '$lib/util/emailVisibility';

export async function PUT({ params, request, locals }) {
	const authError = await verifyAuth(locals, params.id);
	if (authError) return authError;

	let body: { emailVisibility?: string };
	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
			status: 400,
		});
	}

	const visibility = body.emailVisibility;
	if (!isEmailVisibility(visibility)) {
		return new Response(
			JSON.stringify({ error: 'Invalid emailVisibility value' }),
			{ status: 400 },
		);
	}

	try {
		await setEmailVisibility(params.id, visibility);
		return new Response(JSON.stringify({ emailVisibility: visibility }), {
			status: 200,
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}
