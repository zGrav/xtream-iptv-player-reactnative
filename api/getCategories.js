import buildUrl from '../utils/buildUrl';

function getCategories(url, username, password, buttonIndex) {
	let action = null;

	if (buttonIndex === 0) {
		action = 'get_live_categories';
	} else if (buttonIndex === 1) {
		action = 'get_vod_categories';
	} else if (buttonIndex === 2) {
		action = 'get_series_categories';
	}

	try {
		return fetch(buildUrl(url + '/player_api.php', { username, password, action }), { method: 'GET' })
			.then((response) => {
				if (!response.ok) {
					throw new Error('getCategories', new Error(`Response status ${response.status}`));
				}

				const contentType = response.headers.get('content-type');

				if (!contentType || contentType.indexOf('application/json') === -1) {
					throw new Error('getCategories', new Error('Response is not json'));
				}

				return response.json();
			});
	} catch (error) {
		throw new Error(error);
	}
}


export default getCategories;
