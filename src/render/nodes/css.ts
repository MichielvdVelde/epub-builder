import type {
  Locked,
  RenderContext,
  RenderStep,
  TransformFilename,
} from "../types";
import type { Step } from "../../pipeline";
import { getContent, setAtPath } from "../../helpers";
import { ContentFormat, type CssNode } from "../../types";
import { pathSep } from "../helpers";

/** Options for rendering CSS. */
export interface RenderCssOptions {
  /** Transform the filename of the cSS. */
  transformFilename?: TransformFilename<CssNode>;
}

/**
 * Make a render step for rendering CSS.
 * @param options The options for rendering CSS.
 * @param options.transformFilename A function to transform the filename of a CSS.
 */
export function makeRenderCss(
  options?: RenderCssOptions,
): RenderStep<Locked<RenderContext>> {
  const renderStep: Step<RenderContext> = async function renderCss(ctx) {
    const { view, structure, log: baseLog } = ctx;
    const log = baseLog.namespace("css");
    const { css } = view;

    if (!css.length) {
      // No css to render.
      log.info("No CSS to render.");
      return;
    }

    for (let i = 0; i < css.length; i++) {
      const node = css[i];

      try {
        const content = await getContent(node, ContentFormat.Text);
        const filename = options?.transformFilename?.(node, i) ??
          `OEBPS/css/${node.name ?? `style-${i}`}.css`;

        // Add the CSS to the structure.
        setAtPath(structure, filename, content, pathSep);
      } catch (err) {
        const error = new AggregateError(
          [err],
          `Failed to render CSS: ${node.name}`,
        );

        log.error(error.message, { error });
        throw error;
      }
    }

    // Log the number of css files rendered.
    log.info(`Rendered ${css.length} CSS files.`, { css });
  };

  return renderStep as RenderStep<Locked<RenderContext>>;
}
