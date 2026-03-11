<script lang="ts">
	import type { Publication } from "$lib/database/db";
	import type { Course, User } from "@prisma/client";

    export let user:User;
    export let subject: Publication|Course;

    let subjectName = "";
    let isPublication:boolean;

    if ('title' in subject){
        // is publication
        subjectName = subject.title
        isPublication = true;
        } else {
        // is Course
        subjectName = subject.courseName
        isPublication = false;
    }



    let createSubject = () => {
         if (isPublication){
            return `Regarding your Publication ${subjectName} on the CAIT platform`;
         } else {
            return `Regarding your Course ${subjectName} on the CAIT platform`;
         }

    }

    function createBody(){
        return `Hello ${user.username},\nI was curious about your ${isPublication ? "Publication" : "Course"}: "${subjectName}" which you currently have available on the CAIT platform\n`;
    }

</script>

<a
    href = {`mailto:${user.email}?subject=${createSubject()}&body=${createBody()}`}
    class="py-1 px-4 bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85 text-center"
>
Contact
</a>
