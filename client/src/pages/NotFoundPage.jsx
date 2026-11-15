import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <section className="box has-text-centered">
    <h1 className="title is-1">404</h1>
    <p className="subtitle">Page not found</p>
    <Link to="/" className="button is-success has-text-weight-bold">
      Go home
    </Link>
  </section>
);
