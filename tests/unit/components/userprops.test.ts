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
storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

describe('User Components', () => {
	let host: HTMLDivElement;
	const user = {
		id: 'aaaaaaaaaa',
		firstName: 'Ivan',
		lastName: 'Guenov',
		email: 'kitajski@gmail.com',
		username: 'ivanguenov',
		aboutMe: "Hello I am a user",
		// profilePic: '',
		password: 'password',
		reputation: 5,
		isAdmin: false,
		emailVerified: null,
		createdAt: new Date(2),
		updatedAt: new Date(2),
	};

	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
	});

	it('should render user prop for home with name and Rep ', () => {
		const instance = new UserProp({
			target: host,
			props: {
				view: 'home',
				user: user,
				role: 'Maintainer',
				posts: 7,
				userPhotoUrl: '',
			},
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).not.toContain('Maintainer');
		expect(host.innerHTML).toContain('Posts');
		expect(host.innerHTML).toContain('Rep: 5');
		expect(host.innerHTML).toContain('Ivan Guenov');
	});
	it('should render user prop for material view with name and role ', () => {
		const instance = new UserProp({
			target: host,
			props: {
				view: 'material',
				user: user,
				role: 'Maintainer',
				posts: 7,
				userPhotoUrl: '',
			},
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).toContain('Maintainer');
		expect(host.innerHTML).not.toContain('Posts');
		expect(host.innerHTML).not.toContain('Rep: 5');
		expect(host.innerHTML).toContain('Ivan Guenov');
	});
	it('should render user prop for publish view with name and role ', () => {
		const instance = new UserProp({
			target: host,
			props: {
				view: 'publish',
				user: user,
				role: 'Maintainer',
				posts: 7,
				userPhotoUrl: '',
			},
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).not.toContain('Posts');
		expect(host.innerHTML).not.toContain('Rep: 5');
		expect(host.innerHTML).toContain('Ivan Guenov');
	});
	it('should render user prop for search view with name and role ', () => {
		const instance = new UserProp({
			target: host,
			props: {
				view: 'search',
				user: user,
				role: 'Maintainer',
				posts: 7,
				userPhotoUrl: '',
			},
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).not.toContain('Maintainer');
		expect(host.innerHTML).toContain('Posts');
		expect(host.innerHTML).toContain('Rep: 5');
		expect(host.innerHTML).toContain('Ivan Guenov');
	});
});
