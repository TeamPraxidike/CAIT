import { type Writable, writable } from 'svelte/store';
import { vi } from 'vitest';
import type { AuthStruct } from '$lib';

const mockAuthWritable: Writable<AuthStruct> = writable<AuthStruct>();
export const mockAuthStore = {
	subscribe: mockAuthWritable.subscribe,
	set: vi.fn(),
	logout: vi.fn(),
	mockSetSubscribeValue: (value: AuthStruct): void =>
		mockAuthWritable.set(value),
};
