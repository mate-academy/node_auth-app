import React, { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext';
import { Navigate } from 'react-router-dom';
import { ChahgeName } from '../ChangeName';
import { ChahgeEmail } from '../ChangeEmail';
import { ChangePassword } from '../ChangePassword';
import { resendEmail } from '../../api/user';
import { Loader } from '../Loader';

export const UserPage = () => {
  const [changingName, setChangingName] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendingEmailError, setResendingEmailError] = useState(false);
  const { user } = useContext(AuthContext);

  const toggleNameChange = () => {
    setChangingName((prev) => !prev);
    setChangingEmail(false);
    setChangingPassword(false);
  };

  const toggleEmailChange = () => {
    setChangingEmail((prev) => !prev);
    setChangingName(false);
    setChangingPassword(false);
  };

  const togglePasswordChange = () => {
    setChangingPassword((prev) => !prev);
    setChangingName(false);
    setChangingEmail(false);
  };

  const sendNewValidationEmail = async () => {
    setResendingEmailError(false);
    setResendingEmail(true);

    try {
      await resendEmail();
    } catch (error) {
      setResendingEmailError(true);
    } finally {
      setResendingEmail(false);
    }
  };

  if (!user) {
    return <Navigate to={'/login'} />;
  }

  return (
    <>
      <h1 className="title is-1">Personal information</h1>

      <table className="table is-striped is-narrow is-hoverable">
        <thead>
          <tr></tr>
        </thead>
        <tbody>
          <tr>
            <th>ID</th>
            <td>{user?.id}</td>
            <td></td>
          </tr>
          <tr>
            <th>NAME</th>
            <td>{user?.name}</td>
            <td>
              <button
                className="button is-rounded is-small"
                onClick={toggleNameChange}
              >
                {changingName ? 'Close' : 'Change'}
              </button>
            </td>
          </tr>
          <tr>
            <th>EMAIL</th>
            <td>{user?.email}</td>
            <td>
              <button
                className="button is-rounded is-small"
                onClick={toggleEmailChange}
              >
                {changingEmail ? 'Close' : 'Change'}
              </button>
            </td>
          </tr>
          <tr>
            <th>VERIFIED</th>
            <td>
              {user?.verified ? (
                <span className="icon-text">
                  <span className="icon has-text-success">
                    <i className="fas fa-check-square"></i>
                  </span>
                </span>
              ) : (
                <span className="icon-text">
                  <span className="icon has-text-danger">
                    <i className="fas fa-ban"></i>
                  </span>
                </span>
              )}
              {resendingEmail && (
                <span>
                  <Loader />
                </span>
              )}
              {resendingEmailError && <p className="help is-danger">Error</p>}
            </td>
            <td>
              {!user?.verified && (
                <button
                  className="button is-success is-rounded is-small"
                  onClick={sendNewValidationEmail}
                >
                  Send new mail
                </button>
              )}
            </td>
          </tr>
          <tr>
            <th>PASSWORD</th>
            <td>******</td>
            <td>
              <button
                className="button is-rounded is-small"
                onClick={togglePasswordChange}
              >
                {changingPassword ? 'Close' : 'Change'}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      {changingName && <ChahgeName />}
      {changingEmail && <ChahgeEmail />}
      {changingPassword && <ChangePassword />}
    </>
  );
};

// const ChahgeName = () => {
//   const [name, setName] = useState('');
//   const [nameError, setNameError] = useState(false);
//   // const [passwordError, setPasswordError] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const [error, setError] = usePageError(false);
//   const [isSuccess, setIsSuccess] = usePageError(false);
//   const { onSetUser } = useContext(AuthContext);

//   const onClearErrors = () => {
//     // setPasswordError(false);
//     setNameError(false);
//     setError(false);
//   };

//   const onCleanFields = () => {
//     // setPassword('');
//     setName('');
//   };

//   // const onSetPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
//   //   setPasswordError(false);
//   //   setPassword(event.target.value);
//   // };

//   const onSetName = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setNameError(false);
//     setName(event.target.value);
//   };

//   const handleSubmit = async (event: React.FocusEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     onClearErrors();

//     // if (!password || password.length < 6) {
//     //   setPasswordError(true);
//     // }
//     if (!name) {
//       setNameError(true);
//     }

