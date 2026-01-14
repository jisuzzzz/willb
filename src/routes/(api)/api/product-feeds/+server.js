import supabase from '$lib/server/db';

export async function POST({ request, locals }) {
try {
    const user = locals.user;
    if(!user) {
        return new Response(JSON.stringify({ error: true, message: "Unauthorized" }), { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title');
    const files = formData.getAll('file');
    const category_id_string = formData.get('category_id');
    const category_id = parseInt(category_id_string, 10);
    // const category_id = formData.get('category_id');
    const description = formData.get('description');
    const price_string = formData.get('price');
    const price = parseFloat(price_string);
    // const price = formData.get('price');
    const delivery_info = formData.get('delivery_info');
    const dispatch_info = formData.get('dispatch_info');
    const size_info = formData.get('size_info');
    const model_info = formData.get('model_info');
    const return_exchange_info = formData.get('return_exchange_info');
    const hashtag_id_string = formData.get('hashtag_id');
    const hashtag_id = parseInt(hashtag_id_string, 10);
    // const hashtag_id = formData.get('hashtag_id');
    const sizes_data_string = formData.get('sizes_data');
    const sizes_data = JSON.parse(sizes_data_string);
    // const sizes_data = formData.get('sizes_data');


    if (!files || !title || !category_id || !description || !price ||
        !delivery_info || !dispatch_info || !size_info || !model_info ||
        !return_exchange_info || !hashtag_id || !sizes_data){
        return new Response(JSON.stringify({ error: true, message: "Required fields are missing" }), { status: 400 });
    }
    
    const urls = [];
    
    for (const file of files) {
        const fileName = encodeURIComponent(file.name);
        const filePath = `product_image/${fileName}`;

        const { error: uploadError } = await supabase.storage
        .from('bu')
        .upload(filePath, file, {
            // contentType: file.type,
            // upsert: true
        });
    
        if (uploadError) {
            throw new Error(`Upload Error: ${uploadError.message}`);
        }

        const { data, error: urlError } = await supabase.storage
        .from('bu')
        .getPublicUrl(filePath);
    
        if (urlError) {
            throw new Error(`URL Retrieval Error: ${urlError.message}`);
        }
        
        urls.push(data.publicUrl);
    }

    const { data:post, error } = await supabase.rpc('post_product', {
        user_id: user.id,
        urls,
        category_id,
        title,
        description, 
        price, 
        delivery_info, 
        dispatch_info,
        size_info,
        model_info,
        return_exchange_info,
        hashtag_id,
        sizes_data
    });
    if (error) {
        throw error;
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: true, message: error.message || "An error occurred" }), { status: 500 });
    }
} 
