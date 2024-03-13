import {
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type PasswordFieldWithLabelProps = {
  formik: any;
  sx?: object;
};

const PasswordField: React.FC<PasswordFieldWithLabelProps> = ({
  formik,
  sx,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const isTouched = formik.touched.password;
  const error = formik.errors.password;
  const isError = Boolean(error);

  return (
    <FormControl variant="outlined" sx={{ width: "100%", ...sx }}>
      <InputLabel htmlFor="field-password">Password</InputLabel>
      <OutlinedInput
        id="field-password"
        type={showPassword ? "text" : "password"}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
        label="Password"
        autoComplete="current-password"
        value={formik.values.password}
        onChange={(event) =>
          formik.setFieldValue("password", event.target.value)
        }
        onBlur={formik.handleBlur("password")} //need this, otherwise formik.touched will be always empty
        error={isTouched && isError}
      />
      {isTouched && error && (
        <FormHelperText error={true}>{error}</FormHelperText>
      )}
    </FormControl>
  );
};

export default PasswordField;
