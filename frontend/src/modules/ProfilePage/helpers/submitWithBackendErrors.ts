type ApiSuccess = {
  message?: string;
};

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string>;
};

type NotificationSetter = (value: { success?: string; error?: string }) => void;

type FormHelper<TValues> = {
  setFieldError: (field: keyof TValues | string, message: string) => void;
  setSubmitting: (isSubmitting: boolean) => void;
};

export async function submitWithBackendErrors<TValues, TResponse extends ApiSuccess>(
  options: {
    values: TValues;
    request: (values: TValues) => Promise<TResponse>;
    formHelper: FormHelper<TValues>;
    setNotification: NotificationSetter;
    onSuccess?: (data: TResponse) => void | Promise<void>;
  }
) {
  const {
    values,
    request,
    formHelper,
    setNotification,
    onSuccess,
  } = options;

  try {
    const data = await request(values);

    if (data.message) {
      setNotification({ success: data.message });
    }

    await onSuccess?.(data);
  } catch (error) {
    const backendError = error as {
      message?: string;
      response?: {
        data?: ApiErrorResponse;
      };
    };

    if (backendError.message) {
      setNotification({ error: backendError.message });
    }

    const responseData = backendError.response?.data;

    if (!responseData) {
      return;
    }

    const { errors, message } = responseData;

    if (errors) {
      Object.entries(errors).forEach(([field, fieldError]) => {
        formHelper.setFieldError(field, fieldError);
      });
    }

    if (message) {
      setNotification({ error: message });
    }
  } finally {
    formHelper.setSubmitting(false);
  }
}
