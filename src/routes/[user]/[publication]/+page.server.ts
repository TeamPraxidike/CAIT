import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import {
	Difficulty,
	type Publication,
	PublicationType,
	type User,
} from '@prisma/client';
import { lorem } from '$lib';

export const load: PageServerLoad = async () => {
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
