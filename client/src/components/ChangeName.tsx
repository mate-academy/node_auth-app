import cn from 'classnames';
import { useContext, useState } from 'react';
import { usePageError } from '../hooks/usePageError';
import { AuthContext } from './AuthContext';
import { Loader } from './Loader';
import { changeName } from '../api/user';

export const ChahgeName = () => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = usePageError(false);
  const [isSuccess, setIsSuccess] = usePageError(false);
  const { onSetUser } = useContext(AuthContext);

  const onClearErrors = () => {
    setNameError(false);
    setError(false);
  };

  const onCleanFields = () => {
    setName('');
  };

  const onSetName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameError(false);
    setName(event.target.value);
  };

  const handleSubmit = async (event: React.FocusEvent<HTMLFormElement>) => {
    event.preventDefault();
    onClearErrors();

    if (!name) {
      setNameError(true);
    }

    if (nameError) {
      return;
    }

    try {
      setIsLoading(true);

      const user = {
        name,
      };

      const updatedUser = await changeName(user);

      onSetUser(updatedUser);

      setIsSuccess(true);

      onCleanFields();
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">ENTER NEW NAME</label>
          <div className="control">
            <input
              className={cn(
                'input',
                { 'is-success': name && !nameError },
                { 'is-danger': nameError }
              )}
              type="text"
              placeholder="Name"
              value={name}
              onChange={onSetName}
            />
          </div>
          {nameError && <p className="help is-danger">This name is invalid</p>}
        </div>

        <div className="field is-grouped">
          <div className="control">
            <button
              type="submit"
              className="button is-link"
              disabled={isLoading}
            >
              Submit
            </button>
          </div>
        </div>
      </form>
      {isLoading && <Loader />}
      {error && <p className="help is-danger">Error</p>}
      {isSuccess && <p className="help is-success">Success!</p>}
    </>
  );
};
