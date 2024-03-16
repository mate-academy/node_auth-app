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
    //   switch (code) {
    //     case apiResponseCodes.SUCCESS:
    //       enqueueSnackbar({
    //         variant: "success",
    //         message: "the action is successed",
    //       });
    //       break;

    //     case apiResponseCodes.BAD_REQUEST:
    //       enqueueSnackbar({
    //         variant: "error",
    //         message: "The sent data is not valid",
    //       });
    //       break;

    //     case apiResponseCodes.UNAUTHORIZED:
    //       enqueueSnackbar({
    //         variant: "error",
    //         message:
    //           "Unauthorized access: you don't have permission to access this resource.",
    //       });
    //       break;

    //     case apiResponseCodes.FORBIDDEN:
    //       enqueueSnackbar({
    //         variant: "error",
    //         message:
    //           "Access forbidden: Your account is not yet activated. Please activate your account to access this resource.",
    //       });
    //       break;

    //     case apiResponseCodes.NOT_FOUND:
    //       enqueueSnackbar({
    //         variant: "error",
    //         message: "Resource not found due to a bad request.",
    //       });
    //       break;

    //     case apiResponseCodes.DATA_CONFLICT:
    //       enqueueSnackbar({
    //         variant: "error",
    //         message: "User with this email is already exist",
    //       });
    //       break;

    //     case apiResponseCodes.INTERNAL_SERVER_ERROR:
    //       enqueueSnackbar({
    //         variant: "error",
    //         message: "Internal server error.",
    //       });
    //       break;

    //     default:
    //       enqueueSnackbar({
    //         variant: "warning",
    //         message: message,
    //       });
    //       break;
    //   }

    enqueueSnackbar({
      variant: "error",
      message: message,
    });
  }

  return checkResponseCode;
};

export default useCheckResponseCode;
