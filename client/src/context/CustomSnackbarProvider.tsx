import { Grow, styled } from "@mui/material";
import { MaterialDesignContent, SnackbarProvider } from "notistack";
import { PropsWithChildren } from "react";

const StyledMaterialDesignContent = styled(MaterialDesignContent)(
  ({ theme }) => ({
    borderRadius: "10px",
    boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.2)",

    "&.notistack-MuiContent-success": {
      background: theme.palette.success.main,
    },
    "&.notistack-MuiContent-error": {
      background: theme.palette.error.main,
    },
    "&.notistack-MuiContent-warning": {
      background: theme.palette.warning.main,
    },
  })
);

const CustomSnackbarProvider = ({ children }: PropsWithChildren) => {
  return (
    <SnackbarProvider
      TransitionComponent={Grow}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      Components={{
        success: StyledMaterialDesignContent,
        error: StyledMaterialDesignContent,
        warning: StyledMaterialDesignContent,
      }}
      autoHideDuration={3000}
    >
      {children}
    </SnackbarProvider>
  );
};

export default CustomSnackbarProvider;
