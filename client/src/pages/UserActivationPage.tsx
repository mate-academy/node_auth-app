import { FC, useEffect, useState } from "react";
import { Stack, Typography, Link } from "@mui/material";
import { useParams } from "react-router-dom";
import LoginLayout from "../layout/LoginLayout";
import { routes } from "../router/routes";
import { useAuthContext } from "../context/AuthProvider";
import Loader from "../components/Loader";

const UserActivationPage: FC = () => {
  const { activationToken } = useParams<{ activationToken: string }>();
  const { activateUser, isLoading } = useAuthContext();
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    const userActivation = async () => {
      const isSuccess = await activateUser(activationToken);

      if (isSuccess) {
        setIsActivated(true);
      }
    };

    userActivation();
    console.log("how many times");
  }, []);

  return (
    <LoginLayout>
      <Stack
        sx={{ height: "350px", justifyContent: "center", alignItems: "center" }}
      >
        <Typography variant="subtitle1" mb={2} sx={{ fontWeight: "600" }}>
          Activation Page
        </Typography>

        {isLoading && <Loader />}

        {!isLoading && (
          <Stack sx={{ alignItems: "center" }}>
            <Typography
              sx={{
                color: (theme: any) =>
                  isActivated
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                p: 2,
              }}
            >
              {isActivated
                ? "Your account now is activated"
                : "Wrong activation link"}
            </Typography>
            {isActivated && (
              <Link href={routes.signIn} mt={1}>
                Sign in
              </Link>
            )}
          </Stack>
        )}
      </Stack>
    </LoginLayout>
  );
};

export default UserActivationPage;
