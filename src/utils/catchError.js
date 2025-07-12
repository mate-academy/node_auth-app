export const catchError = (middleware) => {
    return async (req, res, next) => {
        try {
            await middleware(req, res, next);
        } catch (error) {
            console.error(`Error in middleware: ${error.message}`);
            res.status(500).send(error);
        }
    }
}
