import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import Loader from "../components/Loader.jsx";

export const AccountActivationPage = ({ addClasses = "" }) => {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const { activate } = useContext(AppContext);
  // const { activationToken } = useParams();
  const params = useParams();

  //#region Get navigation from router
  const navigate = useNavigate();
  //#endregion

  useEffect(() => {
    const activationToken =
      Object.values(params).length > 0 ? Object.values(params)[0] : undefined;

    activate(activationToken)
      .then(() =>
        setTimeout(() => {
          navigate("/profile");
        }, 2000)
      )
      .catch((error) => {
        setError(error.response?.data?.message || `Wrong activation link`);
      })
      .finally(() => {
        setDone(true);
      });
  }, []);

  if (!done) {
    return <Loader />;
  }

  return (
    <div className={addClasses}>
      <h1 className="title">Account activation</h1>

      {error ? (
        <p className="Notification Notification_Danger">{error}</p>
      ) : (
        <p className="Notification Notification_Success">
          Your account is now active
        </p>
      )}
    </div>
  );
};

export default AccountActivationPage;
