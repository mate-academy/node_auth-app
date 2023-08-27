import React, { useEffect, useState } from "react";
import { usePageError } from "../hooks/usePageError.js";
import { userService } from "../services/userService.js";

const UsersPage = ({ addClasses = "" }) => {
  const [error, setError] = usePageError("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    userService
      .getAll()
      .then(setUsers)
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  //#region Render
  return (
    <div className={`content ${addClasses}`}>
      <h1 className="title">Users</h1>

      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.email}</li>
        ))}
      </ul>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </div>
  );
  //#endregion
};

export default UsersPage;
