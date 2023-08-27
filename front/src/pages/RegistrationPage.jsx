import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { validationService } from "../services/validationService";
import { messageService } from "../services/messageService";
import Loader from "../components/Loader";
import { authService } from "../services/authService.js";
import EmailField from "../components/EmailField";
import PasswordField from "../components/PasswordField";
import "../styles.scss";

const RegistrationPage = ({ addClasses = "" }) => {
  //#region Get setUser function from context
  const { user } = useContext(AppContext);
  //#endregion

  //#region Get navigation from router
  const navigate = useNavigate();
  //#endregion

  //#region UserData
  const [userData, setUserData] = useState(null);
  //#endregion

  //#region Handling form fields editing
  const changeInputValueHandler = (fieldName, newValue) => {
    setUserData((user) => ({
      ...user,
      [fieldName]: newValue,
    }));
  };
  //#endregion

  //#region Loader
  const [isLoading, setIsLoading] = useState(false);
  //#endregion

  //#region Handling form submit
  const registrationSubmitHandler = async (event, user) => {
    event.preventDefault();

    if (!validationService.validateFullName(user.fullName)) {
      messageService.showError("Invalid name");

      return;
    }

    if (!validationService.validateEmailField(user.email)) {
      messageService.showError("Invalid email");

      return;
    }

    const validationResult = validationService.validatePasswords(
      userData.password,
      userData.confirmPassword
    );

    if (!validationResult.isValid) {
      messageService.showError(validationResult.message);
      return;
    }

    if (!user?.rulesAccepted) {
      messageService.showError("Accept rules and policy");

      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        email: user.email,
        fullName: user.fullName,
        password: user.password,
      });

      setRegistered(true);
    } catch (error) {
      if (error.message) {
        messageService.showError(error.message);

        return;
      }

      if (!error.response?.data) {
        return;
      }

      const { message } = error.response.data;

      if (message) {
        messageService.showError(message);
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };
  //#endregion

  //#region Redirect if authorized
  useEffect(() => {
    if (user?.id) {
      navigate("/profile");
    }
  }, [user?.id]);
  //#endregion

  const [registered, setRegistered] = useState(false);

  if (registered) {
    return (
      <section className={addClasses}>
        <h1 className="title">Check your email</h1>
        <p>We have sent you an email with the activation link</p>
      </section>
    );
  }

  //#region Render
  return (
    <div className={`RegistrationFormContainer ${addClasses}`}>
      <h2 className={"RegularTitle RegularTitle_Small"}>Registration</h2>

      {isLoading ? (
        <Loader />
      ) : (
        <form
          className={"Form RegistrationFormContainer-RegistrationForm"}
          onSubmit={(event) => registrationSubmitHandler(event, userData)}
        >
          <div className={"Form-Item"}>
            <label className={"Form-Label"} htmlFor="item01">
              Full name
            </label>

            <input
              required
              id="item01"
              placeholder={"Enter your name"}
              className={"FormControl FormInput"}
              name={"fullName"}
              type={"text"}
              value={userData?.fullName || ""}
              onChange={(event) =>
                changeInputValueHandler("fullName", event.target.value)
              }
            />
          </div>

          <EmailField
            handleChange={changeInputValueHandler}
            value={userData?.email || ""}
          />

          <PasswordField
            handleChange={changeInputValueHandler}
            value={userData?.password || ""}
          />

          <PasswordField
            handleChange={changeInputValueHandler}
            label={"Repeat password"}
            fieldName={"confirmPassword"}
            value={userData?.confirmPassword || ""}
          />

          <div className={"Form-Item FormRulesLink RulesLinkContainer"}>
            <div>
              <input
                type={"checkbox"}
                onChange={(event) =>
                  changeInputValueHandler("rulesAccepted", event.target.checked)
                }
                checked={userData?.rulesAccepted || false}
                className={"RulesLinkContainer-CheckBox"}
              />
            </div>

            <Link
              to={"/rulesandpolicy"}
              className={"RulesLinkContainer-Text"}
              target={"_blank"}
            >
              I accept rules and confidentiality policy
            </Link>
          </div>

          <div className={"Form-Item"}>
            <button
              className={"RegularButton"}
              type="submit"
              name="submit"
              id="mc-embedded-subscribe"
            >
              Register
            </button>
          </div>
        </form>
      )}
    </div>
  );
  //#endregion
};

export default RegistrationPage;
