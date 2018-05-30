import buildUrl from '../utils/buildUrl';

function getFullEPG(url, username, password, stream_id) {
	try {
		return fetch(buildUrl(url + '/player_api.php', {
			username, password, action: 'get_simple_data_table', stream_id,
		}), { method: 'GET' })
			.then((response) => {
				if (!response.ok) {
					throw new Error('getFullEPG', new Error(`Response status ${response.status}`));
				}

				const contentType = response.headers.get('content-type');

				if (!contentType || contentType.indexOf('application/json') === -1) {
					throw new Error('getFullEPG', new Error('Response is not json'));
				}

				return response.json();
			});
	} catch (error) {
		throw new Error(error);
	}
}


export default getFullEPG;
