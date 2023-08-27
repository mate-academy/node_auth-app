import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const StartPage = ({ addClasses = "" }) => {
  //#region Get dictionary from context
  const { user } = useContext(AppContext);
  //#endregion

  //#region Get navigation from router
  const navigate = useNavigate();
  //#endregion

  //#region Render
  return (
    <React.Fragment>
      <div className={`StartPage ${addClasses}`}>
        <div className={"StartPage-Content"}>
          <div
            className={"GreetingImageContainer StartPage-GreetingImage"}
          ></div>

          <h2 className={"RegularTitle StartPage-Title"}>Try auth app</h2>

          <p className={"StartPage-Description"}>
            You can try how auth app works here
          </p>

          {!user?.id && (
            <>
              <button
                type={"button"}
                onClick={() => navigate("/login")}
                className={"RegularButton StartPage-LoginButton"}
              >
                Login
              </button>

              <button
                type={"button"}
                onClick={() => navigate("/register")}
                className={"RegularButton StartPage-RegisterButton"}
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </React.Fragment>
  );
  //#endregion
};

export default StartPage;
