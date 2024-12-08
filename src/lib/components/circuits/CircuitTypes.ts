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