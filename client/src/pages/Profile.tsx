import { FormEvent, useEffect, useState } from 'react'
import { useAuth } from '../context/authContext'
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../api/fetchUsers';
import { useMutation } from '@tanstack/react-query';

type UpdateUserPayload = {
  email: string;
  data: {
    name?: string;
    password?: string;
  };
};

const Profile = () => {
  const [isActiveUser, setIsActiveUser] = useState(false);
  const [isUpdateName, setIsUpdateName] = useState(false);
  const {user, accessToken, setUser, logout} = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if(!user || !accessToken) {
      navigate('/login')
      logout()
    }
  }, [user, accessToken])

  const mutation = useMutation({
    mutationFn: usersApi.updateUser,
    onSuccess: (data) => {
      setUser(data.user)
    }
  })

  const updateUserName = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const userName = formData.get('name') as string;

    if(userName && user) {
      mutation.mutate({email: user.email, data: {name: userName}, accessToken})
    }
  }

  const updateUserPassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const password = formData.get('password') as string;
    const conformPassword = formData.get('passwordConform') as string;

    if(password && conformPassword && password === conformPassword && user) {
      mutation.mutate({email: user.email, data: {password}, accessToken})
    }

  }

  const deleteUser = async () => {
    if(user) {
      await usersApi.deleteUser(user.email)

      logout()
      navigate('/login')
    }
  }

  return (
    <main className='main'>
      <div className="container">
        <h1 className='title'>Profile</h1>
        <div className='box'>
          <h2>Name:</h2>
          <p>{user?.name}</p>
          {!isActiveUser && <p>User isn't active</p>}

          {isUpdateName &&
            <form onSubmit={updateUserName}>
                <input className='input' placeholder='Enter new name ...' type="text" name='name'/>
                <button className='button' type='submit'>Save</button>
            </form>
          }
          {!isUpdateName && <button onClick={() => setIsUpdateName(true)} className='button'>
            Update
          </button>}
        </div>
        <br />
        <div className='box'>
          <h2>Change password:</h2>
          <form onSubmit={updateUserPassword}>
            <input type="password" name='password' className='input' placeholder='Enter new password...'/>
            <input type="password" name='passwordConform' className='input' placeholder='Repeat new password...'/>
            <button className='button'>Save</button>
          </form>
        </div>

        <br />

        <div className='box'>
          <h2>Delete User:</h2>
          <button onClick={deleteUser} className='button'>Delete</button>
        </div>

      </div>
    </main>
  )
}

export default Profile
