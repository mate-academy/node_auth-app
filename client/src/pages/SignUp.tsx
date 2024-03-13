import { FC, useState } from "react";
import { Box, Stack, Link, Button, Typography } from "@mui/material";
import { routes } from "../router/routes";
import LoginLayout from "../layout/LoginLayout";
import AvatarWithText from "../components/AvatarWithText";
import { useFormik } from "formik";
import * as Yup from "yup";
import CustomTextField from "../components/CustomTextField";
import { useAuthContext } from "../context/AuthProvider";
import PasswordField from "../components/PasswordField";
import Loader from "../components/Loader";

const SignUp: FC = () => {
  const { registration, isError } = useAuthContext();
  const [isRegistered, setIsRegistered] = useState(false);

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
        // .min(8, 'Password must be at least 8 characters')
        // .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        // .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        // .matches(/[0-9]/, 'Password must contain at least one number')
        .required("Password is required"),
    }),
    onSubmit: async (values) => {
      await registration(values);
      setIsRegistered(true);
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
      {isRegistered ? (
        <Stack
          sx={{
            height: "350px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Check your email
          </Typography>
          <Typography mt={1}>
            We have sent you an email with the activation link
          </Typography>
          <Link href={routes.signIn} mt={4}>
            Sign in
          </Link>
        </Stack>
      ) : (
        <>
          <AvatarWithText text="Sign up" />
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
            <CustomTextField
              label="Email"
              field="email"
              type="email"
              formik={formik}
            />
            <PasswordField formik={formik} sx={{ mt: 1 }} />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={!isButtonActive}
            >
              Sign Up
            </Button>
            <Stack>
              <Link href={routes.signIn} variant="body2">
                Already have an account? Sign in
              </Link>
            </Stack>

            {/* // remove it later */}
            {formik.isSubmitting && <Loader />}
          </Box>
        </>
      )}
    </LoginLayout>
  );
};

export default SignUp;
