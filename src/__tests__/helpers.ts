import axios from 'axios';
import config from 'config';

export async function fetchAccessToken() {
  const response = await axios.post(
    config.get('auth.tokenUrl'),
    {
      grant_type: 'password',
      username: config.get('auth.testUser.username'),
      password: config.get('auth.testUser.password'),
      audience: config.get('auth.audience'),
      scope: 'openid profile email offline_access',
      client_id: config.get('auth.clientId'),
      client_secret: config.get('auth.clientSecret'),
    },
    {
      headers: { 'Accept-Encoding': 'gzip,deflate,compress' },
    }
  );

  return response.data.access_token;
}

export async function getAuthHeader() {
  const token = await fetchAccessToken();

  return `Bearer ${token}`;
}

export default fetchAccessToken;
