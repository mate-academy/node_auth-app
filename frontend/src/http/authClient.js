import { createClient } from ".";

export const authClient = createClient();

authClient.interceptors.response.use((res) => res.data);
