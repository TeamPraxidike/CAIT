// import { Difficulty } from '@prisma/client';
// import {nodes, liked, saved} from '$lib/components/circuits/components/Circuit.svelte'
// import type { NodeDiffActions } from '$lib/database';
//
//
import type { DisplayedMaterials } from '$lib/components/circuits/methods/CircuitTypes';
import { getFileExtension } from '$lib/components/circuits/methods/CircuitUtilMethods';

/**
 * Fetches all materials
 */
export const fetchMaterials = async () => {
	let returnedData : DisplayedMaterials = {
		displayedMaterials : [],
		displayedIds : []
	}

	await fetch('/api/material')
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			// Handle the response data from the API
			returnedData = {
					displayedMaterials : data.materials,
					displayedIds : data.idsMat
				}
		})
		.catch(error => {
			console.error('There was a problem with the fetch operation:', error);
		});

	return returnedData
};

export const fetchNode = async (pubId : number) => {
	let nodeInfo = {
		id : -1,
		title : "",
		extensions : [],
		isMaterial : false,
		username: "",
		posX : 0,
		posY : 0,
		next : []
	}
	await fetch(`/api/publication/${pubId}`)
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			let extensions = [];
			if (data.isMaterial) {
				extensions = data.publication.materials.files.map((f: { title: string; }) => getFileExtension(f.title));
			}

			nodeInfo = {
				id: pubId,
				title: data.publication.title,
				isMaterial: data.isMaterial,
				extensions: extensions,
				username: data.publication.publisher.username,
				posX : 0,
				posY : 0,
				next:[]
			}
		})
		.catch(error => {
			console.error('There was a problem with the fetch operation:', error);
		});

	return nodeInfo
};