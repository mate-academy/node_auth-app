import { useMemo } from 'react';
import styles from './Starfield.module.scss';

const WIDTH = 2560;
const HEIGHT = 1600;

const createStars = (count: number, colors: string[]) =>
  Array.from({ length: count }, () => {
    const x = Math.round(Math.random() * WIDTH);
    const y = Math.round(Math.random() * HEIGHT);
    const color = colors[Math.floor(Math.random() * colors.length)];

    return `${x}px ${y}px ${color}`;
  }).join(', ');

export const Starfield = () => {
  const stars = useMemo(
    () => ({
      small: createStars(600, ['#fff', '#cbd5ff', '#fff3d6']),
      medium: createStars(140, ['#fff', '#dbe4ff']),
      big: createStars(35, ['#fff']),
    }),
    [],
  );

  return (
    <div className={styles.starfield} aria-hidden="true">
      <div className={styles.milky} />
      <div
        className={`${styles.layer} ${styles.small}`}
        style={{ boxShadow: stars.small }}
      />
      <div
        className={`${styles.layer} ${styles.medium}`}
        style={{ boxShadow: stars.medium }}
      />
      <div
        className={`${styles.layer} ${styles.big}`}
        style={{ boxShadow: stars.big }}
      />
      <div className={styles.shooting} />
    </div>
  );
};
