import { FC, useEffect, useState } from "react";
import { Box, Grid, Typography, Link } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { routes } from "../router/routes";
import LoginLayout from "../layout/LoginLayout";
import { useAuthContext } from "../context/AuthProvider";
import AvatarWithText from "../components/AvatarWithText";
import { useFormik } from "formik";
import * as Yup from "yup";
import CustomTextField from "../components/CustomTextField";
import PasswordField from "../components/PasswordField";

interface FormValues {
  email: string;
  password: string;
}

const SignIn: FC = () => {
  const { login, isLoading } = useAuthContext();
  const [serverErrors, setServerErrors] = useState<CustomServerErrors | null>(
    null
  );

  const formik = useFormik<FormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object().shape({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values) => {
      const { errors } = await login(values);

      if (errors) {
        setServerErrors(errors);
      }
    },
  });

  useEffect(() => {
    setServerErrors(null);
  }, [formik.values]);

  const isButtonActive =
    Object.keys(formik.values).every(
      (key) => !!formik.values[key as keyof FormValues]
    ) &&
    !Object.keys(formik.errors).some(
      (key) => !!formik.errors[key as keyof FormValues]
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
          {serverErrors?.email && (
            <Typography color="error" variant="caption">
              {serverErrors.email}
            </Typography>
          )}
          <PasswordField formik={formik} sx={{ mt: 1 }} />
          {serverErrors?.password && (
            <Typography color="error" variant="caption">
              {serverErrors.password}
            </Typography>
          )}
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
              <Link href={routes.resetPassword.main} variant="body2">
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
