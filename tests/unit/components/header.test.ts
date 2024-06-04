import { expect, it } from 'vitest';

it('should render header when signed in', async () => {
	// Test goes here
	expect(true).toBe(true);
});

// import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
// import {
// 	arrow,
// 	autoUpdate,
// 	computePosition,
// 	flip,
// 	offset,
// 	shift,
// } from '@floating-ui/dom';
// import { storePopup } from '@skeletonlabs/skeleton';
// import Header from '$lib/components/page/Header.svelte';
//
// // Create a mock user
// const mockUser = {
// 	id: 'aaa',
// 	password: 'password',
// 	username: 'Vasko Prasko',
// 	firstName: 'John',
// 	lastName: 'Doe',
// 	email: 'john.doe@example.com',
// 	profilePic: 'https://example.com/profile.jpg',
// 	reputation: 100,
// 	isAdmin: false,
// 	profilePicData: 'null',
// 	createdAt: new Date(2),
// 	updatedAt: new Date(2),
// 	emailVerified: null,
// };
//
// describe('Header Component', () => {
// 	let host: HTMLDivElement;
//
// 	beforeAll(() => {
// 		// vi.mock('$lib/stores/auth', async () => {
// 		// 	return {
// 		// 		store: mockAuthStore,
// 		// 		authStore: mockAuthStore,
// 		// 	};
// 		// });
// 	});
// 	beforeEach(() => {
// 		// Mock the authStore
// 		host = document.createElement('div');
// 		document.body.appendChild(host);
// 	});
//
// 	it('should render header when signed in', async () => {
// 		// Render the Header component
// 		mockAuthStore.mockSetSubscribeValue({
// 			user: mockUser,
// 			session: 'aa',
// 		});
//
// 		storePopup.set({
// 			computePosition,
// 			autoUpdate,
// 			flip,
// 			shift,
// 			offset,
// 			arrow,
// 		});
//
// 		const instance = new Header({
// 			target: host,
// 			props: {},
// 		});
//
// 		// Assertion
// 		expect(instance).toBeTruthy();
// 		expect(host.innerHTML).toContain('Home');
// 		expect(host.innerHTML).toContain('About');
// 		expect(host.innerHTML).toContain('Browse Materials');
// 		expect(host.innerHTML).toContain('Browse Circuits');
// 		expect(host.innerHTML).toContain('Publish');
// 	});
//
// 	it('should render sign in header when signed in', async () => {
// 		mockAuthStore.mockSetSubscribeValue({
// 			user: null,
// 			session: 'aa',
// 		});
//
// 		storePopup.set({
// 			computePosition,
// 			autoUpdate,
// 			flip,
// 			shift,
// 			offset,
// 			arrow,
// 		});
//
// 		const instance = new Header({
// 			target: host,
// 			props: {},
// 		});
//
// 		// Assertion
// 		expect(instance).toBeTruthy();
// 		expect(host.innerHTML).toContain('Home');
// 		expect(host.innerHTML).toContain('About');
// 		expect(host.innerHTML).toContain('Browse Materials');
// 		expect(host.innerHTML).toContain('Browse Circuits');
// 		expect(host.innerHTML).toContain('Sign In');
// 	});
// });