//     if (nameError) {
//       return;
//     }

//     try {
//       setIsLoading(true);

//       const user = {
//         name,
//       };

//       const updatedUser = await changeName(user);
//       // console.log(res);

//       onSetUser(updatedUser);

//       // navigate('/login');
//       setIsSuccess(true);

//       onCleanFields();
//     } catch (error) {
//       console.log(error);
//       setError(true);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   return (
//     <>
//       <form onSubmit={handleSubmit}>
//         <div className="field">
//           <label className="label">ENTER NEW NAME</label>
//           <div className="control">
//             <input
//               className={cn(
//                 'input',
//                 { 'is-success': name && !nameError },
//                 { 'is-danger': nameError }
//               )}
//               type="text"
//               placeholder="Name"
//               value={name}
//               onChange={onSetName}
//             />
//           </div>
//           {nameError && <p className="help is-danger">This name is invalid</p>}
//         </div>

//         <div className="field is-grouped">
//           <div className="control">
//             <button
//               type="submit"
//               className="button is-link"
//               disabled={isLoading}
//             >
//               Submit
//             </button>
//           </div>
//         </div>
//       </form>
//       {isLoading && <Loader />}
//       {error && <p className="help is-danger">Error</p>}
//       {isSuccess && <p className="help is-success">Success!</p>}
//     </>
//   );
// };

// const ChahgeEmail = () => {
//   const [email, setEmail] = useState('');
//   const [emailError, setEmailError] = useState(false);
//   // const [passwordError, setPasswordError] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const [error, setError] = usePageError(false);
//   const [isSuccess, setIsSuccess] = usePageError(false);
//   const { onSetUser } = useContext(AuthContext);

//   const onClearErrors = () => {
//     // setPasswordError(false);
//     setEmailError(false);
//     setError(false);
//   };

//   const onCleanFields = () => {
//     // setPassword('');
//     setEmail('');
//   };

//   // const onSetPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
//   //   setPasswordError(false);
//   //   setPassword(event.target.value);
//   // };

//   const onSetName = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setEmailError(false);
//     setEmail(event.target.value);
//   };

//   const handleSubmit = async (event: React.FocusEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     onClearErrors();

//     // if (!password || password.length < 6) {
//     //   setPasswordError(true);
//     // }
//     if (!email) {
//       setEmailError(true);
//     }

//     if (emailError) {
//       return;
//     }

//     try {
//       setIsLoading(true);

//       const user = {
//         email,
//       };

//       const updatedUser = await changeEmailRequst(user);
//       // console.log(res);

//       // onSetUser(updatedUser);

//       // navigate('/login');
//       setIsSuccess(true);

//       onCleanFields();
//     } catch (error) {
//       console.log(error);
//       setError(true);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   return (
//     <>
//       <form onSubmit={handleSubmit}>
//         <div className="field">
//           <label className="label">ENTER NEW EMAIL</label>
//           <div className="control">
//             <input
//               className={cn(
//                 'input',
//                 { 'is-success': email && !emailError },
//                 { 'is-danger': emailError }
//               )}
//               type="email"
//               placeholder="Email"
//               value={email}
//               onChange={onSetName}
//             />
//           </div>
//           {emailError && (
//             <p className="help is-danger">This email is invalid</p>
//           )}
//         </div>

//         <div className="field is-grouped">
//           <div className="control">
//             <button
//               type="submit"
//               className="button is-link"
//               disabled={isLoading}
//             >
//               Submit
//             </button>
//           </div>
//         </div>
//       </form>
//       {isLoading && <Loader />}
//       {error && <p className="help is-danger">Error</p>}
//       {isSuccess && <p className="help is-success">Success!</p>}
//     </>
//   );
// };

// const ChangePassword = () => {
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [password, setPassword] = useState('');
//   const [passwordConfirm, setPasswordConfirm] = useState('');
//   const [currentPasswordError, setCurrentPasswordError] = useState(false);
//   const [passwordError, setPasswordError] = useState(false);
//   const [passwordConfirmError, setPasswordConfirmError] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const [error, setError] = usePageError(false);
//   const navigate = useNavigate();
//   // const [params] = useSearchParams();
//   const [successCreating, setSuccessCreating] = usePageError(false);

//   // const token = params.get('token');

