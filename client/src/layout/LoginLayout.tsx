import { FC } from "react";
import Box from "@mui/material/Box";
import { Container } from "@mui/material";

type Props = {
  children: React.ReactElement;
};

const LoginLayout: FC<Props> = ({ children }) => {
  return (
    <>
      <Box
        sx={{
          paddingTop: 8,
          position: "relative",
          "&::before": {
            content: '""',
            display: "block",
            position: "absolute",
            top: 0,
            right: 0,
            left: 0,
            zIndex: -1,
            height: "200px",
            backgroundColor: (theme) => theme.palette.primary.main,
          },
        }}
      ></Box>
      <Container maxWidth="xs">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: (theme) => theme.background.default,
            p: 4,
            boxShadow: (theme) => theme.boxShadow.main,
          }}
        >
          {children}
        </Box>
      </Container>
    </>
  );
};

export default LoginLayout;
