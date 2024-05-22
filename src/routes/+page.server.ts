export const actions = {
    default: async ({cookies}) => {
        console.log("default action");
        cookies.set("userId", "1", {path: "/"});
    },
}