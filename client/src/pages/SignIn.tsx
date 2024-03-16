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
import { useFormik } from "formik";
import * as Yup from "yup";
import CustomTextField from "../components/CustomTextField";
import PasswordField from "../components/PasswordField";
import { LoadingButton } from "@mui/lab";

const SignIn: FC = () => {
  const { login, isLoading } = useAuthContext();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object().shape({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        // .min(8, "Password must be at least 8 characters")
        // .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        // .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        // .matches(/[0-9]/, 'Password must contain at least one number')
        .required("Password is required"),
    }),
    onSubmit: (values) => {
      login(values);
    },
  });

  const isButtonActive =
    Object.keys(formik.values).every(
      (key) => !!formik.values[key as keyof typeof formik.values]
    ) &&
    !Object.keys(formik.errors).some(
      (key) => !!formik.errors[key as keyof typeof formik.errors]
    );

  return (
    <LoginLayout>
      <>
        <AvatarWithText text="Sign in" />
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
          <CustomTextField
            label="Email"
            field="email"
            type="email"
            formik={formik}
          />
          <PasswordField formik={formik} sx={{ mt: 1 }} />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <LoadingButton
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={!isButtonActive}
            loading={isLoading}
          >
            Sign In
          </LoadingButton>
          <Grid container>
            <Grid item xs>
              <Link href={routes.resetPassword} variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href={routes.signUp} variant="body2">
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
