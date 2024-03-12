import { FC, useEffect, useState } from "react";
import { List, ListItem, Typography } from "@mui/material";
import MainLayout from "../layout/MainLayout";
import { userService } from "../services/userService";

const Users: FC = () => {
  // fix types later
  const [users, setUsers] = useState<any>([]);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response);
    } catch (error) {
      console.log('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <MainLayout>
      {users.length > 0 ? (
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
}

export default Users;
