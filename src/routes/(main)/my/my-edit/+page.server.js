import supabase from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.user;

    if(user) {
        const { data: user_data, error }  = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
        
        const { data: noti, error:noti_error } = await supabase
            .from('notification')
            .select('*')
            .eq('user_id', user.id);
        
        return {
            props: {
                user: user_data,
                is_login: true,
                email: user.email,
                noti
            }
        };
    } else {
        redirect(302, '/login');
    }

}