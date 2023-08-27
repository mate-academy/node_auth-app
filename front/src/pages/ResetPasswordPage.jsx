import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { ToastContainer, toast } from "react-toastify";
import { validationService } from "../services/validationService";
import { messageService } from "../services/messageService";
import PasswordField from "../components/PasswordField";

const ResetPasswordPage = ({ addClasses = "" }) => {
  //#region Url search params
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  //#endregion

  //#region Get navigation from router
  const navigate = useNavigate();
  //#endregion

  //#region Sign in data and it's update
  const [signInData, setSignInData] = useState({});

  const updateSignInData = (fieldName, newValue) => {
    setSignInData((state) => ({
      ...state,
      [fieldName]: newValue,
    }));
  };
  //#endregion

  //#region Get search params and check is link valid
  const [isLinkValid, setIsLinkValid] = useState(true);
  const [isSuccessScreen, setIsSuccessScreen] = useState(false);

  useEffect(() => {
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    authService
      .checkRecoverToken(email, token)
      .then((checkResult) => {
        if (checkResult?.status !== "OK") {
          setIsLinkValid(false);

          return;
        }
        updateSignInData("email", email);
      })
      .catch(() => {
        setIsLinkValid(false);
      });
  }, []);
  //#endregion

  //#region Reset password
  const resetPassword = async (email, password, confirmationPassword) => {
    try {
      const validationResult = validationService.validatePasswords(
        password,
        confirmationPassword
      );

      if (validationResult.isValid) {
        const result = await authService.reset(email, password);

        if (result?.status === "OK") {
          setIsSuccessScreen(true);
        } else {
          messageService.showError("Something went wrong");
        }
      } else {
        messageService.showError(validationResult.message);
      }
    } catch (error) {
      messageService.showError("Something went wrong");
    }
  };
  //#endregion

  //#region Render
  return (
    <React.Fragment>
      <div className={`Form ${addClasses}`}>
        {isLinkValid ? (
          <>
            {isSuccessScreen && (
              <>
                <div className={"Form-Item"}></div>
                <div className={"Form-Item"}>
                  <div className={"ImageContainer"}>
                    <img src={"/happy-face.svg"} alt={"Happy face"} />
                  </div>
                </div>
                <div className={"Form-Item"}>
                  <h2 className={"RegularTitle"}>Password was changed</h2>
                </div>

                <div className={"Form-Item"}>
                  <Link className={"RegularButton TryAgainLink"} to={"/login"}>
                    Login
                  </Link>
                </div>
              </>
            )}

            {!isSuccessScreen && (
              <>
                <div className={"Form-Item"}>
                  <h2 className={"RegularTitle RegularTitle_Small"}>
                    Password reset
                  </h2>
                </div>

                <PasswordField
                  handleChange={updateSignInData}
                  value={signInData?.password || ""}
                  fieldName={"password"}
                  label={"New Password"}
                />

                <PasswordField
                  handleChange={updateSignInData}
                  value={signInData?.repeatPassword || ""}
                  fieldName={"repeatPassword"}
                  label={"Confirm new password"}
                />

                <div className={"Form-Item"}>
                  <button
                    type={"button"}
                    className={"RegularButton"}
                    onClick={() =>
                      resetPassword(
                        signInData.email,
                        signInData.password,
                        signInData.repeatPassword
                      )
                    }
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className={"Form-Item"}></div>
            <div className={"Form-Item"}>
              <div className={"ImageContainer"}>
                <img src={"/sad-face.svg"} alt={"Sad face"} />
              </div>
            </div>

            <div className={"Form-Item"}>
              <h2 className={"RegularTitle"}>{"Link is not valid"}</h2>
            </div>
          </>
        )}
      </div>
    </React.Fragment>
  );
  //#endregion
};

export default ResetPasswordPage;
