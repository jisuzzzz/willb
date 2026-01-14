import supabase from '$lib/server/db';

export async function load({ params, locals }) {
    const user = locals.user;
    const { maz_id } = params;

    const { data:interview, error } = await supabase.rpc('get_interview', {
        p_maz_id: maz_id
    });
    if (user) {
        const { data: noti, error } = await supabase
            .from('notification')
            .select('*')
            .eq('user_id', user.id);
        return {
            props: {
                interview,
                noti,
            }
        };
    } else {
        return {
            props: {
                interview,
            }
        }
    }

}