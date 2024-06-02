import { vi } from 'vitest';
import * as authModule from '$lib/database/auth';

export const mockAuthModule = () => {
	vi.mock('../src/auth', () => {
		return {
			...authModule,
			verifyAuth: vi.fn(),
			canEdit: vi.fn(),
			canRemove: vi.fn(),
		};
	});

	// Example mock implementations
	vi.mocked(authModule.verifyAuth).mockResolvedValue(null); // Set to return null for the test scenario
	vi.mocked(authModule.canEdit).mockResolvedValue(true);
	vi.mocked(authModule.canRemove).mockResolvedValue(true);
};
