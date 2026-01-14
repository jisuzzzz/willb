import supabase from '$lib/server/db'
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.user;
    if (user) {
        return;
    }

    else {
        redirect(302, '/login');
    }
}