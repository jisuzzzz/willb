import supabase from '$lib/server/db';

export async function load({ params, locals }) {
    const user = locals.user;
    const { feedId } = params;

    const {data:feedData, error:feedError} = await supabase.rpc('get_feed', {
        p_feed_id: feedId
    });
    // console.log(feedData);
    const {data:commentData, error:commentError} = await supabase.rpc('get_comment', {
        p_feed_id: feedId,
        p_page: 1,
        p_limit: 20
    });
    // console.log(commentData);

    if (user) {
        const { data: user_data, error: user_error } = await supabase
            .from('users')
            .select('nickname, id, profile_image')
            .eq('id', user.id)
            .single();
        const { data: noti, error } = await supabase
            .from('notification')
            .select('*')
            .eq('user_id', user.id);
        return {
            props: {
                user: user_data,
                is_login: true,
                feedData,
                commentData,
                noti,
            }
        };
    }
    else {
        return {
            props: {
                user: 'Guest',
                is_login: false,
                feedData,
                commentData,
            }
        };
    }
}