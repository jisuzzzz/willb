import supabase from '$lib/server/db';

export async function POST({ request, locals }) {
    const user = locals.user;
    if (!user) {
        return new Response(JSON.stringify({ error: true, message: "Unauthorized" }), { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const user_id  = formData.get('id');

    if (!file || !user_id) {
        return new Response(JSON.stringify({ error: true, message: "Required fields are missing" }), { status: 400 });
    }

    let url = '';

    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000);
    const fileExtension = file.name.split('.').pop();
    const fileName = `image-${timestamp}-${randomNum}.${fileExtension}`;
    
    const filePath = `profile_image/${encodeURIComponent(fileName)}`;

    const { error: uploadError } = await supabase.storage.from('bu').upload(filePath, file);

    if (uploadError) {
        return new Response(JSON.stringify({ error: true, message: `Upload Error: ${uploadError.message}` }), { status: 500 });
    }
    const { data, error: urlError } = await supabase.storage.from('bu').getPublicUrl(filePath);
    if (urlError) {
        return new Response(JSON.stringify({ error: true, message: `URL Error: ${urlError.message}` }), { status: 500 });
    }
    url = data.publicUrl;

    const { data: new_img, error } = await supabase
        .from('users')
        .update({ profile_image: url })
        .eq('id', user_id)
        .select();
    if (error)
    return new Response(JSON.stringify({ error: true, error_msg: error.message}), {status: 400});
    else{
        // console.log(data);
        return new Response(JSON.stringify({ success: true, new_img }), { status: 200 });
    }

}