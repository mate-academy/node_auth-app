import React from 'react';

import styles from './styles.module.scss';
import { useAuthContext } from '@/app/providers/Auth/AuthContext';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { ButtonBuy } from '@/components/ButtonBuy/ButtonBuy';
import { Icon } from '@/components/Icon';
import { apiProfile } from '@/api/profile';
import { useNotification } from './components/useNotification';
import { validation } from '@/shared/validation';
import { submitWithBackendErrors } from './helpers/submitWithBackendErrors';
import { useTranslation } from 'react-i18next';

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout, checkAuth } = useAuthContext();

  const [nameNotification, setNameNotification] = useNotification();
  const [passwordNotification, setPasswordNotification] = useNotification();
  const [emailNotification, setEmailNotification] = useNotification();

  if (!user) {
    return;
  }

  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>{t('profilePage.title')}</h2>
        <p>{t('profilePage.paragraph')}</p>

        <div className={styles.formContainer}>
          <div className={styles.colomn1}>
            <Formik
              initialValues={{ firstName: user.firstName, lastName: user.lastName }}
              validateOnBlur={true}
              validateOnChange={false}
              validateOnMount={true}
              onSubmit={(values, formHelper) => {
                submitWithBackendErrors({
                  values,
                  request: apiProfile.changeName,
                  formHelper,
                  setNotification: setNameNotification,
                  onSuccess: () => {
                    checkAuth();
                  },
                });
              }}
            >
              {({ values, isSubmitting }) => {
                return (
                  <Form noValidate className={styles.form} action="">
                    <div className={styles.formInfo}>
                      <h3>{t('profilePage.formAccount.title')}</h3>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="account:firstName">
                        {t('profilePage.formAccount.fields.firstName')}
                      </label>
                      <Field
                        validate={validation.validateName}
                        type="text"
                        name="firstName"
                        id="account:firstName"
                        className={styles.input}
                      />
                      <ErrorMessage
                        name="firstName"
                        component="div"
                        className={styles.fieldError}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="account:lastName">
                        {t('profilePage.formAccount.fields.lastName')}
                      </label>
                      <Field
                        validate={validation.validateName}
                        type="text"
                        name="lastName"
                        id="account:lastName"
                        className={styles.input}
                      />
                      <ErrorMessage name="lastName" component="div" className={styles.fieldError} />
                    </div>

                    {nameNotification.error && (
                      <div className={styles.errorNotification}>{nameNotification.error}</div>
                    )}
                    {nameNotification.success && (
                      <div className={styles.successNotification}>{nameNotification.success}</div>
                    )}

                    <ButtonBuy
                      disabled={
                        values.firstName === user.firstName && values.lastName === user.lastName
                      }
                      isLoading={isSubmitting}
                      type="submit"
                      className={styles.button}
                      selected={false}
                      style={{ animation: 'none' }}
                    >
                      {t('profilePage.formAccount.button')}
                    </ButtonBuy>
                  </Form>
                );
              }}
            </Formik>

            <Formik
              validateOnBlur={true}
              validateOnChange={false}
              validateOnMount={true}
              initialValues={{ currentPassword: '', newEmail: '' }}
              onSubmit={(values, formHelper) => {
                submitWithBackendErrors({
                  values: { newEmail: values.newEmail, password: values.currentPassword },
                  request: apiProfile.changeEmail,
                  formHelper,
                  setNotification: setEmailNotification,
                  onSuccess: () => {
                    checkAuth();
                  },
                });
              }}
            >
              {({ isSubmitting }) => {
                return (
                  <Form noValidate className={styles.form} action="">
                    <div className={styles.formInfo}>
                      <h3>{t('profilePage.formChangeEmail.title')}</h3>
                      <p>{t('profilePage.formChangeEmail.paragraph')}</p>
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="changeEmailCurrentPassword">
                        {t('profilePage.formChangeEmail.fields.currentPassword.label')}
                      </label>
                      <Field
                        type="password"
                        name="currentPassword"
                        id="changeEmailCurrentPassword"
                        placeholder={t(
                          'profilePage.formChangeEmail.fields.currentPassword.placeholder',
                        )}
                        validate={validation.validatePassword}
                        className={styles.input}
                      />
                      <ErrorMessage
                        name="currentPassword"
                        component="div"
                        className={styles.fieldError}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="changeEmailnewEmail">
                        {t('profilePage.formChangeEmail.fields.newEmail.label')}
                      </label>
                      <Field
                        type="email"
                        name="newEmail"
                        id="changeEmailnewEmail"
                        placeholder={t('profilePage.formChangeEmail.fields.newEmail.placeholder')}
                        validate={validation.validateEmail}
                        className={styles.input}
                      />
                      <ErrorMessage name="newEmail" component="div" className={styles.fieldError} />
                    </div>

                    {emailNotification.error && (
                      <div className={styles.errorNotification}>{emailNotification.error}</div>
                    )}
                    {emailNotification.success && (
                      <div className={styles.successNotification}>{emailNotification.success}</div>
                    )}
                    <div className={styles.warning}>
                      <Icon className={styles.iconWarning} type="warning"></Icon>
                      {t('profilePage.formChangeEmail.warning')}
                    </div>

                    <ButtonBuy
                      isLoading={isSubmitting}
                      type="submit"
                      className={styles.button}
                      selected={false}
                      style={{ animation: 'none' }}
                    >
                      {t('profilePage.formChangeEmail.button')}
                    </ButtonBuy>
                  </Form>
                );
              }}
            </Formik>
          </div>

          <div className={styles.colomn2}>
            <Formik
              onSubmit={(values, formHelper) => {
                if (values.newPassword !== values.confirmNewPassword) {
                  formHelper.setErrors({
                    confirmNewPassword: 'Confirm new password is not correct',
                  });
                  formHelper.setSubmitting(false);
                  return;
                }

                if (values.currentPassword === values.newPassword) {
                  formHelper.setErrors({
                    newPassword: 'New password must be different from current password',
                  });
                  formHelper.setSubmitting(false);
                  return;
                }

                submitWithBackendErrors({
                  values: values,
                  request: apiProfile.changePassword,
                  formHelper,
                  setNotification: setPasswordNotification,
                  onSuccess: () => {
                    checkAuth();
                  },
                });
              }}
              initialValues={{ currentPassword: '', newPassword: '', confirmNewPassword: '' }}
            >
              {({ isSubmitting }) => {
                return (
                  <Form noValidate className={styles.form} action="">
                    <div className={styles.formInfo}>
                      <h3>{t('profilePage.formChangePassword.title')}</h3>
                      <p>{t('profilePage.formChangePassword.paragraph')}</p>
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="changePasswordCurrentPassword">
                        {t('profilePage.formChangePassword.fields.currentPassword.label')}
                      </label>
                      <Field
                        validate={validation.validatePassword}
                        type="password"
                        name="currentPassword"
                        id="changePasswordCurrentPassword"
                        placeholder={t(
                          'profilePage.formChangePassword.fields.currentPassword.placeholder',
                        )}
                        className={styles.input}
                      />
                      <ErrorMessage
                        name="currentPassword"
                        component="div"
                        className={styles.fieldError}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="changePasswordNewPassword">
                        {t('profilePage.formChangePassword.fields.newPassword.label')}
                      </label>
                      <Field
                        validate={validation.validatePassword}
                        type="password"
                        name="newPassword"
                        id="changePasswordNewPassword"
                        placeholder={t(
                          'profilePage.formChangePassword.fields.newPassword.placeholder',
                        )}
                        className={styles.input}
                      />
                      <ErrorMessage
                        name="newPassword"
                        component="div"
                        className={styles.fieldError}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="changePasswordConfirmNewPassword">
                        {t('profilePage.formChangePassword.fields.confirmNewPassword.label')}
                      </label>
                      <Field
                        validate={validation.validatePassword}
                        type="password"
                        name="confirmNewPassword"
                        id="changePasswordConfirmNewPassword"
                        placeholder={t(
                          'profilePage.formChangePassword.fields.confirmNewPassword.placeholder',
                        )}
                        className={styles.input}
                      />
                      <ErrorMessage
                        name="confirmNewPassword"
                        component="div"
                        className={styles.fieldError}
                      />
                    </div>
                    {passwordNotification.error && (
                      <div className={styles.errorNotification}>{passwordNotification.error}</div>
                    )}
                    {passwordNotification.success && (
                      <div className={styles.successNotification}>
                        {passwordNotification.success}
                      </div>
                    )}

                    <ButtonBuy
                      type="submit"
                      isLoading={isSubmitting}
                      className={styles.button}
                      selected={false}
                      style={{ animation: 'none' }}
                    >
                      {t('profilePage.formChangePassword.button')}
                    </ButtonBuy>
                  </Form>
                );
              }}
            </Formik>
            <div className={styles.form}>
              <div className={styles.formInfo}>
                <h3>{t('profilePage.accountLogout.title')}</h3>
                <p>{t('profilePage.accountLogout.paragraph')}</p>
              </div>

              <button className={styles.buttonLogout} onClick={() => logout()}>
                {t('profilePage.accountLogout.button')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
