import type React from "react";
import styles from "./AuthCard.module.scss";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export const AuthCard: React.FC<Props> = ({ title, subtitle, children }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.authCard}>
        <h1 className="title is-3 has-text-centered">{title}</h1>
        {subtitle && (
          <p className="subtitle is-6 has-text-centered">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
};
