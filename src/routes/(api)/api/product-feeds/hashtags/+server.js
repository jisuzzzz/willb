import supabase from '$lib/server/db';

export async  function POST({ request }) {
    const { name } = await request.json();

    if (name) {
        const { data, error } = await supabase
        .from('hashtags')
        .insert([{name}])
        .single();
        if (error) return new Response(JSON.stringify({error: true, error_msg: error.message}), {status: 400});
        else return new Response(JSON.stringify({success: true, data}), {status:200});
    }

}