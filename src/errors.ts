import type { ContentFormat } from "./types";

/** An error for deferred content. */
export class DeferredContentError extends Error {
  readonly name = "DeferredContentError";
  /** The source of the deferred content. */
  readonly src: string;
  /** The format of the deferred content. */
  readonly format: ContentFormat;

  constructor(
    src: string,
    format: ContentFormat,
    message = "Error loading deferred content.",
  ) {
    super(message);
    this.src = src;
    this.format = format;
  }
}
