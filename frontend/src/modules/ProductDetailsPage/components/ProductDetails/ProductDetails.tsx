import { useCart } from '@/app/providers/Cart';
import { useFavourites } from '@/app/providers/Favorities';
import { Category } from '@/shared/type';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageSwiper } from '../ImageSwiper';
import { ButtonColor } from '@/components/ButtonColor';
import classNames from 'classnames';
import { ButtonBuy } from '@/components/ButtonBuy/ButtonBuy';
import { ButtonHeart } from '@/components/ButtonHeart/ButtonHeart';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ButtonBack } from '@/components/ButtonBack';
import styles from './styles.module.scss';
import productColors from '@/shared/utils';
import skeleton from './skeleton.module.scss';
import { ButtonThird } from '@/components/ButtonThird/ButtonThird';
import { SectionYouMayAlsoLike } from '../SectionYouMayAlsoLike';
import { apiFromServer } from '@/api/apiFromServer';
import { defaultProductDetails } from '@/shared/defaultProductDetails';

type ProductDetailsState =
  | { status: 'loading' }
  | {
      status: 'success';
      product: Awaited<ReturnType<typeof apiFromServer.getProductDetails>>;
      productsByNamespace: Awaited<ReturnType<typeof apiFromServer.getProductsDetailsBySpaceId>>;
      colorsAvailable: string[];
      capacityAvailable: string[];
    }
  | { status: 'error'; error: string };

function hashString(str: string) {
  let hash = 2166136261;

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString().slice(1, 6);
}

