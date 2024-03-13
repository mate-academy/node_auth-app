import { useSnackbar } from "notistack";
import { apiResponseCodes } from "../http/apiCodes";

const useCheckResponseCode = () => {
  const { enqueueSnackbar } = useSnackbar();

  function checkResponseCode({
    code,
    message,
  }: {
    code: string;
    message?: string;
  }) {
    switch (code) {
      case apiResponseCodes.SUCCESS:
        enqueueSnackbar({
          variant: "success",
          message: "the action is successed",
        });
        break;

      case apiResponseCodes.BAD_REQUEST:
        enqueueSnackbar({
          variant: "error",
          message: "The sent data is not valid",
        });
        break;

      case apiResponseCodes.BAD_TOKEN:
        enqueueSnackbar({
          variant: "error",
          message: "The email or password you entered is incorrect.",
        });
        break;

      case apiResponseCodes.NOT_FOUND:
        enqueueSnackbar({
          variant: "error",
          message: "Resource not found due to a bad request.",
        });
        break;

      case apiResponseCodes.DATA_CONFLICT:
        enqueueSnackbar({
          variant: "error",
          message: "User with this email is already exist",
        });
        break;

      case apiResponseCodes.INTERNAL_SERVER_ERROR:
        enqueueSnackbar({
          variant: "error",
          message: "Internal server found.",
        });
        break;

      default:
        enqueueSnackbar({
          variant: "warning",
          message: message,
        });
        break;
    }
  }

  return checkResponseCode;
};

export default useCheckResponseCode;
