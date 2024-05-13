import type { LayoutServerLoad } from './$types';
import { Difficulty, type Publication, PublicationType } from '@prisma/client';
import { lorem } from '$lib';

export const load: LayoutServerLoad = async () => {
	//{ params, fetch }
	let publication: Publication = {
		id: 0,
		title: 'Convolutional neural networks',
		description: lorem,
		difficulty: 'easy' as Difficulty,
		likes: 1,
		learningObjectives: [
			'Convolutional Neural Networks',
			'Convolutional Neural Networks',
			'Convolutional Neural Networks',
		],
		createdAt: new Date(),
		updatedAt: new Date(),
		publisherId: 2,
		reports: 3,
		type: PublicationType.Circuit,
	};

	return { publication };

	// const pRes = await fetch(`/api/material/${params.publication}`);
	//
	// console.log(pRes.status, pRes.statusText);
	//
	// if (pRes.status !== 200) {
	// 	error(pRes.status, pRes.statusText);
	// }
	//
	// const user: User = await pRes.json();
	// return { user };
};