export const ProductDetails = ({
  category,
  productId,
}: {
  category: Category;
  productId: string;
}) => {
  const { t, i18n } = useTranslation();
  const { favourites, setFavourites } = useFavourites();
  const { cart, toggleCartProduct } = useCart();

  const [state, setState] = useState<ProductDetailsState>({
    status: 'loading',
  });

  const isFavourite = useMemo(() => {
    if (state.status !== 'success') {
      return false;
    }
    return favourites.includes(String(state.product.id));
  }, [favourites, state]);

  const isInCart = useMemo(() => {
    if (state.status !== 'success') {
      return false;
    }
    return cart.some((product) => String(product.id) === String(state.product.id));
  }, [cart, state]);

  useEffect(() => {
    let ignoreResult = false;

    const getProducts = async () => {
      try {
        if (ignoreResult) {
          return;
        }

        const product = await apiFromServer.getProductDetails(productId);

        const productsByNamespace = await apiFromServer.getProductsDetailsBySpaceId(
          product.namespaceId,
        );

        const colorsAvailable: string[] = [];
        const capacityAvailable: string[] = [];

        productsByNamespace.forEach((item) => {
          if (!colorsAvailable.includes(item.color)) {
            colorsAvailable.push(item.color);
          }

          if (!capacityAvailable.includes(item.capacity)) {
            capacityAvailable.push(item.capacity);
          }
        });

        setState({
          status: 'success',
          product,
          productsByNamespace,
          colorsAvailable,
          capacityAvailable,
        });
      } catch (error) {
        if (ignoreResult) {
          return;
        }

        const message = error instanceof Error ? error.message : String(error);

        setState({
          status: 'error',
          error: `Something went wrong: ${message}`,
        });
      }
    };

    getProducts();

    return () => {
      ignoreResult = true;
    };
  }, [productId, category]);

  const prepareProductDetails = (
    product: Awaited<ReturnType<typeof apiFromServer.getProductDetails>>,
    productByNamespace: Awaited<ReturnType<typeof apiFromServer.getProductsDetailsBySpaceId>>,
    colorsAvailable: string[],
    capacityAvailable: string[],
    isLoading: boolean,
    key: string,
  ) => {
    const addSkeleton = (className: string = '') => {
      return {
        className: classNames(className, { [skeleton.skeleton]: isLoading }),
      };
    };

    return (
      <article key={key} className={styles.container}>
        <h1 {...addSkeleton(styles.title)}>{product.name}</h1>
        <ImageSwiper {...addSkeleton(styles.imageSwiper)} images={product.images}></ImageSwiper>
        <div className={styles.parameters}>
          <div className={styles.parameterBox}>
            <div className={styles.parameterTitle}>
              <p {...addSkeleton()}>{t('productDetails.availableColors')}</p>
              <p {...addSkeleton()}>{`ID ${hashString(String(product.id))}`}</p>
            </div>
            <div className={styles.parameterSelects}>
              {colorsAvailable.map((color) => {
                const link = productByNamespace.find((item) => item.color === color)?.id || '';
                return (
                  <ButtonColor
                    {...addSkeleton()}
                    key={color}
                    to={`/${category}/${link}`}
                    color={productColors[color] || 'red'}
                    selected={color === product.color}
                  ></ButtonColor>
                );
              })}
            </div>
          </div>

          <div
            className={classNames(styles.line, styles.lineMarginTop24, styles.lineMarginBottom24)}
          ></div>

          <div className={styles.parameterBox}>
            <div className={classNames(styles.parameterTitle)}>
              <p {...addSkeleton()}>{t('productDetails.selectCapacity')}</p>
            </div>
            <div className={styles.parameterSelects}>
              {capacityAvailable.map((capacity) => {
                const link =
                  productByNamespace.find((item) => item.capacity === capacity)?.id || '';
                return (
                  <ButtonThird
                    {...addSkeleton()}
                    key={capacity}
                    to={`/${category}/${link}`}
                    selected={capacity === product.capacity}
                  >
                    {capacity}
                  </ButtonThird>
                );
              })}
            </div>
          </div>

          <div
            className={classNames(styles.line, styles.lineMarginTop24, styles.lineMarginBottom32)}
          ></div>

          <div className={styles.priceBox}>
            <h3 {...addSkeleton(styles.price)}>{'$' + product.price}</h3>
            <h3 {...addSkeleton(styles.price + ' ' + styles.pricelineThrough)}>
              {'$' + product.fullPrice}
            </h3>
          </div>

          <div className={styles.buttons}>
            <ButtonBuy
              {...addSkeleton(styles.buttonBuy)}
              selected={isInCart}
              onClick={() => {
                toggleCartProduct(String(product.id));
              }}
            >
              {isInCart ? t('productCart.buttonSelected') : t('productCart.button')}
            </ButtonBuy>
            <ButtonHeart
              {...addSkeleton(styles.buttonHeart)}
              like={isFavourite}
              onClick={() => {
                setFavourites((prev) =>
                  prev.includes(String(product.id))
                    ? prev.filter((id) => id !== String(product.id))
                    : [...prev, String(product.id)],
                );
              }}
            ></ButtonHeart>
          </div>

          <div className={classNames(styles.details, styles.detailsMarginTop32)}>
            <div className={styles.detail}>
              <p {...addSkeleton(styles.detailText1)}>{t('productCart.screen')}</p>
              <p {...addSkeleton(classNames(styles.detailText2, styles.detailText2fontWeight700))}>
                {product.screen}
              </p>
            </div>
            <div className={styles.detail}>
              <p {...addSkeleton(styles.detailText1)}>{t('productCart.capacity')}</p>
              <p {...addSkeleton(classNames(styles.detailText2, styles.detailText2fontWeight700))}>
                {product.capacity}
              </p>
            </div>
            <div className={styles.detail}>
              <p {...addSkeleton(styles.detailText1)}>{t('productCart.RAM')}</p>
              <p {...addSkeleton(classNames(styles.detailText2, styles.detailText2fontWeight700))}>
                {product.ram}
              </p>
            </div>
            <div className={styles.detail}>
              <p {...addSkeleton(styles.detailText1)}>{t('productCart.processor')}</p>
              <p {...addSkeleton(classNames(styles.detailText2, styles.detailText2fontWeight700))}>
                {product[category]?.processor}
              </p>
            </div>
          </div>
        </div>
        <div className={styles.sections}>
          <section className={styles.sectionAbout} aria-label="About product">
            <h2 {...addSkeleton()}>{t('productDetails.about')}</h2>
            <div
              className={classNames(styles.line, styles.lineMarginBottom32, styles.lineMarginTop24)}
            ></div>
            <div className={styles.sectionAboutDescription}>
              {product.descriptions
                .filter((item) => item.lang === (i18n.resolvedLanguage === 'en' ? 'en' : 'ua'))
                .map((item) => {
                  return (
                    <div key={item.title}>
                      <h3 {...addSkeleton()}>{item.title}</h3>
                      <p {...addSkeleton()}>
                        {item.text.map((text, index) => {
                          if (index === item.text.length - 1) {
                            return text;
                          }
                          return (
                            <Fragment key={index}>
                              {text} <br /> <br />
                            </Fragment>
                          );
                        })}
                      </p>
                    </div>
                  );
                })}
            </div>
          </section>

          <section className={styles.sectionTechSpecs} aria-label="About product">
            <h2 {...addSkeleton()}>{t('productDetails.techSpecs')}</h2>
            <div
              className={classNames(styles.line, styles.lineMarginBottom32, styles.lineMarginTop24)}
            ></div>
            <div className={classNames(styles.details)}>
              <div className={styles.detail}>
                <p {...addSkeleton(classNames(styles.detailText1, styles.detailText1fontSize14))}>
                  {t('productCart.screen')}
                </p>
                <p {...addSkeleton(classNames(styles.detailText2, styles.detailText2fontSize14))}>
                  {product.screen}
                </p>
              </div>

              <div className={styles.detail}>
                <p {...addSkeleton(classNames(styles.detailText1, styles.detailText1fontSize14))}>
                  {t('productCart.resolution')}
                </p>
                <p {...addSkeleton(classNames(styles.detailText2, styles.detailText2fontSize14))}>
                  {product[category]?.resolution}
                </p>
              </div>
              <div className={styles.detail}>
                <p {...addSkeleton(classNames(styles.detailText1, styles.detailText1fontSize14))}>
                  {t('productCart.processor')}
                </p>
                <p {...addSkeleton(classNames(styles.detailText2, styles.detailText2fontSize14))}>
                  {product[category]?.processor}
                </p>
              </div>
              <div className={styles.detail}>
                <p {...addSkeleton(classNames(styles.detailText1, styles.detailText1fontSize14))}>
                  {t('productCart.RAM')}
                </p>
                <p {...addSkeleton(classNames(styles.detailText2, styles.detailText2fontSize14))}>
                  {product.ram}
                </p>
              </div>

              <div className={styles.detail}>
                <p {...addSkeleton(classNames(styles.detailText1, styles.detailText1fontSize14))}>
                  {t('productCart.builtInMemory')}
                </p>
                <p {...addSkeleton(classNames(styles.detailText2, styles.detailText2fontSize14))}>
                  {product.capacity}
                </p>
              </div>
              {!!product[category] && (
                <div className={styles.detail}>
                  <p {...addSkeleton(classNames(styles.detailText1, styles.detailText1fontSize14))}>
                    {t('productCart.camera')}
                  </p>
                  <p {...addSkeleton(classNames(styles.detailText2, styles.detailText2fontSize14))}>
                    {'camera' in product[category] ? (product[category].camera as string) : ''}
                  </p>
                </div>
              )}
              {!!product[category] && (
                <div className={styles.detail}>
                  <p {...addSkeleton(classNames(styles.detailText1, styles.detailText1fontSize14))}>
                    {t('productCart.zoom')}
                  </p>
                  <p {...addSkeleton(classNames(styles.detailText2, styles.detailText2fontSize14))}>
                    {'zoom' in product[category] ? (product[category].zoom as string) : ''}
                  </p>
                </div>
              )}

              <div className={styles.detail}>
                <p {...addSkeleton(classNames(styles.detailText1, styles.detailText1fontSize14))}>
                  {t('productCart.cell')}
                </p>
                <p {...addSkeleton(classNames(styles.detailText2, styles.detailText2fontSize14))}>
                  {product[category]?.cell.join(', ')}
                </p>
              </div>
            </div>
          </section>
        </div>
      </article>
    );
  };



  const productDetailsDefault = prepareProductDetails(
    defaultProductDetails.product,
    defaultProductDetails.productsByNamespace,
    defaultProductDetails.avalibleColors,
    defaultProductDetails.avalibleCapacity,
    true,
    'default',
  );

  const stateSwitch = () => {
    switch (state.status) {
      case 'loading':
        // return;
        return productDetailsDefault;

      case 'error':
        return (
          <div className={styles.containerNoGrid}>
            <h1>{state.error}</h1>

            <img
              className={styles.imageProductNotFound}
              src="./img/product-not-found.png"
              alt="Image product not found"
            />
          </div>
        );

      case 'success': {
        return (
          <>
            {prepareProductDetails(
              state.product,
              state.productsByNamespace,
              state.colorsAvailable,
              state.capacityAvailable,
              false,
              String(state.product.id),
            )}
            <SectionYouMayAlsoLike className={styles.sectionYouMayAlsoLike}></SectionYouMayAlsoLike>
          </>
        );
      }
    }
  };

  return (
    <div>
      <div className={styles.containerNoGrid}>
        <Breadcrumbs></Breadcrumbs>
        <ButtonBack></ButtonBack>
      </div>
      <div> {stateSwitch()}</div>
    </div>
  );
};
