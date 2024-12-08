import type { Material, Node as PrismaNode, Publication, User } from '@prisma/client';


export type CircuitNode = PrismaNode & {
	publication: Publication & {
		tags: { content: string }[],
		usedInCourse: { course: string }[],
		publisher: (User & { profilePicData: string })
		coverPicData: string,
		materials: Material,
	}
	next: {
		circuitId: number,
		fromPublicationId: number,
		toPublicationId: number
	}[]
}

export type CyNode = {
	id : () => string,
	data : () => {extensions:string[]}
}

export type DisplayedMaterials = {
	displayedMaterials : (FullMaterial)[],
		displayedIds : number[]
}

export type FullPublication = Publication & {
	materials : Material
	tags: { content: string }[],
		usedInCourse: { course: string }[]
};

export type FullMaterial = Material & {
	publication : FullPublication
}

export type NodeInfo = {
	id : number,
	title : string,
	isMaterial : boolean,
	extensions : string []
}
