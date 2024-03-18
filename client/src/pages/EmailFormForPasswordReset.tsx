import { FC, useState } from "react";
import { routes } from "../router/routes";
import { Stack, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import { useAuthContext } from "../context/AuthProvider";
import CustomTextField from "../components/CustomTextField";
import LoginLayout from "../layout/LoginLayout";

const EmailFormForPasswordReset: FC = () => {
  const { sendRecoveringPasswordLink, isLoading } = useAuthContext();
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object().shape({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    }),
    onSubmit: async (values) => {
      const { isSuccess } = await sendRecoveringPasswordLink(values.email);

      if (isSuccess) {
        setIsSent(true);
      }
    },
  });

  const isButtonActive = formik.values.email && !formik.errors.email;

  const renderSentMessage = () => (
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
        We have sent you an email with the link for password resetting
      </Typography>
    </Stack>
  );

  const renderForm = () => (
    <>
      <Typography component="h1" variant="h5" sx={{ textAlign: "center" }}>
        Recover your password or username
      </Typography>
      <CustomTextField
        label="Email"
        field="email"
        type="email"
        formik={formik}
      />
      <Stack direction="row" spacing={2} sx={{ mt: 3, mb: 2 }}>
        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          disabled={!isButtonActive}
          loading={isLoading}
          onClick={() => formik.handleSubmit()}
        >
          Recover password
        </LoadingButton>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate(routes.signIn)}
        >
          Wait! I remember
        </Button>
      </Stack>
    </>
  );

  return (
    <LoginLayout>{isSent ? renderSentMessage() : renderForm()}</LoginLayout>
  );
};

export default EmailFormForPasswordReset;
