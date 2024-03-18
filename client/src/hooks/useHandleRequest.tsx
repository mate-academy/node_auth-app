import { useState } from "react";
import useErrorSnackbar from "./useErrorSnackbar";

const useHandleRequest = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const showError = useErrorSnackbar();

  const handleRequest = async (
    request: Promise<any>,
    onSuccess: (response: any) => void
  ) => {
    setIsLoading(true);
    try {
      const response = await request;
      onSuccess(response);
      return { isSuccess: true, errors: null };
    } catch (error: any) {
      showError(error);
      return { isSuccess: false, errors: error.response?.data?.errors };
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handleRequest };
};

export default useHandleRequest;
