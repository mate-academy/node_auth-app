const NotActivatedUser = ({ addClasses = "" }) => {
  //#region Render
  return (
    <div className={`InfoPage ${addClasses}`}>
      <h3 className="Centered">
        User is not activated. Please, activate your account using link which
        was sent to your email
      </h3>
    </div>
  );
  //#endregion
};

export default NotActivatedUser;
