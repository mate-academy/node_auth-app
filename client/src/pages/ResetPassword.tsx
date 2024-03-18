import { FC, useEffect, useState } from "react";
import { Stack, Typography, Link } from "@mui/material";
import { useParams } from "react-router-dom";
import LoginLayout from "../layout/LoginLayout";
import { routes } from "../router/routes";
import { useAuthContext } from "../context/AuthProvider";
import { useFormik } from "formik";
import * as Yup from "yup";
import PasswordField from "../components/PasswordField";
import { LoadingButton } from "@mui/lab";

const ResetPassword: FC = () => {
  const { resetPasswordToken } = useParams<{ resetPasswordToken: string }>();
  const { verifyResetPasswordToken, resetPassword, isLoading } =
    useAuthContext();
  const [isLinkValid, setIsLinkValid] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const sendToken = async () => {
    const { isSuccess } = await verifyResetPasswordToken(resetPasswordToken);
    setIsLinkValid(isSuccess);
  };

  useEffect(() => {
    sendToken();
  }, []);

  const handlePasswordReset = async (password: string) => {
    if (resetPasswordToken) {
      const isSuccess = await resetPassword(password, resetPasswordToken);

      if (isSuccess) {
        setIsDone(true);
      }
    }
  };

  const formik = useFormik({
    initialValues: { password: "" },
    validationSchema: Yup.object().shape({
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: ({ password }) => handlePasswordReset(password),
  });

  const isButtonActive = formik.values.password && !formik.errors.password;

  return (
    <LoginLayout>
      <Stack
        sx={{ height: "350px", justifyContent: "center", alignItems: "center" }}
      >
        {isLinkValid && !isDone && (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: "600" }}>
              Enter your new password
            </Typography>
            <PasswordField formik={formik} sx={{ mt: 2 }} />
            <LoadingButton
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={!isButtonActive}
              // loading={!isLoading}
              onClick={() => formik.handleSubmit()}
            >
              Change password
            </LoadingButton>
          </>
        )}
        {!isLinkValid && (
          <Stack sx={{ alignItems: "center" }}>
            <Typography
              variant="subtitle1"
              sx={{ color: (theme: any) => theme.palette.error.main }}
            >
              Wrong link for reset password
            </Typography>
            <Link href={routes.signIn} mt={1}>
              Sign in
            </Link>
          </Stack>
        )}
        {isLinkValid && isDone && (
          <Stack sx={{ alignItems: "center" }}>
            <Typography
              sx={{ color: (theme: any) => theme.palette.success.main, p: 2 }}
            >
              Your password was successfully changed
            </Typography>
            <Link href={routes.signIn} mt={1}>
              Sign in
            </Link>
          </Stack>
        )}
      </Stack>
    </LoginLayout>
  );
};

export default ResetPassword;
