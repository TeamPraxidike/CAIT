<script lang="ts">
	import type { Publication } from "$lib/database/db";
	import type { Course, User } from "@prisma/client";

    export let target_user:User;
    export let subject: Publication|Course|undefined = undefined;
    export let style:string = "py-1 px-4 bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85 text-center";

    let subjectName = "";
    let isPublication:boolean = false;
    let isCourse:boolean = false;


    if (subject && 'title' in subject){
        // is publication
        subjectName = subject.title
        isPublication = true;
    } else if (subject) {
        // is Course
        subjectName = subject?.courseName
        isCourse = true;
    } else {
        subjectName = ""
    }



    let createSubject = () => {
         if (isPublication){
            return `Question about your publication: ${subjectName} on CAIT`;
         } else if (isCourse) {
            return `Question about your course: ${subjectName} on CAIT`;
         } else {
            return `Message via CAIT platform`;
         }

    }

    function createBody(){
        let body = `Dear ${target_user.firstName},%0A%0A`

        if (isPublication || isCourse){
            body += `I have a question about your ${isPublication ? "Publication" : "Course"}: "${subjectName}" which you currently have available on the CAIT platform.%0A%0A`
        } else {
            body += `I am contacting you regarding the CAIT platform.%0A%0A`
        }

        

        return body;
    }

    function generateMailTo(){
        return `mailto:${target_user.email}?subject=${createSubject()}&body=${createBody()}`;
    }

</script>

<a
    href = {generateMailTo()}
    class={style}
>
Contact
</a>
