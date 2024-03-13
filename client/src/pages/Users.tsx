import { FC, useEffect, useState } from "react";
import { List, ListItem, Typography } from "@mui/material";
import MainLayout from "../layout/MainLayout";
import { userService } from "../services/userService";
import Loader from "../components/Loader";
import useCheckResponseCode from "../hooks/useCheckResponseCode";

const Users: FC = () => {
  // fix types later
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any>([]);

  const checkResponseCode = useCheckResponseCode();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      setUsers(response);
    } catch (error: any) {
      checkResponseCode({
        code: error.response.status.toString(),
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <MainLayout>
      {loading ? (
        <Loader />
      ) : users.length > 0 ? (
        <>
          <Typography>Users List</Typography>
          <List>
            {users.map((user: User) => (
              <ListItem key={user.id}>{user.email}</ListItem>
            ))}
          </List>
        </>
      ) : (
        <Typography>No active users</Typography>
      )}
    </MainLayout>
  );
};

export default Users;
