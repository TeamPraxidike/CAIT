import { coverPicFetcher, fileSystem } from '$lib/database';
import {PublicationType} from '@prisma/client';
import { profilePicFetcher } from '$lib/database/file';
import {getSimilarPublications} from "$lib/database/similarity";
import {verifyAuth} from "$lib/database/auth";

export async function GET({ locals, params }) {
    const authError = await verifyAuth(locals);
    if (authError) return authError;

    try {
        const publicationId = parseInt(params.publicationId);

        const similarContentObjects = await getSimilarPublications(publicationId);

        const similarPublications = similarContentObjects.map(similarContentObject => similarContentObject.similarTo);

        const similarPublicationsFetchedProfile = similarPublications.map(async (publication) => {
            return {
                publication,
                publisher: {
                    ...publication.publisher,
                    profilePicData: (await profilePicFetcher(
                        publication.publisher.profilePic,
                    )).data,
                },
            };
        });
        const similarPublicationsFinalData = similarPublicationsFetchedProfile.map(async (info) => {
            let coverPicData;
            if (
                info.publication.type === PublicationType.Material &&
                info.publication.materials
            ) {
                coverPicData = (await coverPicFetcher(
                    info.publication.materials.encapsulatingType,
                    info.publication.coverPic,
                )).data;
            } else {
                const filePath = info.publication.coverPic!.path;
                const currentFileData = await fileSystem.readFile(filePath);
                coverPicData = currentFileData.toString('base64');
            }
            return {
                ...info,
                coverPicData: coverPicData,
            };
        });
        return new Response(JSON.stringify(similarPublicationsFinalData), {
            status: 200,
        });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({ error: 'Server Error' }), {
            status: 500,
        });
    }
}
