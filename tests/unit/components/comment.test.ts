import { describe, it, expect, beforeEach } from 'vitest';
import { DiffBar } from '$lib';

describe('Difficulty Components', () => {
	let host: HTMLDivElement;

	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
	});
	it('should render easy/green difficulty bar', () => {
		const instance = new DiffBar({
			target: host,
			props: { diff: 'hard' },
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).toContain('bg-error-400');
		expect(host.innerHTML).not.toContain('bg-amber-400');
		expect(host.innerHTML).not.toContain('bg-green-500');
	});
});

//temporary test suspension until I figure out how to test skeleton modals if possible
// import { describe, it, expect, beforeEach } from 'vitest';
// import { Comment } from '$lib';
// import {
// 	computePosition,
// 	autoUpdate,
// 	flip,
// 	shift,
// 	offset,
// 	arrow,
// } from '@floating-ui/dom';
// import { storePopup } from '@skeletonlabs/skeleton';
// storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
//
// describe('Comments', () => {
// 	let host: HTMLDivElement;
// 	const comment = {
// 		id: 1,
// 		publicationId: 1,
// 		userId: 1,
// 		likes: 5,
// 		content: 'hahahahaha',
// 		createdAt: new Date(),
// 		updatedAt: new Date(),
// 	};
// 	const comment2 = {
// 		id: 1,
// 		publicationId: 1,
// 		userId: 1,
// 		likes: 5,
// 		content: 'hahahahaha',
// 		createdAt: new Date(),
// 		updatedAt: new Date(2020, 5, 1, 13, 0),
// 	};
// 	const comment3 = {
// 		id: 1,
// 		publicationId: 1,
// 		userId: 1,
// 		likes: 5,
// 		content: 'hahahahaha',
// 		createdAt: new Date(2020, 5, 1, 12, 0),
// 		updatedAt: new Date(2020, 5, 1, 13, 0),
// 	};
//
// 	beforeEach(() => {
// 		host = document.createElement('div');
// 		document.body.appendChild(host);
// 	});
//
// 	it('should render comment with no edited ', () => {
// 		const instance = new Comment({
// 			target: host,
// 			props: {
// 				isReply: false,
// 				popupName: 'comm1',
// 				interaction: comment,
// 			},
// 		});
// 		expect(instance).toBeTruthy();
// 		expect(host.innerHTML).not.toContain('Edited');
// 		expect(host.innerHTML).toContain('just now');
// 		expect(host.innerHTML).toContain('5');
// 		expect(host.innerHTML).toContain('Tom Viering');
// 		expect(host.innerHTML).toContain('Reply');
// 	});
// 	it('should render comment with edited ', () => {
// 		const instance = new Comment({
// 			target: host,
// 			props: {
// 				isReply: false,
// 				popupName: 'comm2',
// 				interaction: comment2,
// 			},
// 		});
// 		expect(instance).toBeTruthy();
// 		expect(host.innerHTML).toContain('Edited');
// 		expect(host.innerHTML).toContain('just now');
// 		expect(host.innerHTML).toContain('5');
// 		expect(host.innerHTML).toContain('Tom Viering');
// 	});
// 	it('should render comment created prior to current moment ', () => {
// 		const instance = new Comment({
// 			target: host,
// 			props: {
// 				isReply: false,
// 				popupName: 'comm1',
// 				interaction: comment3,
// 			},
// 		});
// 		expect(instance).toBeTruthy();
// 		expect(host.innerHTML).toContain('Edited');
// 		expect(host.innerHTML).toContain('ago');
// 		expect(host.innerHTML).toContain('5');
// 		expect(host.innerHTML).toContain('Tom Viering');
// 	});
// 	it('should render reply with no reply option ', () => {
// 		const instance = new Comment({
// 			target: host,
// 			props: {
// 				isReply: true,
// 				popupName: 'comm1',
// 				interaction: comment,
// 			},
// 		});
// 		expect(instance).toBeTruthy();
// 		expect(host.innerHTML).not.toContain('Edited');
// 		expect(host.innerHTML).toContain('just now');
// 		expect(host.innerHTML).toContain('5');
// 		expect(host.innerHTML).toContain('Tom Viering');
// 		expect(host.innerHTML).not.toContain('Reply');
// 	});
// });
