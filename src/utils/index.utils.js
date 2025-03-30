import { CONFIDENTIAL_FIELDS } from './constants.utils.js';
import normalize from './normalize.utils.js';
import pagination from './pagination.utils.js';

const utils = {
  normalize: (data, fields) => normalize(data, fields),
  CONFIDENTIAL_FIELDS,
  pagination: (query, items) => pagination(query, items),
};

export default utils;
