import { Formik, Form, Field } from 'formik';
import React from 'react';
import cn from 'classnames';
import { Link, useNavigate } from 'react-router-dom';
import { Fields } from '../types/Fields';
import { SubmitCallback } from '../types/SubmitCallback';
import {
  validateEmail,
  validateName,
  validatePassword,
} from '../../utils/validators';

type Props = {
  fields: Fields;
  onSubmit: SubmitCallback;
  formTitle?: string;
  cancelButton?: boolean;
  submitButtonName?: string;
  children?: React.ReactNode;
};

const inputParams = {
  name: {
    validator: validateName,
    placeholder: 'Alyona',
    icon: 'fa-solid fa-user',
  },
  password: {
    validator: validatePassword,
    placeholder: '******',
    icon: 'fa fa-lock',
  },
  email: {
    validator: validateEmail,
    placeholder: 'e.g. bobsmith@gmail.com',
    icon: 'fa fa-envelope',
  },
};

export const FormTemplate: React.FC<Props> = ({
  fields,
  onSubmit,
  formTitle,
  cancelButton = true,
  submitButtonName = 'Submit',
  children,
}) => {
  const navigate = useNavigate();

  return (
    <Formik
      initialValues={Object.fromEntries(
        Object.entries(fields).map(([name, field]) => [
          name,
          field.initialValue || '',
        ]),
      )}
      validateOnMount
      onSubmit={onSubmit}
    >
      {({ touched, errors, isSubmitting, isValid }) => (
        <Form className="box">
          {formTitle && <h1 className="title">{formTitle}</h1>}
          {Object.entries(fields).map(([name, field]) => {
            return (
              <div className="field" key={name}>
                <label htmlFor={name} className="label">
                  {field.label}
                </label>

                <div className="control has-icons-left has-icons-right">
                  <Field
                    validate={inputParams[field.type].validator}
                    name={name}
                    type={field.type}
                    id={name}
                    placeholder={inputParams[field.type].placeholder}
                    className={cn('input', {
                      'is-danger': touched[name] && errors[name],
                    })}
                  />

                  <span className="icon is-small is-left">
                    <i className={inputParams[field.type].icon}></i>
                  </span>

                  {touched[name] && errors[name] && (
                    <span className="icon is-small is-right has-text-danger">
                      <i className="fas fa-exclamation-triangle"></i>
                    </span>
                  )}
                </div>

                {touched[name] && errors[name] && (
                  <p className="help is-danger">{errors[name]}</p>
                )}

                {field.label === 'Password' && formTitle !== 'Sign up' && (
                  <Link to="/reset-password/" className="forgot-link help">
                    Forgot password?
                  </Link>
                )}
              </div>
            );
          })}

          <div className="field buttons">
            <button
              type="submit"
              className={cn('button is-success has-text-weight-bold', {
                'is-loading': isSubmitting,
              })}
              disabled={isSubmitting || !isValid}
            >
              {submitButtonName}
            </button>

            {cancelButton && (
              <button className="button" onClick={() => navigate(-1)}>
                Cancel
              </button>
            )}
          </div>
          {children}
        </Form>
      )}
    </Formik>
  );
};
