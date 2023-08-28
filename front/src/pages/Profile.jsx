import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { userService } from "../services/userService";
import { authService } from "../services/authService";
import { validationService } from "../services/validationService";
import Loader from "../components/Loader";
import { messageService } from "../services/messageService";
import EmailField from "../components/EmailField";
import PasswordField from "../components/PasswordField";

const Profile = ({ addClasses = "" }) => {
  //#region Get user and auth from context
  const { user, setUser, setIsActivated } = useContext(AppContext);
  //#endregion

  //#region UserData
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (user.id) {
      setUserData(user);
    }
  }, [user]);
  //#endregion

  //#region Loader
  const [isLoading, setIsLoading] = useState(false);
  //#endregion

  //#region Editing username
  const [isNameEditing, setIsNameEditing] = useState(false);

  const saveNewName = async () => {
    try {
      await userService.updateName(user.email, userData.fullName);

      setIsNameEditing(false);
      setUser((data) => ({
        ...data,
        fullName: userData.fullName,
      }));
    } catch (error) {
      messageService.showError("Something went wrong");
    }
  };
  //#endregion

  //#region Editing email
  const [isEmailEditing, setIsEmailEditing] = useState(false);

  const handleSaveEmailClick = () => {
    const validationResult = validationService.validateEmailField(
      userData.email
    );

    if (!validationResult) {
      messageService.showError("Wrong value for email");
      return;
    }

    setIsReauth(true);
  };

  const saveEmail = async (oldEmail, newEmail) => {
    try {
      const result = await userService.updateEmail(oldEmail, newEmail);

      if (result.message === "OK") {
        setTimeout(() => {
          setIsActivated(false);
          setUser(result.user);
        }, 2000);
      } else {
        messageService.showError("Something went wrong");
      }
    } catch (error) {
      messageService.showError("Something went wrong");
    }
  };
  //#endregion

  //#region Editing password
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);

  const savePassword = async (email, password) => {
    try {
      await authService.resetAuth(email, password);
      messageService.showSuccess("Password was changed");
    } catch (error) {
      messageService.showError("Something went wrong");
    }
  };

  const handleSavePasswordClick = async () => {
    try {
      const validationResult = validationService.validatePasswords(
        userData.password,
        userData.confirmPassword
      );

      if (!validationResult.isValid) {
        messageService.showError(validationResult.message);
        return;
      }

      await savePassword(user.email, userData.password);

      setIsPasswordEditing(false);
    } catch (error) {
      messageService.showError("Something went wrong");
    }
  };
  //#endregion

  //#region Handling form fields editing
  const updateUserData = (fieldName, newValue) => {
    setUserData((user) => ({
      ...user,
      [fieldName]: newValue,
    }));
  };
  //#endregion

  //#region Reauth
  const [isReauth, setIsReauth] = useState(false);

  const handleReauth = async () => {
    try {
      setIsLoading(true);

      const result = await authService.reauth(user.email, userData.oldPassword);

      if (result.message === "OK") {
        setIsReauth(false);

        if (isEmailEditing) {
          await saveEmail(user.email, userData.email);

          messageService.showSuccess(
            "Email was changed. You should activate it"
          );
          setIsEmailEditing(false);
        } else {
          setIsPasswordEditing(true);
        }
      } else {
        messageService.showError("Something went wrong");
      }
    } catch (error) {
      messageService.showError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  //#endregion

  //#region Render
  return isLoading ? (
    <Loader />
  ) : (
    <div className={`Form ${addClasses}`}>
      <h2 className={"RegularTitle RegularTitle_Small DesktopTitle"}>
        Profile
      </h2>

      <div className={"Form-Item"}>
        <div className={"Form-Item AvatarContainer"}>
          <img
            className={"Avatar"}
            src={userData?.photoUrl || "/blank-person-icon.webp"}
            alt={"Avatar photo"}
          />
        </div>
      </div>

      <div className={"Form-Item"}>
        <label className={"Form-Label"} htmlFor="item01">
          Username
        </label>

        <div className={"Form-InputContainer"}>
          <input
            disabled={!isNameEditing}
            id="item01"
            placeholder={"Username"}
            className={
              isNameEditing ? "FormControl" : "FormControl ProfileData-Input"
            }
            name={"fullName"}
            type={"text"}
            value={userData?.fullName || ""}
            onChange={(event) =>
              updateUserData(event.target.name, event.target.value)
            }
          />

          {isNameEditing ? (
            <div className="ProfileData-Edit" onClick={() => saveNewName()}>
              <img src={"/save-icon.svg"} alt={"save"} />
            </div>
          ) : (
            <div
              className="ProfileData-Edit"
              onClick={() => setIsNameEditing(true)}
            >
              <img src={"/edit.svg"} alt={"edit"} />
            </div>
          )}
        </div>
      </div>

      <EmailField handleChange={updateUserData} value={userData?.email || ""}>
        {isEmailEditing ? (
          <div
            className="ProfileData-Edit"
            onClick={() => handleSaveEmailClick()}
          >
            <img src={"/save-icon.svg"} alt={"save"} />
          </div>
        ) : (
          <div
            className="ProfileData-Edit"
            onClick={() => setIsEmailEditing(true)}
          >
            <img src={"/edit.svg"} alt={"edit"} />
          </div>
        )}
      </EmailField>

      {isReauth && (
        <>
          <h4>Please, confirm action by your password</h4>

          <PasswordField
            handleChange={updateUserData}
            value={userData?.oldPassword || ""}
            fieldName={"oldPassword"}
          />

          <div className={"Form-Item"}>
            <button
              type={"button"}
              className={"RegularButton RegularButton_Contrast"}
              onClick={() => {
                handleReauth();
              }}
            >
              Confirm
            </button>
          </div>
        </>
      )}

      {!isReauth && !isPasswordEditing && !isEmailEditing && (
        <div className={"Form-Item"}>
          <button
            type={"button"}
            className={"RegularButton RegularButton_Contrast"}
            onClick={() => {
              setIsReauth(true);
            }}
          >
            Change password
          </button>
        </div>
      )}

      {isPasswordEditing && (
        <>
          <PasswordField
            handleChange={updateUserData}
            value={userData?.password || ""}
            fieldName={"password"}
          />

          <PasswordField
            handleChange={updateUserData}
            value={userData?.confirmPassword || ""}
            fieldName={"confirmPassword"}
            label={"Repeat password"}
          />

          <div className="Form-Item">
            <button
              type={"button"}
              className={"RegularButton"}
              onClick={() => {
                handleSavePasswordClick();
              }}
            >
              Save
            </button>
          </div>
        </>
      )}
    </div>
  );
  //#endregion
};

export default Profile;
