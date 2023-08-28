import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import EmailField from "../components/EmailField";
import PasswordField from "../components/PasswordField";
import { messageService } from "../services/messageService";

const Login = ({ addClasses = "" }) => {
  //#region Get setUser function from context
  const { user } = useContext(AppContext);
  //#endregion

  //#region Get navigation from router
  const navigate = useNavigate();
  //#endregion

  //#region Get login from context
  const { login } = useContext(AppContext);
  //#endregion

  //#region Sign in data and it's update
  const [signInData, setSignInData] = useState({
    rulesAccepted: true,
  });

  const updateSignInData = (fieldName, newValue) => {
    setSignInData((state) => ({
      ...state,
      [fieldName]: newValue,
    }));
  };
  //#endregion

  //#region Submit login form
  const submitLoginForm = async (event, email, password) => {
    event.preventDefault();

    try {
      await login({ email, password });
      navigate("/profile");
    } catch (error) {
      messageService.showError(error.response?.data?.message);
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

  //#region Render
  return (
    <div className={`Login-LoginForm LoginContainer ${addClasses}`}>
      <div className={"LoginContainer-ImageContainer"}>
        <img
          className={"LoginImage"}
          src={"./login-image.svg"}
          alt={"Login image"}
        />
      </div>

      <form
        className={"LoginContainer-LoginForm Form"}
        onSubmit={(event) =>
          submitLoginForm(event, signInData.email, signInData.password)
        }
      >
        <div className={"RegularTitle Form-Item"}>Enter account</div>

        <EmailField
          handleChange={updateSignInData}
          value={signInData?.email || ""}
        />

        <PasswordField
          handleChange={updateSignInData}
          value={signInData?.password || ""}
        />

        <div className="Form-Item">
          <div className={"Form-Item Form-TextContainer"}>
            <Link to={"/claimReset"} className={"Form-Text"}>
              Forgot password
            </Link>
          </div>
        </div>

        <button className={"RegularButton Form-Item"} type={"submit"}>
          Login
        </button>

        <div className={"Form-Item"}>
          <button
            type={"button"}
            onClick={() => {
              navigate("/register");
            }}
            className={"RegularButton Form-RegisterButton"}
          >
            Register
          </button>
        </div>

        <div className={"Form-Item Form-RulesLink RulesLinkContainer"}>
          <div className={"FlexBlock"}>
            <input
              type={"checkbox"}
              onChange={(event) =>
                updateSignInData("rulesAccepted", event.target.checked)
              }
              checked={signInData.rulesAccepted}
              className={"RulesLinkContainer-CheckBox"}
            />
          </div>

          <Link to={"rulesandpolicy"} className={"RulesLinkContainer-Text"}>
            I agree with rules and policy
          </Link>
        </div>
      </form>
    </div>
  );
  //#endregion
};

export default Login;
