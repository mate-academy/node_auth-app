/**
 *  @param {import("../utils/types").TyFuncController} action
 * @returns {import("../utils/types").TyFuncController} */
export function catchError(action) {
  return async(req, res, next) => {
    try {
      await action(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
