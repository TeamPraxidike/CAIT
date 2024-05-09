import {getAllMaterials} from "$lib/database/material";
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
    // Authentication step
    // return 401 if user not authenticated

    try {
        const materials = await getAllMaterials();
        return new Response(JSON.stringify(materials), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
    }
}