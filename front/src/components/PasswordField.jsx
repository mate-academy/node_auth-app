import React, { useState } from "react";

const PasswordField = ({
  addClasses = "",
  label = "Password",
  fieldName = "password",
  handleChange = () => {},
  value = "",
}) => {
  //#region Manage password visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  //#endregion

  //#region Render
  return (
    <div className={`Form-Item ${addClasses}`}>
      <label className={"Form-Label"}>{label}</label>

      <div className={"Form-InputContainer"}>
        {value ? (
          <img
            src={"./lock-blue.svg"}
            className={"Form-InputIcon LockIcon"}
            alt={"Lock icon"}
          />
        ) : (
          <img
            src={"./lock-icon.svg"}
            className={"Form-InputIcon LockIcon"}
            alt={"Lock icon"}
          />
        )}

        <input
          className={
            value
              ? "FormControl Form-Input PasswordInputWithText"
              : "FormControl Form-Input"
          }
          type={isPasswordVisible ? "text" : "password"}
          placeholder={"Password"}
          name={fieldName}
          onChange={(event) =>
            handleChange(event.target.name, event.target.value)
          }
          value={value}
        />

        {value ? (
          isPasswordVisible ? (
            <img
              src={"./eye-with-line-icon-blue.svg"}
              className={"Form-InputIconRight"}
              alt={"Eye icon"}
              onClick={() => setIsPasswordVisible(false)}
            />
          ) : (
            <img
              src={"./eye-icon-blue.svg"}
              className={"Form-InputIconRight EyeIcon"}
              alt={"Eye icon"}
              onClick={() => setIsPasswordVisible(true)}
            />
          )
        ) : isPasswordVisible ? (
          <img
            src={"./eye-with-line-icon.svg"}
            className={"Form-InputIconRight"}
            alt={"Eye icon"}
            onClick={() => setIsPasswordVisible(false)}
          />
        ) : (
          <img
            src={"./eye-icon.svg"}
            className={"Form-InputIconRight EyeIcon"}
            alt={"Eye icon"}
            onClick={() => setIsPasswordVisible(true)}
          />
        )}
      </div>
    </div>
  );
  //#endregion
};

export default PasswordField;
