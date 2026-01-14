import supabase from "$lib/server/db";

export async function POST({ request }) {
    const formData = await request.formData();
    const files = formData.getAll('file'); 

    if (!files) { 
        return new Response(JSON.stringify({ error: true, message: 'No files uploaded' }), { status: 400 });
    }

    const urls = []; 

    for (const file of files) {
        const fileName = encodeURIComponent(file.name);
        const filePath = `feed_image/${fileName}`;

        const { error } = await supabase.storage.from('bu').upload(filePath, file ,{
           
        });

        if (error) {
            return new Response(JSON.stringify({ error: true, message: error.message }), { status: 500 });
        }

        const { data, error: urlError } = await supabase.storage.from('bu').getPublicUrl(filePath);

        if (urlError) {
            return new Response(JSON.stringify({ error: true, message: urlError.message }), { status: 500 });
        }

        urls.push(data.publicUrl); 
    }
    console.log(urls);
    return new Response(JSON.stringify({ message: 'Files uploaded successfully' }), { status: 200 });
}
