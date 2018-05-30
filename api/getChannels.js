import buildUrl from '../utils/buildUrl';

function getChannels(url, username, password, category_id) {
	try {
		return fetch(buildUrl(url + '/player_api.php', {
			username, password, action: 'get_live_streams', category_id,
		}), { method: 'GET' })
			.then((response) => {
				if (!response.ok) {
					throw new Error('getChannels', new Error(`Response status ${response.status}`));
				}

				const contentType = response.headers.get('content-type');

				if (!contentType || contentType.indexOf('application/json') === -1) {
					throw new Error('getChannels', new Error('Response is not json'));
				}

				return response.json();
			});
	} catch (error) {
		throw new Error(error);
	}
}


export default getChannels;
