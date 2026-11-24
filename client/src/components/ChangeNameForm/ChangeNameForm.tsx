import React, { useState } from 'react';
import axios from 'axios';
import { userAuth } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';

export const ChangeNameForm = () => {
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

  const { setUser } = useAuth();

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setIsSaved(false);

    try {
      const { data } = await userAuth.changeName(name);
      setUser(data);
      setIsSaved(true);
      setName('');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          setErrors({ form: 'Session expired, please refresh the page' });
          return;
        }

        setErrors(
          error.response.data.errors ?? { form: error.response.data.message },
        );
      } else {
        setErrors({ form: 'Server is not responding' });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label className="label" htmlFor="name">
          New name
        </label>
        <div className="control">
          <input
            className={errors.name ? 'input is-danger' : 'input'}
            type="text"
            placeholder="New name"
            id="name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        {errors.name && <p className="help is-danger">{errors.name}</p>}
      </div>

      {errors.form && <p className="help is-danger mb-3">{errors.form}</p>}
      {isSaved && <p className="help is-success mb-3">Name changed ✅</p>}

      <button className="button is-link is-fullwidth" type="submit">
        Save
      </button>
    </form>
  );
};
