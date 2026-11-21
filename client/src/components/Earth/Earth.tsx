import styles from './Earth.module.scss';

export const Earth = () => (
  <div className={styles.earth} aria-hidden="true">
    <img className={styles.photo} src="/planets/earth-daymap.jpg" alt="" />
  </div>
);