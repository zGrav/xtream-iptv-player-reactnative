import buildUrl from '../utils/buildUrl';

function getVODs(url, username, password, category_id) {
	try {
		return fetch(buildUrl(url + '/player_api.php', {
			username, password, action: 'get_vod_streams', category_id,
		}), { method: 'GET' })
			.then((response) => {
				if (!response.ok) {
					throw new Error('getVODs', new Error(`Response status ${response.status}`));
				}

				const contentType = response.headers.get('content-type');

				if (!contentType || contentType.indexOf('application/json') === -1) {
					throw new Error('getVODs', new Error('Response is not json'));
				}

				return response.json();
			});
	} catch (error) {
		throw new Error(error);
	}
}


export default getVODs;
