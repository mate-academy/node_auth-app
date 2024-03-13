import { TextField } from "@mui/material";

type CustomTextFieldWithLabelProps = {
  label: string;
  field: string;
  formik: any;
  type?: string;
  sx?: object;
};

const CustomTextField: React.FC<CustomTextFieldWithLabelProps> = ({
  label,
  field,
  formik,
  type = "text",
  sx,
}) => {
  const isTouched = formik.touched[field as keyof typeof formik.touched];
  const error = formik.errors[field as keyof typeof formik.errors];
  const isError = Boolean(error);

  return (
    <TextField
      margin="normal"
      fullWidth
      type={type}
      label={label}
      value={formik.values[field]}
      onChange={(event) => formik.setFieldValue(field, event.target.value)}
      onBlur={formik.handleBlur(field)} //need this, otherwise formik.touched will be always empty
      error={isTouched && isError}
      helperText={isTouched && error}
      autoComplete={type}
      sx={{ ...sx }}
    />
  );
};

export default CustomTextField;
