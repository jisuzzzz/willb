import supabase from '$lib/server/db';

export async function load({ url }) {
    const search = url.searchParams.get('query');
    console.log(search);
    if (!search) {
        console.log('No search query provided.');
        return { status: 400, body: { error: 'No search query provided' } };
    }

    // console.log(search);
    // search = decodeURIComponent(search);
    let table = '';
    let colume = '';

    if (search.startsWith('#')) {
        table = 'hashtags';
        colume = 'name';
    } else if (search.startsWith('@')) {
        table = 'users';
        colume = 'nickname';
    } else {
        table = 'magazines';
        colume = 'title';
    }
    const {data:search_data, error: search_error} = await supabase
        .from(table)
        .select('*')
        .ilike(colume,`%${search}%`);

    if (search_error) {
        return { status: 500, body: { error: 'Search failed' } };
    }
    console.log(search_data);
    return {
        props: {
            search: search_data
        }
    }
}