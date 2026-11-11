/**
 * Middleware genérico para validación de datos de entrada con esquemas Zod (RNF-08).
 * Valida de forma inmutable req.body, req.params o req.query.
 *
 * @param {import('zod').ZodSchema} schema - Esquema Zod
 * @param {'body'|'params'|'query'} [target='body'] - Propiedad del objeto request a validar
 */
export function validateRequest(schema, target = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const formattedErrors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Error de validación en los datos enviados.',
        errors: formattedErrors
      });
    }

    // Reemplaza con los datos saneados y tipados por Zod
    req[target] = result.data;
    next();
  };
}
