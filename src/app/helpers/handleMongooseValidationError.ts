/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZodError } from 'zod'
import { TErrorSources, TGenericErrorResponse } from '../interfaces/error.types'

export const handleZodValidationError = (
	err: ZodError,
): TGenericErrorResponse => {
	const errorSources: TErrorSources[] = err.issues.map((issue) => ({
		path:
			issue.path.length > 0
				? `${issue.path.slice().reverse().join(' inside ')} is required ❌`
				: 'Validation failed ❌',
		message: issue.message,
	}))

	return {
		statusCode: 400,
		message: 'Zod Error Occurred ❌',
		errorSources,
	}
}
