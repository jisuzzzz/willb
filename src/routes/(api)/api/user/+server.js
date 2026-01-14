import supabase from '$lib/server/db';

export async function POST({ request, locals }) {
    const user = locals.user;
    if (!user) {
        return new Response(JSON.stringify({ error: true, message: "Unauthorized" }), { status: 401 });
    }
    const { user_id, new_data }  = await request.json();

    if (!user_id || !new_data) {
        return new Response(JSON.stringify({ error: true, message: "Required fields are missing" }), { status: 400 });
    }
    let res = {};
    // console.log(new_data);
    for (let key in new_data) {
        const value = new_data[key];
        // console.log(value);
        
        const {data, error} = await supabase
            .from('users')
            .update({ [key]: value })
            .eq('id', user_id)
            .select();
        if (error)
        return new Response(JSON.stringify({ error: true, error_msg: error.message}), {status: 400});
        res = data;
    }
    return new Response(JSON.stringify({ success: true, res }), { status: 200 });
}