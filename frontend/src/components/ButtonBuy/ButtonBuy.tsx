import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { Loading } from '../Loading/Loading';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected: boolean;
  isLoading?: boolean;
};

type Animation = 'animationSelect' | 'animationDeselect' | null;

export const ButtonBuy = ({
  selected,
  children,
  className,
  isLoading = false,
  ...props
}: Props) => {
  const selectedRef = useRef(selected);
  const [animation, setAnimation] = useState<Animation>(null);

  useEffect(() => {
    if (selectedRef.current !== selected) {
      setAnimation(selectedRef.current === false ? 'animationSelect' : 'animationDeselect');
    }

    selectedRef.current = selected;
  }, [selected]);

  return (
    <button
      {...props}
      onAnimationEnd={() => {
        setAnimation(null);
      }}
      className={classNames(className, styles.button, animation && styles[animation], {
        [styles.selected]: selected,
      })}
    >
      {isLoading && (
        <div className={styles.container}>
          <Loading width={32} height={32}></Loading>
        </div>
      )}
      <div style={{ visibility: isLoading ? 'hidden' : 'visible' }}>{children}</div>
    </button>
  );
};
