import React from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';

export const Loading: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  return (
    <div
      className={classNames(styles.spinner, styles.isloading)}
      style={{ width: width + 'px', height: height + 'px' }}
    ></div>
  );
};
