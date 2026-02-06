import validateRequest from './validateRequest.ts';
import validateBody from './validateBody.ts';

const val = {
  req: validateRequest,
  bd: validateBody,
};

export default val;
