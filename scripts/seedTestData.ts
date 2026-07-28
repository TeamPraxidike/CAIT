import { PrismaClient, Difficulty, MaterialType, PublicationType } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;
const PUBLISHER_EMAIL = "seed-author@example.org";

async function ensureDummyPublisher(): Promise<string> {
	if (SUPABASE_URL && SERVICE_ROLE_KEY) {
		const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				apikey: SERVICE_ROLE_KEY,
				Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
			},
			body: JSON.stringify({
				email: PUBLISHER_EMAIL,
				email_confirm: true,
				user_metadata: { firstName: "Seed", lastName: "Author" },
			}),
		});
		if (!res.ok && res.status !== 422) {
			console.warn(`Could not create dummy publisher (status ${res.status}); reusing existing user if present.`);
		}
	} else {
		console.warn("PUBLIC_SUPABASE_URL / SERVICE_ROLE_KEY not set; expecting the dummy publisher to already exist.");
	}

	const user = await prisma.user.findFirst({ where: { email: PUBLISHER_EMAIL } });
	if (!user) {
		throw new Error(
			"Dummy publisher could not be found or created. Is the auth service running and are SERVICE_ROLE_KEY / PUBLIC_SUPABASE_URL set in .env?",
		);
	}
	return user.id;
}

const TEST_MATERIALS = [
	{
		title: "[SEED] Gradient Descent by Hand",
		description:
			"A worked walkthrough of batch, stochastic and mini-batch gradient descent on a small regression dataset, including how the learning rate affects convergence.",
		difficulty: Difficulty.easy,
		encapsulatingType: MaterialType.lectureNotes,
		learningObjectives: [
			"Explain how gradient descent minimises a loss function.",
			"Compare batch, stochastic and mini-batch updates.",
			"Reason about the effect of the learning rate on convergence.",
		],
		prerequisites: ["Basic calculus", "Familiarity with linear regression"],
		tags: ["machine learning", "optimization", "regression"],
	},
	{
		title: "[SEED] Decision Trees and Information Gain",
		description:
			"An assignment that asks students to build a decision tree from a small dataset, compute entropy and information gain at each split, and discuss when to stop growing the tree.",
		difficulty: Difficulty.medium,
		encapsulatingType: MaterialType.assignment,
		learningObjectives: [
			"Compute entropy and information gain for a candidate split.",
			"Construct a decision tree from a labelled dataset.",
			"Argue when pruning improves generalisation.",
		],
		prerequisites: ["Probability basics", "Basic python"],
		tags: ["machine learning", "decision trees", "classification"],
	},
	{
		title: "[SEED] Attention and the Transformer Block",
		description:
			"Slides introducing scaled dot-product attention, multi-head attention and how these compose into a single transformer block used in modern language models.",
		difficulty: Difficulty.hard,
		encapsulatingType: MaterialType.slides,
		learningObjectives: [
			"Describe scaled dot-product attention.",
			"Explain why multiple attention heads are used.",
			"Outline the components of a transformer block.",
		],
		prerequisites: ["Neural network fundamentals", "Linear algebra"],
		tags: ["deep learning", "transformers", "natural language processing"],
	},
];

const TEST_COURSES = [
	{
		courseName: "[SEED] Foundations of Machine Learning",
		educationalLevel: "Bachelor",
		learningObjectives: [
			"Frame a problem as supervised or unsupervised learning.",
			"Train and evaluate a baseline model.",
		],
		prerequisites: ["Programming in python", "Basic statistics"],
	},
	{
		courseName: "[SEED] Deep Learning for Sequences",
		educationalLevel: "Master",
		learningObjectives: [
			"Implement recurrent and attention-based models.",
			"Diagnose optimisation and overfitting issues.",
		],
		prerequisites: ["Foundations of machine learning", "Numpy"],
	},
];

