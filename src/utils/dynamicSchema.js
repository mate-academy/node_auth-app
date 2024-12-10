import Joi from 'joi';

export const dynamicSchema = (keys, defaultSchema) => {
  return Joi.object(
    keys.reduce((schema, key) => {
      if (defaultSchema.describe().keys[key]) {
        schema[key] = defaultSchema.extract(key);
      }

      return schema;
    }, {}),
  );
};
