import { describe, it, expect, beforeEach } from 'vitest';
import { Comment } from '$lib';
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
import ToastStoreWrapper from './ToastStoreWrapper.svelte';

storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

describe('Comments', () => {
	let host: HTMLDivElement;
	const comment = {
		id: 1,
		publicationId: 1,
		userId: 1,
		likes: 5,
		content: 'hahahahaha',
		createdAt: new Date(),
		updatedAt: new Date(),
	};
	const comment2 = {
		id: 1,
		publicationId: 1,
		userId: 1,
		likes: 5,
		content: 'hahahahaha',
		createdAt: new Date(2019, 5, 1, 13, 0),
		updatedAt: new Date(2020, 5, 1, 13, 0),
	};
	const comment3 = {
		id: 1,
		publicationId: 1,
		userId: 1,
		likes: 5,
		content: 'hahahahaha',
		createdAt: new Date(2020, 5, 1, 12, 0),
		updatedAt: new Date(2020, 5, 1, 13, 0),
	};

	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
	});

	it('should render comment with no edited ', () => {
		const instance = new ToastStoreWrapper({
			target: host,
			props: {
				component: Comment,
				props: {
					isReply: false,
					commenter: { ...userMock, profilePicData: "" },
					liked: false,
					photoUrl: null,
					interaction: comment,
				}
			},
		});

		expect(instance).toBeTruthy();
		expect(host.innerHTML).not.toContain('Edited');
		expect(host.innerHTML).toContain('just now');
		expect(host.innerHTML).toContain('hahahahaha');
		expect(host.innerHTML).toContain('Reply');
	});
	it('should render comment with edited ', () => {
		const instance = new ToastStoreWrapper({
			target: host,
			props: {
				component: Comment,
				props: {
					isReply: false,
					commenter: { ...userMock, profilePicData: "" },
					liked: false,
					photoUrl: null,
					interaction: comment2,
				}
			},
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).toContain('Edited');
		expect(host.innerHTML).not.toContain('just now');
	});
	it('should render comment created prior to current moment ', () => {
		const instance = new ToastStoreWrapper({
			target: host,
			props: {
				component: Comment,
				props: {
					isReply: false,
					commenter: { ...userMock, profilePicData: "" },
					liked: false,
					photoUrl: null,
					interaction: comment3,
				}
			},
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).toContain('Edited');
		expect(host.innerHTML).toContain('ago');
	});
	it('should render reply with no reply option ', () => {
		const instance = new ToastStoreWrapper({
			target: host,
			props: {
				component: Comment,
				props: {
					isReply: true,
					commenter: { ...userMock, profilePicData: "" },
					liked: false,
					photoUrl: null,
					interaction: comment,
				}
			},
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).not.toContain('Edited');
		const replyForm = host.querySelector('.col-start-2.hidden');
		expect(replyForm).toBeTruthy();
	});
});
