import supabase from '$lib/server/db'

export async function load({ locals }) {

    const { data:all_feeds, error } = await supabase.rpc('get_all_feeds');


    const {data: hashtag, error: h_error} = await supabase
        .from('hashtags')
        .select('*');

    const user = locals.user;

    if (user) {
        const { data: user_data, error: user_error } = await supabase
            .from('users')
            .select('nickname, id')
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
                all_feeds,
                hashtag,
                noti
            }
        };
    }
    
    else {
        return {
            props: {
                user: 'Guest',
                is_login: false,
                all_feeds,
                hashtag,
            }
        };
    }
}