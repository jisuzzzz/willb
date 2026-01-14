import supabase from "$lib/server/db";

export async function POST({ request }) {
    const formData = await request.formData();
    // console.log(formData);
    const files = formData.getAll('file');

    // console.log(file);
    if (!files) {
        return new Response(JSON.stringify({ error: true, message: 'No file uploaded' }), { status: 400 });
    }

    for (const file of files) {
        const fileName = encodeURIComponent(file.name);
        const filePath = `product_image/${fileName}`;

        // console.log(file);

        const { data, error: uploadError } = await supabase.storage
        .from('bu')
        .upload(filePath, file, {
            contentType: file.type,
            upsert: true
        });
        if (uploadError){
            return new Response(JSON.stringify({error: true, message: uploadError.message}), {status: 500});
        }
        const { data:url, error: urlError } = await supabase.storage.from('bucket').getPublicUrl(filePath);

        if (urlError) {
            return new Response(JSON.stringify({ error: true, message: urlError.message }), { status: 500 });
        }
        console.log(url);
    }
    // console.log(data);



    // const { data:url, error: urlError } = supabase.storage.from('bucket').getPublicUrl(filePath);

    // if (urlError) {
    //     return new Response(JSON.stringify({ error: true, message: urlError.message }), { status: 500 });
    // }
    // console.log(url);
    return new Response(JSON.stringify({ message: 'File uploaded successfully' }), { status: 200 });
}
