import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";

const useErrorSnackbar = (): ((error: AxiosError) => void) => {
  const showError = (error: AxiosError) => {
    const customErrors: any = error.response?.data;

    enqueueSnackbar({
      variant: "error",
      message: customErrors?.message || "Internal server error",
    });
  };

  return showError;
};

export default useErrorSnackbar;
