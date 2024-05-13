import {prisma} from "$lib/database";

// @ts-ignore
/**
 * Adds a new user to the database. Generates a unique username based on the user's first and last name.
 *
 * The way the username is generated is the following:
 * If the there is no other user with the same first and last name, the username is the concatenation of the first and last name.
 * If there are other users with the same first and last name, the username is the concatenation of the first and last name concatenated with an underscore and a number.
 * This number is the maximum number that someone with the same first and last name has in their username plus 1.
 * So for example the first Vasko Guenov I add would have a username VaskoGuenov, the second would have VaskoGuenov_2, the third VaskoGuenov_3 and so on.
 * This ensures that if I delete user VaskoGuenov_2, the next user with the same name would be VaskoGuenov_4. I did not see a point in having
 * complex logic to take up the smallest number available.
 *
 * @param firstName
 * @param lastName
 * @param email
 * @param profilePic
 */
export async function createUser(firstName: string, lastName: string, email: string, profilePic: string) {
    const users = await prisma.user.findMany({
        where: {
            firstName: firstName,
            lastName: lastName
        }
    });

    let maxNumber: number = users.length > 0 ? 1 : 0

    users.forEach(user => {
        const num = parseInt(user.username.split('_')[1]);
        if (!isNaN(num) && num > maxNumber) {
            maxNumber = num;
        }
    });

    let username: string;
    if (maxNumber == 0) {
        username = firstName + lastName;
    } else {
        username = firstName + lastName + '_' + (maxNumber + 1);
    }

    return prisma.user.create({
        data: {
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email,
            profilePic: profilePic,
        },
    });
}


/**
 * Returns the user with the given id.
 * @param id
 */
export async function getUserById(id: number) {
    // console.log('User:', user);
    return prisma.user.findUnique({
        where: {
            id: id
        },
    });
}

export async function deleteUser(userId: number) {
    return prisma.user.delete({
        where: {
            id: userId
        }
    });
}


