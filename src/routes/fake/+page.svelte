<!--<script lang="ts">-->
<!--    import UsedInCourse from "$lib/components/UsedInCourse.svelte";-->
<!--    import {createEventDispatcher} from "svelte";-->
<!--    import {Modal, type ModalComponent, type ModalSettings} from "@skeletonlabs/skeleton";-->
<!--    import {createMaterialPublication} from "$lib/database";-->
<!--    import {Difficulty} from "@prisma/client";-->


<!--    const dispatch = createEventDispatcher();-->

<!--    // const c = async () => {return await createMaterialPublication(1, {-->
<!--    //     title: 'cool publication',-->
<!--    //     description: 'This publication has description',-->
<!--    //     difficulty: Difficulty.easy,-->
<!--    //     materialType: 'video',-->
<!--    //     copyright: true,-->
<!--    //     timeEstimate: 4,-->
<!--    //     theoryPractice: 9,-->
<!--    //     learningObjectives: [],-->
<!--    //     prerequisites: [],-->
<!--    // })};-->

<!--    // const publication = c();-->

<!--    const modalRegistry: Record<string, ModalComponent> = {-->
<!--        // Set a unique modal ID, then pass the component reference-->
<!--        useInCourseComponent: {-->
<!--            ref: UsedInCourse,-->
<!--            props: {-->
<!--                courses: ["Machine learning", "CSE 2430"],-->
<!--                publicationId: 2,-->
<!--            }-->
<!--        },-->
<!--    };-->
<!--    const modal: ModalSettings = {-->
<!--        type: 'component',-->
<!--        component: 'useInCourseComponent',-->
<!--        response: (r: boolean | undefined) => console.log('response:', r)-->
<!--    };-->

<!--    function handleMessage(event: CustomEvent<{ text: string }>) {-->
<!--        alert(event.detail.text);-->
<!--        console.log(event)-->
<!--        console.log("hello there")-->
<!--    }-->
<!--</script>-->


<!--&lt;!&ndash;<UsedInCourse publicationId={1} />&ndash;&gt;-->

<!--<Modal components={modalRegistry} on:updateUsedInCourse={handleMessage} />-->
