import supabase from '$lib/server/db';

export async function load({ params, locals }) {
    const user = locals.user;
    const { nickname } = params;

    const { data, error } = await supabase.rpc('get_feed_by_user', {
        v_nickname: nickname
    });

    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('profile_image, id, my_desc')
        .eq('nickname', nickname)
        .single();
    // console.log(userData);
    // console.log(data);
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
                data,
                userData,
                nickname,
                noti
            }
        };
    }
    else {
        return {
            props: {
                user: 'Guest',
                is_login: false,
                data,
                userData,
                nickname
            }
        };
    }
}