import supabase from '$lib/server/db';

export async function POST({ request, locals }) {
    const user = locals.user;
    if (!user) {
        return new Response(JSON.stringify({ error: true, message: "Unauthorized" }), { status: 401 });
    }

    const { feed_id, user_id, trigger_user_id, noti_type } = await request.json();

    if( !feed_id || !user_id || !trigger_user_id || !noti_type ) {
        return new Response(JSON.stringify({ error: true, message: "Required fields are missing" }), { status: 400 });
    }
    if ( noti_type !== 'like' && noti_type !=='comment' ) {
        return new Response(JSON.stringify({ error: true, message: "noti_type can be only like or comment" }), { status: 400 });
    }
    const { data: noti, error } = await supabase
        .from('notification')
        .insert([
            {
                user_id,
                feed_id,
                trigger_user_id,
                noti_type,
                is_read: false
            }
        ]).select();
    if (error)
        return new Response(JSON.stringify({ error: true, error_msg: error.message}), {status: 400});
    else 
        return new Response(JSON.stringify({ success: true , noti}), { status: 200 });
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
        .from('notification')
        .delete()
        .eq('id', id);
    if (error)
        return new Response(JSON.stringify({ error: true, error_msg: error.message}), {status: 400});
    else 
        return new Response(JSON.stringify({ success: true }), { status: 200 });
}