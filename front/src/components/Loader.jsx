import React from "react";

const Loader = () => {
  //#region Render
  return (
    <div className="LoaderWrapper">
      <div className="Loader isLoading">
        <img src="/logo192.png" alt={"Loader"} />
      </div>
    </div>
  );
  //#endregion
};

export default Loader;
