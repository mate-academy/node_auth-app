import React, { useEffect } from "react";

const EmailField = ({
  children,
  addClasses = "",
  label = "Email",
  fieldName = "email",
  handleChange = () => {},
  value = "",
}) => {
  //#region Render
  return (
    <div className={`Form-Item ${addClasses}`}>
      <label className={"Form-Label"}>{label}</label>

      <div className={"Form-InputContainer"}>
        <img
          src={"./message-icon.svg"}
          className={"Form-InputIcon EnvelopeIcon"}
          alt={"Envelope icon"}
        />
        <input
          className={"FormControl Form-Input"}
          type={"text"}
          placeholder={label}
          onChange={(event) => handleChange(fieldName, event.target.value)}
          value={value}
        />

        {children}
      </div>
    </div>
  );
  //#endregion
};

export default EmailField;
