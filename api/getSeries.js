import buildUrl from '../utils/buildUrl';

export function getSeriesCategories(url, username, password, category_id) {
	try {
		return fetch(buildUrl(url + '/player_api.php', {
			username, password, action: 'get_series', category_id,
		}), { method: 'GET' })
			.then((response) => {
				if (!response.ok) {
					throw new Error('getSeriesCategories', new Error(`Response status ${response.status}`));
				}

				const contentType = response.headers.get('content-type');

				if (!contentType || contentType.indexOf('application/json') === -1) {
					throw new Error('getSeriesCategories', new Error('Response is not json'));
				}

				return response.json();
			});
	} catch (error) {
		throw new Error(error);
	}
}

export function getSeries(url, username, password, series_id) {
	try {
		return fetch(buildUrl(url + '/player_api.php', {
			username, password, action: 'get_series_info', series_id,
		}), { method: 'GET' })
			.then((response) => {
				if (!response.ok) {
					throw new Error('getSeries', new Error(`Response status ${response.status}`));
				}

				const contentType = response.headers.get('content-type');

				if (!contentType || contentType.indexOf('application/json') === -1) {
					throw new Error('getSeries', new Error('Response is not json'));
				}

				return response.json();
			});
	} catch (error) {
		throw new Error(error);
	}
}
