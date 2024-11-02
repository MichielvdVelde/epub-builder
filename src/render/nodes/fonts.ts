import type { Step } from "../../pipeline";
import { getContent, setAtPath } from "../../helpers";
import { ContentFormat, type FontNode } from "../../types";
import {
  type Locked,
  pathSep,
  type RenderContext,
  type TransformFilename,
} from "../render";

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
): Step<Locked<RenderContext>> {
  const renderStep: Step<RenderContext> = async function renderFonts(ctx) {
    const { view, structure, log } = ctx;
    const { fonts } = view;

    if (!fonts.length) {
      // No fonts to render.
      log.info("[fonts] No fonts to render.");
      return;
    }

    for (let i = 0; i < fonts.length; i++) {
      const font = fonts[i];

      try {
        // Get the content of the font.
        const content = await getContent(font, ContentFormat.ArrayBuffer);

        // Add the font to the structure.
        const filename = options?.transformFilename?.(font, i) ??
          `OEBPS/fonts/${font.name}`;
        setAtPath(structure, filename, content, pathSep);
      } catch (err) {
        const error = new AggregateError(
          [err],
          `Failed to render font: ${font.name}`,
        );

        log.error(`[fonts] ${error.message}`, { error });
        throw error;
      }
    }

    // Log the number of fonts rendered.
    log.info(`[fonts] Rendered ${fonts.length} fonts.`, { fonts });
  };

  return renderStep as Step<Locked<RenderContext>>;
}
