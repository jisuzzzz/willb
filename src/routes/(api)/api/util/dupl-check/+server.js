import supabase from '$lib/server/db.js';

export async function POST({ request }) {
    const { nick } = await request.json();
    if (!nick) {
        return new Response(JSON.stringify({ error: true, message: "Required field is missing"}));
    }
    const { data:dupl, error } = await supabase
        .from('users')
        .select('nickname')
        .eq('nickname', nick)
        .single();
    if (dupl) {
        return new Response(JSON.stringify({ error: true, message: "Nickname is duplicated" }), {status:409});
    }
    else {
        return new Response(JSON.stringify({success: true, data:dupl}), {status:200});
    }
}