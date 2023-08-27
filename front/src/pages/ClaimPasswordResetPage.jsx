import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { authService } from "../services/authService";
import { messageService } from "../services/messageService";
import EmailField from "../components/EmailField";
import { validationService } from "../services/validationService";

const ClaimPasswordResetPage = (addClasses = "") => {
  //#region Update email
  const [email, setEmail] = useState("");

  const update = (fieldName = "email", newValue) => {
    setEmail(newValue);
  };
  //#endregion

  //#region Submit form
  const submitEmail = async (event, email) => {
    event.preventDefault();

    if (!validationService.validateEmailField(email)) {
      messageService.showError("Email value is wrong");

      return;
    }

    try {
      await authService.recover(email);

      setCompleted(true);
    } catch (error) {
      messageService.showError(error.response?.data?.message);
    }
  };
  //#endregion

  const [completed, setCompleted] = useState(false);

  //#region Render
  if (completed) {
    return (
      <section className={"App-Screen"}>
        <h1 className="Title">Check your email</h1>
        <p>We have sent you an email with the recover link</p>
      </section>
    );
  }

  return (
    <div className={`ClaimPasswordResetPage ${addClasses}`}>
      <form
        className={"LoginContainer-LoginForm Form"}
        onSubmit={(event) => submitEmail(event, email)}
      >
        <div className={"RegularTitle Form-Item"}>Enter email</div>

        <EmailField
          handleChange={update}
          fieldName={"email"}
          value={email || ""}
        />

        <button className={"RegularButton LoginForm-Item"} type={"submit"}>
          Send
        </button>
      </form>
    </div>
  );
  //#endregion
};

export default ClaimPasswordResetPage;
