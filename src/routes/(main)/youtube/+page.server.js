import supabase from '$lib/server/db'


export async function load({ locals }) {
    const user = locals.user;

    const { data: youtube, error } = await supabase
        .from('youtube')
        .select('video_link, video_title, total_views, publish_date');

    if (user) {
        // const { data: user_data, error: user_error } = await supabase
        //     .from('users')
        //     .select('*')
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
                youtube,
                noti
            }
        };
    }

    else {
        return {
            props: {
                // user: 'Guest',
                is_login: false,
                youtube
            }
        };
    }
}