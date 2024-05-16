<script lang="ts">
    import {type File} from "@prisma/client";

    export let activeFile:File;
</script>

<div class="min-h-40 border rounded-lg row-span-3">
    {activeFile.title}
</div>