import type {
  Locked,
  RenderContext,
  RenderStep,
  TransformFilename,
} from "../types";
import type { Step } from "../../pipeline";
import { getContent, setAtPath } from "../../helpers";
import { ContentFormat, type FontNode } from "../../types";
import { pathSep } from "../helpers";

/** Options for rendering fonts. */
export interface RenderFontOptions {
  /** Transform the filename of a font. */
  transformFilename?: TransformFilename<FontNode>;
}

/**
 * Make a render step for rendering fonts.
 * @param options The options for rendering fonts.
 * @param options.transformFilename A function to transform the filename of a font.
 */
export function makeRenderFonts(
  options?: RenderFontOptions,
): RenderStep<Locked<RenderContext>> {
  const renderStep: Step<RenderContext> = async function renderFonts(ctx) {
    const { view, structure, log: baseLog } = ctx;
    const log = baseLog.namespace("fonts");
    const { fonts } = view;

    if (!fonts.length) {
      // No fonts to render.
      log.info("No fonts to render.");
      return;
    }

    for (let i = 0; i < fonts.length; i++) {
      const font = fonts[i];

      try {
        const content = await getContent(font, ContentFormat.ArrayBuffer);
        const filename = options?.transformFilename?.(font, i) ??
          `OEBPS/fonts/${font.name}`;

        // Add the font to the structure.
        setAtPath(structure, filename, content, pathSep);
      } catch (err) {
        const error = new AggregateError(
          [err],
          `Failed to render font: ${font.name}`,
        );

        log.error(error.message, { error });
        throw error;
      }
    }

    // Log the number of fonts rendered.
    log.info(`Rendered ${fonts.length} fonts.`, { fonts });
  };

  return renderStep as RenderStep<Locked<RenderContext>>;
}
