import supabase from '$lib/server/db';

export async function POST({ request, locals }) {
    const user = locals.user;
    if (!user) {
        return new Response(JSON.stringify({ error: true, message: "Unauthorized" }), { status: 401 });
    }
    const { feed_id, comment, parent_id } = await request.json();

    if( feed_id && comment ) {
        const { data, error } = await supabase
        .from('replies')
        .insert([
            {
                user_id: user.id,
                feed_id,
                comment,
                parent_id // null 이면 제일 상위 댓글임 (대댓글 기능)
            }
        ]).select();
        // console.log("server_data: ",data);
        if (error) 
            return new Response(JSON.stringify({ error: true, error_msg: error.message}), {status: 400});
        else 
            return new Response(JSON.stringify({ success: true , data}), { status: 200 });
    }
    return new Response(JSON.stringify({ error: true, error_msg: "Required fields are missing" }), { status: 403 });
}

export async function DELETE({ request, locals }) {
    const user = locals.user;
    if (!user) {
        return new Response(JSON.stringify({ error: true, message: "Unauthorized" }), { status: 401 });
    }
    const {id} = await request.json();
    if(!id) {
        return new Response(JSON.stringify({ error: true, message: "Required fields are missing" }), { status: 400 });
    }
    const { error } = await supabase
        .from('replies')
        .delete()
        .eq('id', id);
    if (error)
        return new Response(JSON.stringify({ error: true, error_msg: error.message}), {status: 402});
    else 
        return new Response(JSON.stringify({ success: true }), { status: 200 });
}