import React from 'react';
export const Loader = () => (
  <div className="loader-wrapper" role="status" aria-live="polite">
    <div className="loader is-loading"></div>
    <span className="visually-hidden">Loading...</span>
  </div>
);
