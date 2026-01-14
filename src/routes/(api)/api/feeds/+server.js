import supabase from '$lib/server/db.js';

export async function POST({ request, locals }) {
try {
    const user = locals.user;
    if (!user) {
        return new Response(JSON.stringify({ error: true, message: "Unauthorized" }), { status: 401 });
    }
    const formData = await request.formData();
    const files = formData.getAll('file');
    const content = formData.get('content');
    const tags_json = formData.get('hashtags');

    if (!files || !content ||!tags_json) {
        return new Response(JSON.stringify({ error: true, message: "Required fields are missing" }), { status: 400 });
    }

    const tags_arr = JSON.parse(tags_json);
    const hashtags = '{' + tags_arr.map(tag => `"${tag.replace(/"/g, '""')}"`).join(', ') + '}';

    const urls = [];
    for (const file of files) {
        const timestamp = new Date().getTime();
        const randomNum = Math.floor(Math.random() * 1000);
        const fileExtension = file.name.split('.').pop();
        const fileName = `image-${timestamp}-${randomNum}.${fileExtension}`;
        
        const filePath = `feed_image/${encodeURIComponent(fileName)}`;

        const { data:img,error: uploadError } = await supabase.storage.from('bu').upload(filePath, file);
    
        if (uploadError) {
            throw new Error(`Upload Error: ${uploadError.message}`);
        }
        
        const { data, error: urlError } = await supabase.storage.from('bu').getPublicUrl(filePath);

        if (urlError) {
            throw new Error(`URL Retrieval Error: ${urlError.message}`);
        }
        urls.push(data.publicUrl);
    }
    const { data: post, error } = await supabase.rpc('post_feed', {
        user_id: user.id,
        content,
        urls,
        hashtags
    });

    if (error) {
        throw error;
    }
    return new Response(JSON.stringify({ success: true, post }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: true, message: error.message || "An error occurred" }), { status: 500 });
    }

}

export async function DELETE({ request, locals }) {
    const user = locals.user;
    if (!user) {
        return new Response(JSON.stringify({ error: true, message: "Unauthorized" }), { status: 401 });
    }
    const {id} = await request.json();
    // console.log(id)
    if(!id) {
        return new Response(JSON.stringify({ error: true, message: "Required fields are missing" }), { status: 400 });
    }
    const { error } = await supabase.rpc('delete_feed', {
        v_id: id
    });
    if (error)
        return new Response(JSON.stringify({ error: true, error_msg: error.message}), {status: 402});
    else 
        return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function PATCH({ request, locals }) {
    const user = locals.user;
    if (!user) {
        return new Response(JSON.stringify({ error: true, message: "Unauthorized" }), { status: 401 });
    }
    const { content, feed_id } = await request.json();

    if (!content || !feed_id) {
        return new Response(JSON.stringify({ error: true, message: "Required fields are missing" }), { status: 400 });
    }

    const { data, error } = await supabase
        .from('feeds')
        .update({content:content})
        .eq('id', feed_id)
        .select();
    if (error)
        return new Response(JSON.stringify({ error: true, error_msg: error.message}), {status: 400});
    else
        return new Response(JSON.stringify({ success: true, data }), { status: 200 });
}