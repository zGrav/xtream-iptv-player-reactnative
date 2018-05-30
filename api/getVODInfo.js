import buildUrl from '../utils/buildUrl';

function getVODInfo(url, username, password, vod_id) {
	try {
		return fetch(buildUrl(url + '/player_api.php', {
			username, password, action: 'get_vod_info', vod_id,
		}), { method: 'GET' })
			.then((response) => {
				if (!response.ok) {
					throw new Error('getVODInfo', new Error(`Response status ${response.status}`));
				}

				const contentType = response.headers.get('content-type');

				if (!contentType || contentType.indexOf('application/json') === -1) {
					throw new Error('getVODInfo', new Error('Response is not json'));
				}

				return response.json();
			});
	} catch (error) {
		throw new Error(error);
	}
}


export default getVODInfo;
