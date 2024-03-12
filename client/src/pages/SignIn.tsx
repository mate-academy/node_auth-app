import { FC } from "react";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import { Box, Grid } from "@mui/material";
import { routes } from "../router/routes";
import LoginLayout from "../layout/LoginLayout";
import { useAuthContext } from "../context/AuthProvider";
import AvatarWithText from "../components/AvatarWithText";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CustomTextField from "../components/CustomTextField";

const textFields = [{
  type: "email",
  name: "Email Address",
},{
  type: "password",
  name: "Password",
}];

const SignIn: FC = () => {
  const { login } = useAuthContext();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        // .min(8, 'Password must be at least 8 characters')
        // .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        // .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        // .matches(/[0-9]/, 'Password must contain at least one number')
        .required('Password is required'),
    }),
    onSubmit: (values) => {
      console.log(values);
      login(values);
    }
  });

  return (
    <LoginLayout>
      <>
        <AvatarWithText text="Sign in" />
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
          {textFields.map(({ name, type }, index) => (
            <CustomTextField
              key={`${type}_${index}`}
              label={name} field={type}
              formik={formik}
            />
          ))}
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href={routes.login.resetPassword} variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href={routes.login.signUp} variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </>
    </LoginLayout>
  );
};

export default SignIn;
