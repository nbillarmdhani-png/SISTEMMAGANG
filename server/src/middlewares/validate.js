// src/middlewares/validate.js
/**
 * Middleware validasi request body/query menggunakan Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(result.error); // ZodError → ditangkap errorHandler
    }
    req[source] = result.data; // Gunakan data yang sudah di-parse/strip
    next();
  };
}
