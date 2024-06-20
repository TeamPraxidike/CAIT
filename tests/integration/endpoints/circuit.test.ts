import { describe, expect, it } from 'vitest';

// async function populate() {
// 	const reqBody = {
// 		firstName: 'Paisii',
// 		lastName: 'Hilendarski',
// 		email: 'paiskataH@yahoomail.com',
// 		logged2InPfp: 'paiskata.jpg',
// 	};
// 	const user = await fetch(`${testingUrl}/user`, {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json',
// 		},
// 		body: JSON.stringify(reqBody),
// 	});
// 	const userData = await user.json();
//
// 	return {
// 		title: 'Vasko and Friends',
// 		description: 'Vasko falls in love with Travis Scott',
// 		copyright: "true",
// 		difficulty: Difficulty.easy,
// 		userId: userData.user.id,
// 	};
// }

describe('Circuits', async () => {
	it('should be remade', () => {
		expect(true).toBe(true);
	});
});

//
// describe('Circuits', async () => {
// 	describe('[GET] /circuit/:id', () => {
// 		it('should respond with 400 if the id is < 0', async () => {
// 			const response = await fetch(`${testingUrl}/circuit/-1`, {
// 				method: 'GET',
// 			});
// 			expect(response.status).toBe(400);
// 			const body = await response.json();
// 			expect(body.error).toEqual('Bad Request - Invalid ID');
// 			expect(body).not.toHaveProperty('id');
// 		});
//
// 		it('should respond with 400 if the id is = 0', async () => {
// 			const response = await fetch(`${testingUrl}/circuit/0`, {
// 				method: 'GET',
// 			});
// 			expect(response.status).toBe(400);
// 			const body = await response.json();
// 			expect(body.error).toEqual('Bad Request - Invalid ID');
// 			expect(body).not.toHaveProperty('id');
// 		});
//
// 		it('should respond with 400 if the id is malformed', async () => {
// 			const response = await fetch(`${testingUrl}/circuit/yoan`, {
// 				method: 'GET',
// 			});
// 			expect(response.status).toBe(400);
// 			const body = await response.json();
// 			expect(body.error).toEqual('Bad Request - Invalid ID');
// 			expect(body).not.toHaveProperty('id');
// 		});
//
// 		it('should respond with 404 if the publication of type circuit does not exist', async () => {
// 			const response = await fetch(`${testingUrl}/circuit/1`, {
// 				method: 'GET',
// 			});
// 			expect(response.status).toBe(404);
// 			const body = await response.json();
// 			expect(body.error).toBe('Circuit Not Found');
// 			expect(body).not.toHaveProperty('firstName');
// 		});
//
// 		// it('should respond with 500 if a server-side error occurs during execution', async () => {
// 		//     prisma.circuit.findUnique = vi.fn().mockRejectedValue(new Error("Very important message"));
// 		//
// 		//     const response = await fetch(`${testingUrl}/circuit/1`, {method: 'GET'});
// 		//
// 		//     const responseBody = await response.json();
// 		//
// 		//     expect(response.status).toBe(500);
// 		//     expect(responseBody.error).toBe("Server error");
// 		//     vi.restoreAllMocks();
// 		// });
//
// 		it('should respond with 200 if the publication of type circuit exists', async () => {
// 			const circuitData = await populate();
//
// 			const circuit = await createCircuitPublication(circuitData);
//
// 			const response = await fetch(
// 				`${testingUrl}/circuit/${circuit.publicationId}`,
// 				{ method: 'GET' },
// 			);
// 			expect(response.status).toBe(200);
//
// 			const responseBody = await response.json();
//
// 			expect(responseBody).toHaveProperty('publication.publisherId');
// 			expect(responseBody.publicationId).toBe(responseBody.publication.id);
//
// 			await resetCircuitTable();
// 		});
// 	});
//
// 	describe('[GET] /circuit', () => {
// 		beforeEach(async () => {
// 			await resetCircuitTable();
// 		});
//
// 		// it('should respond with 500 if a server-side error occurs', async () => {
// 		//     prisma.circuit.findMany = vi.fn().mockRejectedValue(new Error("Very important message"));
// 		//
// 		//     const response = await fetch(`${testingUrl}/circuit`, {method: 'GET'});
// 		//
// 		//     const responseBody = await response.json();
// 		//
// 		//     expect(response.status).toBe(500);
// 		//     expect(responseBody.error).toBe("Server error");
// 		//     vi.restoreAllMocks();
// 		// });
//
// 		it('should handle zero circuits', async () => {
// 			const response = await fetch(`${testingUrl}/circuit`, { method: 'GET' });
// 			expect(response.status).toBe(200);
//
// 			const responseBody = await response.json();
//
// 			expect(responseBody).toHaveLength(0);
// 		});
//
// 		it('should handle one circuit', async () => {
// 			const circuitData = await populate();
//
// 			await createCircuitPublication(circuitData);
//
// 			const response = await fetch(`${testingUrl}/circuit`, { method: 'GET' });
// 			expect(response.status).toBe(200);
//
// 			const responseBody = await response.json();
//
// 			expect(responseBody[0]).toHaveProperty('publication.publisherId');
// 			expect(responseBody[0].publicationId).toBe(
// 				responseBody[0].publication.id,
// 			);
// 			expect(responseBody).toHaveLength(1);
// 		});
//
// 		it('should handle two or more (random number) circuits', async () => {
// 			const randomNumber = Math.round(Math.random() * 8) + 2;
// 			for (let i = 0; i < randomNumber; i++) {
// 				const circuitData = await populate();
// 				await createCircuitPublication(circuitData);
// 			}
//
// 			const response = await fetch(`${testingUrl}/circuit`, { method: 'GET' });
// 			expect(response.status).toBe(200);
//
// 			const responseBody = await response.json();
//
// 			expect(responseBody).toHaveLength(randomNumber);
// 		});
// 	});
//
// 	describe('[DELETE] /circuit/:id', () => {
// 		it('should respond with 400 if the id is < 0', async () => {
// 			const response = await fetch(`${testingUrl}/circuit/-1`, {
// 				method: 'DELETE',
// 			});
// 			expect(response.status).toBe(400);
// 			const body = await response.json();
// 			expect(body.error).toEqual('Bad Delete Request - Invalid Circuit Id');
// 			expect(body).not.toHaveProperty('id');
// 		});
//
// 		// it('should respond with 200 if successful deletion of everything related to circuit', async () => {
// 		// 	const circuitdata = await populate();
// 		// 	const material = {
// 		// 		title: 'Priklucheniqta na Vasko',
// 		// 		description: 'Vasko nqma kraka',
// 		// 		difficulty: Difficulty.hard,
// 		// 		userId: circuitdata.userId,
// 		// 		timeEstimate: 1000,
// 		// 		theoryPractice: 9,
// 		// 		copyright: "true",
// 		// 		paths: ['./vasko/nqma/kraka15.txt'],
// 		// 		titles: ['vaskoGoworiNaKitaiski.txt'],
// 		// 	};
// 		//
// 		// 	const createdResponse = await fetch(`${testingUrl}/material`, {
// 		// 		method: 'POST',
// 		// 		headers: {
// 		// 			'Content-Type': 'application/json',
// 		// 		},
// 		// 		body: JSON.stringify(material),
// 		// 	});
// 		//
// 		// 	const createdMat = await createdResponse.json();
// 		//
// 		// 	//TODO:replace this with a call to api for posting a circuit
// 		// 	const createdCircuit = await createCircuitPublication(circuitdata);
// 		// 	console.log(createdMat);
// 		// 	//TODO:replace this with a call to the api for node I suppose
// 		// 	const node = prisma.node.create({
// 		// 		data: {
// 		// 			contentId: createdMat.material.id,
// 		// 			circuitId: createdCircuit.publicationId,
// 		// 		},
// 		// 	});
// 		// 	console.log('PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP');
// 		// 	console.log(createdCircuit.publicationId);
// 		// 	const response = await fetch(
// 		// 		`${testingUrl}/circuit/${createdCircuit.publicationId}`,
// 		// 		{
// 		// 			method: 'DELETE',
// 		// 		},
// 		// 	);
// 		//
// 		// 	//TODO: I suppose file api here as well
// 		// 	const file = await prisma.file.findUnique({
// 		// 		where: { path: './vasko/nqma/kraka15.txt' },
// 		// 	});
// 		// 	// const findNode = await prisma.node.findUnique({
// 		// 	// 	where: {id: node.}
// 		// 	// })
// 		//
// 		// 	expect(file).toBeTruthy();
// 		// 	const body = await response.json();
// 		//
// 		// 	await resetCircuitTable();
// 		// 	await resetMaterialTable();
// 		// });
// 	});
// });
