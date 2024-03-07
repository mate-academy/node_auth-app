import { FC, useEffect, useState } from "react";
import { List, ListItem, Typography } from "@mui/material";
import MainLayout from "../layout/MainLayout";
import { userService } from "../services/userService";

const Users: FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
      const users: User[] = response.data;
      setUsers(users);
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
            {users.map(user => (
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
