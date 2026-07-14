import { Product } from '@/shared/type';
import React, { useMemo } from 'react';

import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
// import { ButtonHeart } from '../ButtonHeart/ButtonHeart';
import { ButtonBuy } from '../ButtonBuy/ButtonBuy';
import { useCart } from '@/app/providers/Cart';
import { Link } from 'react-router-dom';
import { useFavourites } from '@/app/providers/Favorities';
import { ButtonHeart } from '../ButtonHeart/ButtonHeart';
import { Skeleton } from 'boneyard-js/react';
import { defaultProduct } from '@/shared/defaultProduct';
import { apiFromServer } from '@/api/apiFromServer';

type Props = React.ComponentProps<'article'> & {
  product?: Product | undefined;
};

export const ProductCard = ({ product, ...props }: Props) => {
  const { t } = useTranslation();
  const { favourites, setFavourites } = useFavourites();

  const preparedProduct = useMemo(() => {
    return product ? product : defaultProduct;
  }, [product]);

  const { cart, toggleCartProduct } = useCart();

  const isFavourite = useMemo(
    () => favourites.includes(String(preparedProduct.id)),
    [favourites, preparedProduct.id],
  );
  const isInCart = useMemo(
    () => cart.some((productCart) => String(productCart.id) === String(preparedProduct.id)),
    [cart, preparedProduct.id],
  );


  const cardWithoutContainer = (
    <>
      <Link
        className={styles.image}
        to={'/' + preparedProduct.category + '/' + preparedProduct.id}
      >
        <img
          className={styles.imageImg}
          src={apiFromServer.getImageUrl(preparedProduct.generalImage)}
          alt={preparedProduct.name + ' image'}
          loading="lazy"
        />
      </Link>
      <Link
        className={styles.titleLink}
        to={'/' + preparedProduct.category + '/' + preparedProduct.id}
      >
        <h4 className={styles.title}>{preparedProduct.name}</h4>
      </Link>
      <div className={styles.priceBox}>
        <h3 className={styles.price}>{'$' + preparedProduct.fullPrice}</h3>
        <h3 className={styles.price + ' ' + styles.pricelineThrough}>
          {'$' + preparedProduct.price}
        </h3>
      </div>

      <div className={styles.line}></div>
      <div className={styles.details}>
        <div className={styles.detail}>
          <p className={styles.detailText1}>{t('productCart.screen')}</p>
          <p className={styles.detailText2}>{preparedProduct.screen}</p>
        </div>
        <div className={styles.detail}>
          <p className={styles.detailText1}>{t('productCart.capacity')}</p>
          <p className={styles.detailText2}>{preparedProduct.capacity}</p>
        </div>
        <div className={styles.detail}>
          <p className={styles.detailText1}>{t('productCart.RAM')}</p>
          <p className={styles.detailText2}>{preparedProduct.ram}</p>
        </div>
      </div>
      <div className={styles.buttons}>
        <ButtonBuy
          aria-label={`Buy product ${preparedProduct.name}`}
          className={styles.buttonBuy}
          selected={isInCart}
          onClick={() => {
            if (!product) {
              return;
            }

            toggleCartProduct(String(product.id));
          }}
        >
          {isInCart ? t('productCart.buttonSelected') : t('productCart.button')}
        </ButtonBuy>
        <ButtonHeart
          aria-label={`Like product ${preparedProduct.name}`}
          className={styles.buttonHeart}
          like={isFavourite}
          onClick={() => {
            setFavourites((prev) =>
              prev.includes(String(preparedProduct.id))
                ? prev.filter((id) => id !== String(preparedProduct.id))
                : [...prev, String(preparedProduct.id)],
            );
          }}
        ></ButtonHeart>
      </div>
    </>
  );

  return (
    <article {...props} className={styles.main} aria-label={preparedProduct.name}>
      <div className={styles.content}>
        <Skeleton
          fallback={cardWithoutContainer}
          fixture={cardWithoutContainer}
          name="ProductCard"
          loading={!product}
          color="var(--text)"
          darkColor="var(--text )"
          animate="shimmer"
          className={styles.skeleton}
        >
          {cardWithoutContainer}
        </Skeleton>
      </div>
    </article>
  );
};
