import { handle as authHandle } from '$lib/database/auth';

export const handle = async ({ event, resolve }) => {
  const response = await authHandle({ event, resolve });

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', 'https://cait.praxidike.org');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
};

