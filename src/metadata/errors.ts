import { z } from "zod";

/**
 * An error that represents a parse error.
 */
export class ParseError extends AggregateError {
  readonly name = "ParseError";

  constructor(errors: z.ZodIssue[], message = "Parse error.") {
    super(errors, message);
  }
}
