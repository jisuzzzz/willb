import supabase from '$lib/server/db';
import { parse } from 'cookie';

export async function handle({ event, resolve }) {

	// 쿠키에서 추출하기
	// if (event.url.pathname.startsWith('')) {
		// const token = event.request.headers.get('authorization')?.split(' ')[1];
		const cookies = parse(event.request.headers.get('cookie') || '');
		const token = cookies.access_token;

		if (token) {
			const { data, error } = await supabase.auth.getUser(token);
			
			if (!error && data) event.locals.user = data.user;
		}
	// }
	const response = await resolve(event);

	return response;
}
