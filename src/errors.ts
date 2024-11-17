import type { ContentFormat, ContentSource } from "./types";

/** An error for deferred content. */
export class DeferredContentError<Format extends ContentFormat> extends Error {
  readonly name = "DeferredContentError";
  /** The source of the deferred content. */
  readonly src: ContentSource<Format>;

  constructor(
    source: ContentSource<Format>,
    message = "Error loading deferred content.",
  ) {
    super(message);
    this.src = source;
  }
}
