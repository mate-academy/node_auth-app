import { AppBar, Box, Button, Stack, Toolbar, ListItemButton } from "@mui/material";
import { NavLink } from "react-router-dom";
import { routes } from "../router/routes";
import { useAuthContext } from "../context/AuthProvider";

type CustomAppMenuWithLabelProps = {
};

const CustomAppMenu: React.FC<CustomAppMenuWithLabelProps> = ({
}) => {
  const { logout } = useAuthContext();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between'}}>
          <Stack direction="row">
            <ListItemButton component={NavLink} to={routes.home}>Home</ListItemButton>
            <ListItemButton component={NavLink} to={routes.users}>Users</ListItemButton>
          </Stack>
          <Button onClick={logout} variant="outlined" color="info">Log out</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default CustomAppMenu;