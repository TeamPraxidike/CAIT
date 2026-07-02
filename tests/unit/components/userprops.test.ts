import { describe, it, expect, beforeEach } from 'vitest';
import { UserProp } from '$lib';
import {
	computePosition,
	autoUpdate,
	flip,
	shift,
	offset,
	arrow,
} from '@floating-ui/dom';
import { storePopup } from '@skeletonlabs/skeleton';
import { userMock } from '../../utility/users.ts';

storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });


describe('User Components', () => {
	let host: HTMLDivElement;

	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
	});

	it('should render user prop for home with name and Rep ', () => {
		const instance = new UserProp({
			target: host,
			props: {
				view: 'home',
				user: userMock,
				role: 'Maintainer',
				posts: 7,
				userPhotoUrl: '',
			},
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).not.toContain('Maintainer');
		expect(host.innerHTML).toContain('Posts');
		expect(host.innerHTML).toContain("Rep: " + userMock.reputation);
		expect(host.innerHTML).toContain(userMock.firstName);
	});
	it('should render user prop for material view with name and role ', () => {
		const instance = new UserProp({
			target: host,
			props: {
				view: 'material',
				user: userMock,
				role: 'Maintainer',
				posts: 7,
				userPhotoUrl: '',
			},
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).toContain('Maintainer');
		expect(host.innerHTML).not.toContain('Posts');
		expect(host.innerHTML).not.toContain("Rep: " + userMock.reputation);
		expect(host.innerHTML).toContain(userMock.firstName);
	});
	it('should render user prop for publish view with name and role ', () => {
		const instance = new UserProp({
			target: host,
			props: {
				view: 'publish',
				user: userMock,
				role: 'Maintainer',
				posts: 7,
				userPhotoUrl: '',
			},
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).not.toContain('Posts');
		expect(host.innerHTML).not.toContain("Rep: " + userMock.reputation);
		expect(host.innerHTML).toContain(userMock.firstName);
	});
	it('should render user prop for search view with name and role ', () => {
		const instance = new UserProp({
			target: host,
			props: {
				view: 'search',
				user: userMock,
				role: 'Maintainer',
				posts: 7,
				userPhotoUrl: '',
			},
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).not.toContain('Maintainer');
		expect(host.innerHTML).toContain('Posts');
		expect(host.innerHTML).toContain("Rep: " + userMock.reputation);
		expect(host.innerHTML).toContain(userMock.firstName);
	});
});
