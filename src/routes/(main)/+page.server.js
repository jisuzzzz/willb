import supabase from '$lib/server/db'

export async function load({ locals }) {

    const { data:f_data, error:f_error } = await supabase.rpc('get_all_feeds');
    const { data:m_data, error:m_error } = await supabase.rpc('get_all_magazines');

    const { data: youtube, error } = await supabase
        .from('youtube')
        .select('video_link, video_title, total_views, publish_date');

    const {data: hashtag, error: h_error} = await supabase
        .from('hashtags')
        .select('*');

    const { data: banner, error: b_error } = await supabase
        .from('banner_images')
        .select('*');

    const user = locals.user;
    if (user) {
        // const { data: user_data, error: user_error } = await supabase
        //     .from('users')
        //     .select('nickname, id')
        //     .eq('id', user.id)
        //     .single();
        const { data: noti, error } = await supabase
            .from('notification')
            .select('*')
            .eq('user_id', user.id);
        return {
            props: {
                // user: user_data,
                is_login: true,
                f_data,
                m_data,
                banner,
                hashtag,
                youtube,
                noti,
            }
        };
    }

    else {
        return {
            props: {
                // user: 'Guest',
                is_login: false,
                f_data,
                m_data,
                banner,
                hashtag,
                youtube,
            }
        };
    }
}