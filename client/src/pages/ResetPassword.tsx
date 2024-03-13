import { FC } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { routes } from "../router/routes";
import { Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LoginLayout from "../layout/LoginLayout";

const ResetPassword: FC = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get("email"),
      password: data.get("password"),
    });
  };

  const navigate = useNavigate();

  return (
    <LoginLayout>
      <>
        <Typography component="h1" variant="h5" sx={{ textAlign: "center" }}>
          Recover your password or username
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {/* <CustomTextField label="Email Address" field="email" formik={undefined} /> */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
          />
          <Stack direction="row" spacing={2} sx={{ mt: 3, mb: 2 }}>
            <Button type="submit" fullWidth variant="contained">
              Recover password
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate(routes.login.signIn)}
            >
              Wait! I remember
            </Button>
          </Stack>
        </Box>
      </>
    </LoginLayout>
  );
};

export default ResetPassword;
