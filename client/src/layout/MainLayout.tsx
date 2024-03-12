import { FC } from "react";
import Box from "@mui/material/Box";
import CustomAppMenu from "../components/CustomAppMenu";

type Props = {
  children: React.ReactElement;
};

const MainLayout: FC<Props> = ({ children }) => {
  return (
    <>
      <CustomAppMenu />
      <Box p={2}>
        {children}
      </Box>
    </>
  );
};

export default MainLayout;
