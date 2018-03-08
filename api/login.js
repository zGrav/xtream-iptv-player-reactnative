import buildUrl from '../utils/buildUrl';

function Login(url, username, password) {
  try {
    return fetch(buildUrl(url + '/player_api.php', { username, password }), { method: 'GET' })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Login', new Error(`Response status ${response.status}`));
      }

      const contentType = response.headers.get('content-type');

      if (!contentType || contentType.indexOf('application/json') === -1) {
        throw new Error('Login', new Error('Response is not json'));
      }

      return response.json();
    });
  } catch (error) {
    throw new Error(error);
  }
}

export default Login;
