import axios from "axios";

export function createClient() {
  return axios.create({
    baseURL: "http://localhost:5000/",
    withCredentials: true,
  });
}
