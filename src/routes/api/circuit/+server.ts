import {getAllCircuits} from "$lib/database/circuit";
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
    // Authentication step
    // return 401 if user not authenticated

    try {
        const circuits = await getAllCircuits();
        return new Response(JSON.stringify(circuits), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
    }
}