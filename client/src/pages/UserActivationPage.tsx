import { FC, useEffect, useState } from "react";
import { Stack, Typography, Link } from "@mui/material";
import { useParams } from "react-router-dom";
import LoginLayout from "../layout/LoginLayout";
import { routes } from "../router/routes";
import { useAuthContext } from "../context/AuthProvider";
import Loader from "../components/Loader";

const UserActivationPage: FC = () => {
  const { activationToken } = useParams<{ activationToken: string }>();
  const { activateUser, isError } = useAuthContext();

  const [loading, setLoading] = useState(false);

  const userActivation = async () => {
    try {
      setLoading(true);
      await activateUser(activationToken);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    userActivation();
  }, []);

  return (
    <LoginLayout>
      <Stack
        sx={{ height: "350px", justifyContent: "center", alignItems: "center" }}
      >
        <Typography variant="subtitle1" mb={2} sx={{ fontWeight: "600" }}>
          Activation Page
        </Typography>

        {loading && <Loader />}

        {!loading && (
          <Stack sx={{ alignItems: "center" }}>
            <Typography
              sx={{
                color: (theme) =>
                  !isError
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                p: 2,
              }}
            >
              {!isError
                ? "Your account now is activated"
                : "Wrong activation link"}
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

export default UserActivationPage;
