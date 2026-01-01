import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Loader } from "../../components/Loader/Loader";
import { Navigate, useParams } from "react-router-dom";

export const ActivationPage = () => {
  const [isChecked, setChecked] = useState(false);
  const { activate } = useContext(AuthContext);
  const { activationToken } = useParams();

  useEffect(() => {
    if (!activationToken) {
      return;
    }

    activate(activationToken)
      .catch((error) => {
        console.error('Activation failed:', error);
      })
      .finally(() => setChecked(true));
  }, [activate, activationToken]);

  if (!isChecked) {
    return <Loader />
  }

  return (
    <Navigate to='/profile/details' />
  )
}