'use strict';

import axios from 'axios';
import { GoogleData } from '../models/GoogleData.js';

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

const getGoogleConnectAccessTokenFromCode = async(code) => {
  const { data } = await axios({
    url: `https://oauth2.googleapis.com/token`,
    method: 'post',
    data: {
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_OAUTH_CONNECT_REDIRECT_URI,
      grant_type: 'authorization_code',
      code,
    },
  });

  return data.access_token;
};

const getGoogleUserInfo = async(token) => {
  const { data } = await axios({
    url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    method: 'get',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

const saveGoogleData = ({
  email, verifiedEmail, name, givenName, familyName, userId,
}) => {
  return GoogleData.create({
    email,
    verifiedEmail,
    name,
    givenName,
    familyName,
    userId,
  });
};

const getGoogleData = (userId) => {
  return GoogleData.findOne({
    where: { userId },
  });
};

export default {
  getGoogleAccessTokenFromCode,
  getGoogleConnectAccessTokenFromCode,
  getGoogleUserInfo,
  saveGoogleData,
  getGoogleData,
};
