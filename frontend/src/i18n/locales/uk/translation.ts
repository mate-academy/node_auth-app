export const uk = {
  productCart: {
    screen: 'Екран',
    capacity: 'Памʼять',
    RAM: 'ОЗП',
    button: 'Додати в кошик',
    buttonSelected: 'Додано',
    processor: 'Процесор',
    resolution: 'Роздільна здатність',
    builtInMemory: 'Вбудована памʼять',
    camera: 'Камера',
    zoom: 'Зум',
    cell: 'Мережа',
  },

  authPage: {
    login: {
      title: 'Увійти',
      buttonText: 'Увійти',
      fields: {
        email: 'Електронна пошта',
        password: 'Пароль',
      },
    },

    register: {
      title: 'Зареєструватися',
      buttonText: 'Зареєструватися',
      fields: {
        firstName: 'Ім’я',
        lastName: 'Прізвище',
        email: 'Електронна пошта',
        password: 'Пароль',
      },
    },

    forget: {
      title: 'Відновлення пароля',
      buttonText: 'Надіслати посилання для відновлення',
      fields: {
        email: 'Електронна пошта',
      },
    },

    links: {
      register: 'Немає облікового запису? Зареєструватися',
      forget: 'Забули пароль?',
      login: 'Вже маєте обліковий запис? Увійти',
    },

    successSubmitRegister:
      'На вашу електронну адресу надіслано лист для активації облікового запису.',
    successSubmitForget:
      'На вашу електронну адресу надіслано лист із посиланням для відновлення пароля.',
  },

  profilePage: {
    title: 'Профіль',
    paragraph: 'Керуйте особистою інформацією та налаштуваннями облікового запису',

    formAccount: {
      title: 'Інформація про обліковий запис',

      fields: {
        firstName: 'Ім’я',
        lastName: 'Прізвище',
      },

      button: 'Зберегти зміни',
    },

    formChangePassword: {
      title: 'Зміна пароля',
      paragraph: 'Виберіть надійний пароль, щоб захистити свій обліковий запис.',

      fields: {
        currentPassword: {
          label: 'Поточний пароль',
          placeholder: 'Введіть поточний пароль',
        },

        newPassword: {
          label: 'Новий пароль',
          placeholder: 'Введіть новий пароль',
        },

        confirmNewPassword: {
          label: 'Підтвердження нового пароля',
          placeholder: 'Повторно введіть новий пароль',
        },
      },

      button: 'Оновити пароль',
    },

    formChangeEmail: {
      title: 'Зміна електронної пошти',
      paragraph: 'Щоб змінити електронну пошту, введіть свій пароль і підтвердьте нову адресу.',

      fields: {
        currentPassword: {
          label: 'Поточний пароль',
          placeholder: 'Введіть поточний пароль',
        },

        newEmail: {
          label: 'Нова електронна пошта',
          placeholder: 'Введіть нову адресу електронної пошти',
        },
      },

      warning: 'Посилання для підтвердження буде надіслано на вашу нову електронну адресу.',

      button: 'Надіслати лист для підтвердження',
    },

    accountLogout: {
      title: 'Обліковий запис',
      paragraph: 'Вийдіть зі свого облікового запису на цьому пристрої.',

      button: 'Вийти',
    },
  },

  HomeTitle: {
    welcome: 'Ласкаво просимо до магазину Nice Gadgets!',
    hotPrice: 'Гарячі пропозиції',
    newBrand: 'Нові моделі',
  },

  productPage: {
    mobileTitle: 'Мобільні телефони',
    tabletsTitle: 'Планшети',
    accessoriesTitle: 'Аксесуари',
    models: 'моделей',
    sortByTitle: 'Сортувати за',
    sortBy: {
      newest: 'Новинками',
      alphabetically: 'Алфавітом',
      cheapest: 'Найдешевшими',
    },
    itemsOnPageTitle: 'Товарів на сторінці',
    search: 'Пошук',
  },

  buttonBack: 'Назад',

  errors: { ProductDontFound: 'Product was not found', pageNotFound: 'Сторінку не знайдено' },

  productDetails: {
    availableColors: 'Доступні кольори',
    selectCapacity: 'Оберіть памʼять',
    about: 'Про товар',
    techSpecs: 'Технічні характеристики',
  },

  AreNoProductsYet: 'Поки що немає товарів',

  favouritesPage: {
    favouritesTitle: 'Обране',
    empty: 'Ваш список обраного порожній',
    addYourFirstProduct: 'Додайте свій перший товар до списку бажань',
  },

  sectionYouMayAlsoLike: 'Вам також може сподобатися',

  cart: {
    cart: 'Кошик',
    checkout: 'Оформити замовлення',
    total: 'Всього',
    isEmpty: 'Ваш кошик порожній',
    isEmptyParagraph: 'Додайте свій перший товар до кошика',
  },

  sectionCategories: {
    title: 'Покупки за категоріями',
    modile: 'Телефони',
    tablets: 'Планшети',
    accessories: 'Аксесуари',
    models: 'моделей',
    model: 'модель',
    items: 'товарів',
    item: 'товар',
  },

  footer: {
    backToTop: 'Повернутись нагору',
    contacts: 'Контакти',
    right: 'Права',
  },

  navigation: {
    favourites: 'Обране',
    home: 'Головна',
    phones: 'Телефони',
    tablets: 'Планшети',
    accessories: 'Аксесуари',
    cart: 'Кошик',
  },
  banners: {
    phone: {
      title: 'Тепер доступно <0/> у нашому магазині!',
      p: 'Будь першим!',
      button: 'Замовити зараз',
    },

    tablets: {
      title: 'Нові планшети вже тут!',
      p: 'Продуктивність без обмежень!',
      button: 'Купити',
    },

    accessories: {
      title: 'Доповни свій комплект!',
      p: 'Усе, що тобі потрібно!',
      button: 'Дивитися більше',
    },
  },
} as const;

export default uk;
