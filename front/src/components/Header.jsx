import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Header = ({ addClasses = "" }) => {
  // #region Get navigation from router
  const navigate = useNavigate();
  // #endregion

  // #region Get user and auth from context
  const { user, logout } = useContext(AppContext);
  // #endregion

  // #region Render
  return (
    <header className={`Header Header_Dark ${addClasses}`}>
      <div className={"Header-Content"}>
        <div className={"Header-Left"}>
          <img
            src={"./logo.svg"}
            className={"Logo Header-Logo"}
            alt={"Logo react"}
            onClick={() => {
              navigate("/");
            }}
          />

          <nav className={"Header-Nav NavMenu"}>
            <NavLink
              to={"/"}
              className={({ isActive }) =>
                isActive ? "NavMenu-Item NavMenu-Item_Active" : "NavMenu-Item"
              }
            >
              Home
            </NavLink>

            {user?.id && (
              <>
                <NavLink
                  to={"users"}
                  className={({ isActive }) =>
                    isActive
                      ? "NavMenu-Item NavMenu-Item_Active"
                      : "NavMenu-Item"
                  }
                >
                  Users
                </NavLink>

                <NavLink
                  to={"profile"}
                  className={({ isActive }) =>
                    isActive
                      ? "NavMenu-Item NavMenu-Item_Active"
                      : "NavMenu-Item"
                  }
                >
                  Profile
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className={"Header-Right"}>
          {user?.id ? (
            <button
              type={"button"}
              className={"RegularButton Header-Auth"}
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          ) : (
            <button
              type={"button"}
              className={"RegularButton Header-Auth"}
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
  // #endregion
};

export default Header;
