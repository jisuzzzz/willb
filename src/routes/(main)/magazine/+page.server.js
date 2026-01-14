import supabase from '$lib/server/db';

export async function load({ locals }) {
    const user = locals.user;
    
    const { data, error } = await supabase.rpc('get_all_magazines');

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
                noti,
            }
        };
    }
    else {
        return {
            props: {
                user: 'Guest',
                is_login: false,
                data,
            }
        };
    }
}