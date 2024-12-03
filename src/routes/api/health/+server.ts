export async function GET() {
	return new Response(JSON.stringify("Working"), {
		status: 200,
		statusText: "Healthy"
	});
}