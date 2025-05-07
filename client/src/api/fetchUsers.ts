import { authApi } from "./fetchAuth";

type UpdateUserPayload = {
  email: string;
  data: {
    name?: string;
    password?: string;
  };
  accessToken: string | null
};

// const getUser = async (): Promise<UserWithActive> => {
//   const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${email}`, {
//     headers: {
//       Authorization: `Bearer ${token}`
//     }
//   });

//   if(!res.ok) {
//     throw new Error('User not found');
//   }
//   const data = await res.json();

//   return data;
// }

const updateUser = async ({email, data, accessToken}: UpdateUserPayload) => {
  let response = await fetch(`${import.meta.env.VITE_API_URL}/users/${email}`, {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  })

  if(response.status === 401) {
    const {accessToken} = await authApi.refresh();

    if(!accessToken) {
      throw new Error('Not authenticated');
    }

    response = await fetch(`${import.meta.env.VITE_API_URL}/users/${email}`, {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch after refresh');
    }
  }

  return response.json();
}

const deleteUser = async (email: string): Promise<any> => {
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/users/${email}`, {
      method: "DELETE"
    })

  } catch (error) {
    console.log(error);
  }
}

export const usersApi = {
  updateUser,
  deleteUser,
}