const TEST_CIRCUITS = [
	{
		title: "[SEED] From Optimisation to Transformers",
		description:
			"A learning path that walks from the basics of gradient descent through decision trees and on to attention, linking the relevant materials in order.",
		difficulty: Difficulty.medium,
		learningObjectives: ["Follow a guided path from optimisation fundamentals to modern architectures."],
		prerequisites: ["Basic python"],
		tags: ["machine learning", "learning path"],
		members: [
			"[SEED] Gradient Descent by Hand",
			"[SEED] Decision Trees and Information Gain",
			"[SEED] Attention and the Transformer Block",
		],
	},
	{
		title: "[SEED] Deep Learning Shortcut",
		description:
			"A compact circuit pointing straight from gradient descent to the transformer block for students who already know the classical methods.",
		difficulty: Difficulty.hard,
		learningObjectives: ["Move from optimisation basics directly to attention."],
		prerequisites: ["Neural network fundamentals"],
		tags: ["deep learning", "learning path"],
		members: ["[SEED] Gradient Descent by Hand", "[SEED] Attention and the Transformer Block"],
	},
];

async function seedMaterials(publisherId: string) {
	for (const m of TEST_MATERIALS) {
		const existing = await prisma.publication.findFirst({ where: { title: m.title } });
		if (existing) {
			console.log(`Skipping existing material: ${m.title}`);
			continue;
		}
		await prisma.publication.create({
			data: {
				title: m.title,
				description: m.description,
				difficulty: m.difficulty,
				type: PublicationType.Material,
				isDraft: false,
				learningObjectives: m.learningObjectives,
				prerequisites: m.prerequisites,
				publisher: { connect: { id: publisherId } },
				tags: {
					connectOrCreate: m.tags.map((content) => ({
						where: { content },
						create: { content },
					})),
				},
				materials: {
					create: {
						copyright: "Seed data, for testing only",
						encapsulatingType: m.encapsulatingType,
					},
				},
			},
		});
		console.log(`Created material: ${m.title}`);
	}
}

async function seedCourses(publisherId: string) {
	for (const c of TEST_COURSES) {
		await prisma.course.upsert({
			where: { courseName: c.courseName },
			update: {
				maintainers: { connect: { id: publisherId } },
			},
			create: {
				courseName: c.courseName,
				educationalLevel: c.educationalLevel,
				learningObjectives: c.learningObjectives,
				prerequisites: c.prerequisites,
				maintainers: { connect: { id: publisherId } },
			},
		});
		console.log(`Ensured course: ${c.courseName}`);
	}
}

async function seedCircuits(publisherId: string) {
	const memberPublications = await prisma.publication.findMany({
		where: { title: { in: TEST_MATERIALS.map((m) => m.title) } },
		select: { id: true, title: true },
	});
	const idByTitle = new Map(memberPublications.map((p) => [p.title, p.id]));

	for (const c of TEST_CIRCUITS) {
		const existing = await prisma.publication.findFirst({ where: { title: c.title } });
		if (existing) {
			console.log(`Skipping existing circuit: ${c.title}`);
			continue;
		}

		const memberIds = c.members
			.map((title) => idByTitle.get(title))
			.filter((id): id is number => id !== undefined);

		if (memberIds.length !== c.members.length) {
			console.warn(`Skipping circuit ${c.title}: not all member materials were found.`);
			continue;
		}

		const publication = await prisma.publication.create({
			data: {
				title: c.title,
				description: c.description,
				difficulty: c.difficulty,
				type: PublicationType.Circuit,
				isDraft: false,
				learningObjectives: c.learningObjectives,
				prerequisites: c.prerequisites,
				publisher: { connect: { id: publisherId } },
				tags: {
					connectOrCreate: c.tags.map((content) => ({
						where: { content },
						create: { content },
					})),
				},
				circuit: { create: { numNodes: memberIds.length } },
			},
			include: { circuit: true },
		});

		const circuitId = publication.circuit!.id;

		await prisma.node.createMany({
			data: memberIds.map((publicationId, index) => ({
				circuitId,
				publicationId,
				posX: 120,
				posY: 120 + index * 160,
				extensions: [],
			})),
		});

		await prisma.edge.createMany({
			data: memberIds.slice(0, -1).map((fromPublicationId, index) => ({
				circuitId,
				fromPublicationId,
				toPublicationId: memberIds[index + 1],
			})),
		});

		console.log(`Created circuit: ${c.title} (${memberIds.length} nodes)`);
	}
}

async function main() {
	const publisherId = await ensureDummyPublisher();
	console.log(`Using dummy publisher ${PUBLISHER_EMAIL} (${publisherId})`);
	await seedMaterials(publisherId);
	await seedCourses(publisherId);
	await seedCircuits(publisherId);
	console.log("Finished seeding test publications and courses.");
}

main()
	.catch((err) => {
		console.error("Seeding test data failed:", err);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
