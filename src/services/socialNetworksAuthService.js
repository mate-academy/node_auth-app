'use strict';

import axios from 'axios';
import qs from 'query-string';

const getGoogleAccessTokenFromCode = async(code) => {
  const { data } = await axios({
    url: `https://oauth2.googleapis.com/token`,
    method: 'post',
    data: {
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
      grant_type: 'authorization_code',
      code,
    },
  });

  return data.access_token;
};

const getGoogleUserInfo = async(accessToken) => {
  const { data } = await axios({
    url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    method: 'get',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return data;
};

const getGithubAccessTokenFromCode = async(code) => {
  const { data } = await axios({
    url: 'https://github.com/login/oauth/access_token',
    method: 'get',
    params: {
      client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
      client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
      redirect_uri: process.env.GITHUB_OAUTH_REDIRECT_URI,
      code,
    },
  });

  const parsedData = qs.parse(data);

  if (parsedData.error_description) {
    throw new Error(parsedData.error_description);
  }

  return parsedData.access_token;
};

const getGithubUserInfo = async(accessToken) => {
  const { data } = await axios({
    url: 'https://api.github.com/user',
    method: 'get',
    headers: {
      Authorization: `token ${accessToken}`,
    },
  });

  return data;
};

const getFacebookAccessTokenFromCode = async(code) => {
  const { data } = await axios({
    url: 'https://graph.facebook.com/v4.0/oauth/access_token',
    method: 'get',
    params: {
      client_id: process.env.FACEBOOK_OAUTH_CLIENT_ID,
      client_secret: process.env.FACEBOOK_OAUTH_CLIENT_SECRET,
      redirect_uri: process.env.FACEBOOK_OAUTH_REDIRECT_URI,
      code,
    },
  });

  return data.access_token;
};

const getFacebookUserInfo = async(accessToken) => {
  const { data } = await axios({
    url: 'https://graph.facebook.com/me',
    method: 'get',
    params: {
      fields: ['id', 'email', 'first_name', 'last_name'].join(','),
      access_token: accessToken,
    },
  });

  return data;
};

export default {
  getGoogleAccessTokenFromCode,
  getGoogleUserInfo,
  getGithubAccessTokenFromCode,
  getGithubUserInfo,
  getFacebookAccessTokenFromCode,
  getFacebookUserInfo,
};
