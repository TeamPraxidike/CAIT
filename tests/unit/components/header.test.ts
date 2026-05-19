import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readable, writable } from 'svelte/store';
import { tick } from 'svelte';
import {
	arrow,
	autoUpdate,
	computePosition,
	flip,
	offset,
	shift,
} from '@floating-ui/dom';
import { storePopup } from '@skeletonlabs/skeleton';
import { createUniqueUser } from '../../utility/users.ts';
// Header import is loaded dynamically after SvelteKit store mocks.

const mockUser = { ...(await createUniqueUser()), profilePicData: 'null' };


type PageStoreData = {
	url: URL;
	data: { session: null | { user: typeof mockUser } };
};

const pageStore = writable<PageStoreData>({
	url: new URL('http://localhost/'),
	data: { session: null },
});
const navigatingStore = readable(null);

vi.mock('$app/stores', () => {
	return {
		page: pageStore,
		navigating: navigatingStore,
	};
});

const passthroughPath = (path: string) => path;

vi.mock('$app/paths', () => {
	return {
		base: '',
		assets: '',
		asset: passthroughPath,
		resolve: passthroughPath,
		resolveRoute: passthroughPath,
		match: async () => null,
	};
});

const mockSupabase = {
	auth: {
		signOut: vi.fn(),
	},
} as never;

describe('Header Component', () => {
	let host: HTMLDivElement;
	let Header: typeof import('$lib/components/page/Header.svelte').default;

	beforeEach(async () => {
		host = document.createElement('div');
		document.body.appendChild(host);
		vi.resetModules();
		const { storePopup } = await import('@skeletonlabs/skeleton');
		storePopup.set({
			computePosition,
			autoUpdate,
			flip,
			shift,
			offset,
			arrow,
		});
		Header = (await import('$lib/components/page/Header.svelte')).default;
	});

	it('should render header when signed in', () => {
		pageStore.set({
			url: new URL('http://localhost/'),
			data: { session: { user: mockUser } },
		});

		const instance = new Header({
			target: host,
			props: {
				supabase: mockSupabase,
				loggedUser: mockUser,
			},
		});

		expect(instance).toBeTruthy();
		expect(host.innerHTML).toContain('Home');
		expect(host.innerHTML).toContain('Browse');
		expect(host.innerHTML).toContain('About');
		expect(host.innerHTML).toContain('Publish');
		expect(host.querySelector('[data-testid="profile-picture"]')).toBeTruthy();
	});

	it('should render sign in header when signed out', () => {
		pageStore.set({
			url: new URL('http://localhost/'),
			data: { session: null },
		});

		const instance = new Header({
			target: host,
			props: {
				supabase: mockSupabase,
				loggedUser: null as never,
			},
		});

		expect(instance).toBeTruthy();
		expect(host.innerHTML).toContain('Home');
		expect(host.innerHTML).toContain('Browse');
		expect(host.innerHTML).toContain('About');
		expect(host.innerHTML).toContain('Sign In');
		expect(host.querySelector('[data-testid="profile-picture"]')).toBeNull();
	});

	it('should show mobile dropdown with sign in when signed out', async () => {
		pageStore.set({
			url: new URL('http://localhost/'),
			data: { session: null },
		});

		const instance = new Header({
			target: host,
			props: {
				supabase: mockSupabase,
				loggedUser: null as never,
			},
		});

		expect(instance).toBeTruthy();
		const hamburger = host.querySelector('header > button') as HTMLButtonElement;
		expect(hamburger).toBeTruthy();
		hamburger.click();
		await tick();

		expect(host.innerHTML).toContain('Sign In');
		expect(host.innerHTML).toContain('Home');
		expect(host.innerHTML).toContain('Browse');
	});

	it('should show mobile dropdown log out when signed in', async () => {
		pageStore.set({
			url: new URL('http://localhost/'),
			data: { session: { user: mockUser } },
		});

		const instance = new Header({
			target: host,
			props: {
				supabase: mockSupabase,
				loggedUser: mockUser,
			},
		});

		expect(instance).toBeTruthy();
		const hamburger = host.querySelector('header > button') as HTMLButtonElement;
		expect(hamburger).toBeTruthy();
		hamburger.click();
		await tick();

		expect(host.innerHTML).toContain('Log out');
		expect(host.innerHTML).toContain('Publish');
	});

	it('should close mobile dropdown on second toggle', async () => {
		vi.useFakeTimers();
		pageStore.set({
			url: new URL('http://localhost/'),
			data: { session: null },
		});

		const instance = new Header({
			target: host,
			props: {
				supabase: mockSupabase,
				loggedUser: null as never,
			},
		});

		expect(instance).toBeTruthy();
		const hamburger = host.querySelector('header > button') as HTMLButtonElement;
		expect(hamburger).toBeTruthy();

		hamburger.click();
		await tick();
		vi.advanceTimersByTime(1000);
		expect(host.querySelector('[data-testid="mobile-menu"]')).toBeTruthy();

		hamburger.click();
		await tick()
		vi.advanceTimersByTime(1000);
		expect(host.querySelector('[data-testid="mobile-menu"]')).toBeNull();
	});
});
