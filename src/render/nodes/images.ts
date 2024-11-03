import type {
  Locked,
  RenderContext,
  RenderStep,
  TransformFilename,
} from "../types";
import type { Step } from "../../pipeline";
import { getContent, setAtPath } from "../../helpers";
import { ContentFormat, type ImageNode } from "../../types";
import { pathSep } from "../helpers";

/** Options for rendering images. */
export interface RenderImageOptions {
  /** Transform the filename of a image. */
  transformFilename?: TransformFilename<ImageNode>;
}

/**
 * Make a render step for rendering images.
 * @param options The options for rendering images.
 * @param options.transformFilename A function to transform the filename of a image.
 */
export function makeRenderImages(
  options?: RenderImageOptions,
): RenderStep<Locked<RenderContext>> {
  const renderStep: Step<RenderContext> = async function renderFonts(ctx) {
    const { view, structure, log } = ctx;
    const { images } = view;

    if (!images.length) {
      // No images to render.
      log.info("[images] No images to render.");
      return;
    }

    for (let i = 0; i < images.length; i++) {
      const image = images[i];

      try {
        const content = await getContent(image, ContentFormat.ArrayBuffer);
        const filename = options?.transformFilename?.(image, i) ??
          `OEBPS/images/${image.name}`;

        // Add the image to the structure.
        setAtPath(structure, filename, content, pathSep);
      } catch (err) {
        const error = new AggregateError(
          [err],
          `Failed to render image: ${image.name}`,
        );

        log.error(`[images] ${error.message}`, { error });
        throw error;
      }
    }

    // Log the number of images rendered.
    log.info(`[images] Rendered ${images.length} images.`, { images });
  };

  return renderStep as RenderStep<Locked<RenderContext>>;
}