//   // if (!token) {
//   //   navigate('/login');
//   // }

//   const onClearErrors = () => {
//     setPasswordError(false);
//     setError(false);
//     setCurrentPasswordError(false);
//   };

//   const onCleanFields = () => {
//     setPassword('');
//     setPassword('');
//     setCurrentPassword('');
//   };

//   const onSetPasswordConfirm = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setPasswordConfirmError(false);
//     setPasswordConfirm(event.target.value);
//   };

//   const onSetPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setPasswordError(false);
//     setPassword(event.target.value);
//   };

//   const onSetCurrentPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setCurrentPasswordError(false);
//     setCurrentPassword(event.target.value);
//   };

//   const comparePassword = () => {
//     if (password !== passwordConfirm) {
//       setPasswordConfirmError(true);
//     }
//     if (password === passwordConfirm) {
//       setPasswordConfirmError(false);
//     }
//   };

//   const handleSubmit = async (event: React.FocusEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     onClearErrors();

//     if (!password || password.length < 6) {
//       setPasswordError(true);
//     }
//     // if (!email || !emailPattern.test(email)) {
//     //   setEmailError(true);
//     // }

//     if (passwordConfirm !== password) {
//       setPasswordConfirmError(true);
//     }

//     if (passwordError || passwordConfirmError || currentPasswordError) {
//       return;
//     }

//     try {
//       // if (!token) {
//       //   setError(true);

//       //   return;
//       // }

//       setIsLoading(true);

//       const data = {
//         oldPassword: currentPassword,
//         newPassword: password,
//         newConfirmedPassword: passwordConfirm,
//       };

//       await updatePassword(data);

//       await logout();

//       setTimeout(() => {
//         navigate('/login');
//       }, 3000);

//       onCleanFields();

//       setSuccessCreating(true);
//     } catch (error) {
//       setError(true);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <>
//       <form onSubmit={handleSubmit}>
//         <div className="field">
//           <label className="label">Current password</label>
//           <div className="control">
//             <input
//               className={cn(
//                 'input',
//                 { 'is-success': password && !passwordError },
//                 { 'is-danger': passwordError }
//               )}
//               type="password"
//               placeholder="Current password"
//               value={currentPassword}
//               onChange={onSetCurrentPassword}
//             />
//           </div>

//           {currentPassword && !currentPasswordError && (
//             <p className="help is-success">This password is available</p>
//           )}
//           {currentPasswordError && (
//             <p className="help is-danger">This password is invalid</p>
//           )}
//         </div>
//         <div className="field">
//           <label className="label">New password</label>
//           <div className="control">
//             <input
//               className={cn(
//                 'input',
//                 { 'is-success': password && !passwordError },
//                 { 'is-danger': passwordError }
//               )}
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={onSetPassword}
//               onBlur={comparePassword}
//             />
//           </div>

//           {password && !passwordError && (
//             <p className="help is-success">This password is available</p>
//           )}
//           {passwordError && (
//             <p className="help is-danger">This password is invalid</p>
//           )}
//         </div>

//         <div className="field">
//           <label className="label">Confirm new password</label>
//           <div className="control">
//             <input
//               className={cn(
//                 'input',
//                 { 'is-success': passwordConfirm && !passwordConfirmError },
//                 { 'is-danger': passwordConfirmError }
//               )}
//               type="password"
//               placeholder="Confirm password"
//               value={passwordConfirm}
//               onChange={onSetPasswordConfirm}
//               onBlur={comparePassword}
//             />
//           </div>

//           {passwordConfirm && !passwordConfirmError && (
//             <p className="help is-success">This password is available</p>
//           )}
//           {passwordConfirmError && (
//             <p className="help is-danger">This password is invalid</p>
//           )}
//         </div>

//         <div className="field is-grouped">
//           <div className="control">
//             <button
//               type="submit"
//               className="button is-link"
//               disabled={isLoading}
//             >
//               Submit
//             </button>
//           </div>
//           {/* <div className="control">
//             <button className="button is-link is-light">Cancel</button>
//           </div> */}
//         </div>
//       </form>
//       {isLoading && <Loader />}
//       {error && <p className="help is-danger">Error</p>}
//       {successCreating && <p className="help is-success">Successfully!</p>}
//     </>
//   );
// };
