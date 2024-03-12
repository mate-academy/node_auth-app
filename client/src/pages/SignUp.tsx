import { FC } from "react";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { Box, Stack } from "@mui/material";
import { routes } from "../router/routes";
import LoginLayout from "../layout/LoginLayout";
import AvatarWithText from "../components/AvatarWithText";
import { useFormik } from "formik";
import * as Yup from "yup";
import CustomTextField from "../components/CustomTextField";
import { useAuthContext } from "../context/AuthProvider";

const textFields = [
  {
    type: "email",
    name: "Email Address",
  },
  {
    type: "password",
    name: "Password",
  },
];

const SignUp: FC = () => {
  const { registration } = useAuthContext();

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
    onSubmit: (values) => {
      console.log(values);

      registration(values);
    },
  });

  return (
    <LoginLayout>
      <>
        <AvatarWithText text="Sign up" />
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
          {textFields.map(({ name, type }, index) => (
            <CustomTextField
              key={`${type}_${index}`}
              label={name}
              field={type}
              formik={formik}
            />
          ))}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Stack justifyContent="flex-end">
            <Link href={routes.login.signIn} variant="body2">
              Already have an account? Sign in
            </Link>
          </Stack>
        </Box>
      </>
    </LoginLayout>
  );
};

export default SignUp;
