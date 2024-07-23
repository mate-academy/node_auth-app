export const parseAccessToken = (authorizationHeader) => {
  return authorizationHeader.split(' ')[1];
};
