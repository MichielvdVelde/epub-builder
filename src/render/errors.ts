import { RenderContext, RenderStep } from "./types";

/**
 * An error that occurred during including a template.
 */
export class IncludeError extends Error {
  readonly name = "IncludeError";
  /** The path of the template that failed to include. */
  readonly path: string;

  constructor(path: string, message = `Failed to include template: ${path}`) {
    super(message);
    this.path = path;
  }
}

/**
 * An error that occurred during rendering.
 */
export class RenderError extends AggregateError {
  readonly name = "RenderError";
  /** The render function that failed. */
  readonly fn: RenderStep<RenderContext>;

  constructor(
    errors: unknown[],
    fn: RenderStep<RenderContext>,
    message = `Failed to render template: ${fn.filename}`,
  ) {
    super(errors, message);
    this.fn = fn;
  }
}
