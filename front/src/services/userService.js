import { httpClient } from "../http/httpClient.js";
const BASE_URL = "http://localhost:5000";

function getAll() {
  return httpClient.get(`${BASE_URL}/users`);
}

function updateName(email, fullName) {
  return httpClient.patch(`${BASE_URL}/users/updateName`, { email, fullName });
}

function updateEmail(oldEmail, newEmail) {
  return httpClient.patch(`${BASE_URL}/users/updateEmail`, {
    oldEmail,
    newEmail,
  });
}

export const userService = { getAll, updateName, updateEmail };
