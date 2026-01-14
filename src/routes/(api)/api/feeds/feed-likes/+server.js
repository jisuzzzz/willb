import supabase from '$lib/server/db';

export async function POST({ request, locals }) {
try {
    const user = locals.user;
    if(!user) {
        return new Response(JSON.stringify({ error: true, message: "Unauthorized" }), { status: 401 });
    }
    const { feed_id } = await request.json();
    if (!feed_id) {
        return new Response(JSON.stringify({ error: true, error_msg: "Required fields are missing" }), { status: 400 });
    }
    const { data: likes, error: queryError } = await supabase
        .from('feed_likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('feed_id', feed_id);
    
    if (queryError) {
        throw new Error(`Query Error: ${queryError.message}`);
    }

    if (likes.length > 0) {
        const { error: deleteError } = await supabase
            .from('feed_likes')
            .delete()
            .eq('user_id', user.id)
            .eq('feed_id', feed_id);

        if (deleteError) {
            throw new Error(`Delete Error: ${deleteError.message}`);
        }

        return new Response(JSON.stringify({ success: true, action: "removed" }), { status: 200 });
    } else {
        const { error: insert_error } = await supabase
            .from('feed_likes')
            .insert([{ user_id: user.id, feed_id }]);

        if (insert_error) {
            throw new Error(`Insert Error: ${insert_error.message}`);
        }

        return new Response(JSON.stringify({ success: true, action: "added" }), { status: 200 });
    }
    } catch (error) {
        return new Response(JSON.stringify({ error: true, message: error.message || "An error occurred" }), {status: 500});
    }   
}