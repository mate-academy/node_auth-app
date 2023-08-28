import React from "react";

const NotFoundPage = ({ addClasses = "" }) => {
  //#region Render
  return (
    <div className={`InfoPage ${addClasses}`}>
      <h3 className="Centered">Page was not found</h3>
    </div>
  );
  //#endregion
};

export default NotFoundPage;
