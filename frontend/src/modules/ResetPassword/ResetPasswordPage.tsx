import React, { useState } from 'react';

import styles from './styles.module.scss';
import { ButtonThird } from '@/components/ButtonThird/ButtonThird';
import { authService } from '@/http/authClient';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { Loading } from '@/components/Loading/Loading';
import { validation } from '@/shared/validation';
import { usePageError } from '../hooks/useErrorPage';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const ResetPasswordPage: React.FC = () => {
  const params = useParams();
  const { t } = useTranslation();

  const token = params.token || '';

  const [successSumbit, setSuccessSumbit] = useState(false);
  const [pageError, setPageError] = usePageError('');

  if (successSumbit) {
    return (
      <main className={styles.container}>
        <div className={styles.box}>
          <h3>{t('resetPasswordPage.success')}</h3>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.box}>
        <h1>{t('resetPasswordPage.title')}</h1>
        <Formik
          validateOnBlur={false}
          validateOnChange={false}
          validateOnMount={true}
          initialValues={{ newPassword: '', newPasswordConfirm: '' }}
          onSubmit={(values, formHelper) => {
            formHelper.setSubmitting(true);

            authService
              .resetPassword(values.newPassword, values.newPasswordConfirm, token)
              .then(() => setSuccessSumbit(true))
              .catch((errorFromBackend) => {
                if (errorFromBackend.message) {
                  setPageError(errorFromBackend.message);
                }

                if (!errorFromBackend.response?.data) {
                  return;
                }

                const { errors, message } = errorFromBackend.response.data;

                if (errors) {
                  for (const errorEntity of Object.entries(errors)) {
                    formHelper.setFieldError(errorEntity[0], errorEntity[1] as string);
                  }
                }

                if (message) {
                  setPageError(message);
                }
              })
              .finally(() => {
                formHelper.setSubmitting(false);
              });
          }}
        >
          {({ setFieldError, handleChange, isSubmitting }) => {
            return (
              <Form noValidate className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="resetNewPassword">
                    {t('resetPasswordPage.fields.newPassword.label')}
                  </label>
                  <Field
                    type="password"
                    validate={validation.validatePassword}
                    name={'newPassword'}
                    id={'resetNewPassword'}
                    placeholder={t('resetPasswordPage.fields.newPassword.placeholder')}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e: React.ChangeEvent<any>) => {
                      handleChange(e);
                      setFieldError('newPassword', undefined);
                    }}
                    className={styles.input}
                  />
                  <ErrorMessage
                    name={'newPassword'}
                    component="div"
                    className={styles.fieldError}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="resetNewPasswordConfirm">
                    placeholder={t('resetPasswordPage.fields.confirmNewPassword.label')}
                  </label>
                  <Field
                    type="password"
                    validate={validation.validatePassword}
                    name={'newPasswordConfirm'}
                    id={'resetNewPasswordConfirm'}
                    placeholder={t('resetPasswordPage.fields.confirmNewPassword.placeholder')}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e: React.ChangeEvent<any>) => {
                      handleChange(e);
                      setFieldError('newPasswordConfirm', undefined);
                    }}
                    className={styles.input}
                  />
                  <ErrorMessage
                    name={'newPasswordConfirm'}
                    component="div"
                    className={styles.fieldError}
                  />
                </div>

                <ButtonThird disabled={isSubmitting} type="submit" className={styles.button}>
                  {isSubmitting ? <Loading width={32} height={32}></Loading> : 'Reset password'}
                </ButtonThird>
              </Form>
            );
          }}
        </Formik>
        {pageError && <p className={styles.fieldError}>{pageError}</p>}
      </div>
    </main>
  );
};
