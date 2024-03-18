import { FC, useEffect, useState } from "react";
import { List, ListItem, Typography } from "@mui/material";
import MainLayout from "../layout/MainLayout";
import { userService } from "../services/userService";
import Loader from "../components/Loader";
import useHandleRequest from "../hooks/useHandleRequest";

const Users: FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { handleRequest, isLoading } = useHandleRequest();

  const fetchUsers = () =>
    handleRequest(userService.getAll(), (response) => {
      setUsers(response);
    });

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <MainLayout>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Typography variant="subtitle1">Users List</Typography>
          {users.length > 0 ? (
            <List>
              {users.map((user: User) => (
                <ListItem key={user.id}>{user.email}</ListItem>
              ))}
            </List>
          ) : (
            <Typography>No active users</Typography>
          )}
        </>
      )}
    </MainLayout>
  );
};

export default Users;
