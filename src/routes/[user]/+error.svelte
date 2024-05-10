<script lang="ts">
    import {Meta} from "$lib";
    import {page} from "$app/stores";

    let {title, description, type} = {
        title: $page.status.toString(),
        description: $page.error ?
            $page.error.message :
            "An error occurred while loading the page. Please try again later.",
        type: "site"
    }


</script>

<Meta {title} {description} {type} />

<p>{$page.status}</p>
<p>{$page.error?.message}</p>
