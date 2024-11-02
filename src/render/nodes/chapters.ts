import type { Step } from "../../pipeline";
import type { ChapterNode } from "../../types";
import { setAtPath } from "../../helpers";
import {
  IncludeError,
  type Locked,
  makeIncluder,
  pathSep,
  type RenderContext,
  RenderError,
  type RenderStep,
  type RenderView,
  type TransformFilename,
} from "../render";
import { createRenderer } from "../renderers/mustache";

/** Options for rendering chapters. */
export interface RenderChapterOptions {
  /** The path of the template for rendering chapters. */
  templatePath: string;
  /** Transform the filename of a chapter. */
  transformFilename?: TransformFilename<ChapterNode>;
}

/**
 * Make a render step for rendering chapters.
 */
export function makeRenderChaptersStep(
  { templatePath, transformFilename }: RenderChapterOptions,
): RenderStep<Locked<RenderContext>> {
  const renderStep: Step<RenderContext> = async function renderChapters(ctx) {
    const { view, templates, structure, log } = ctx;
    const template = templates[templatePath];

    if (!template) {
      const error = new IncludeError(
        templatePath,
        `Template not found: ${templatePath}`,
      );

      log.error(`[chapters] ${error.message}`, { error });
      throw error;
    }

    // Create a renderer for the template.
    type ChapterView = { chapter: ChapterNode };
    const render = createRenderer<RenderView & ChapterView>(
      template,
      {
        filename: templatePath,
        includer: makeIncluder(ctx),
      },
    );

    // Order chapters so they are rendered in the correct order.
    const chapters = [...view.chapters].sort((a, b) => a.order - b.order);

    // Render each chapter.
    for (let i = 1; i <= chapters.length; i++) {
      const chapter = chapters[i];

      try {
        const content = await render({ ...view, chapter });
        const filename = transformFilename?.(chapter, i) ??
          `OEBS/chapter-${i}.xhtml`;

        // Set the rendered content in the structure.
        setAtPath(structure, filename, content, pathSep);

        i++;
      } catch (err) {
        const error = new RenderError(
          [err],
          renderStep as RenderStep<RenderContext>,
          `Failed to render chapter: ${chapter.title} (${i})`,
        );

        log.error(`[chapters] ${error.message}`, { error });
        throw err;
      }
    }

    // Log the number of chapters rendered.
    log.info(`[chapters] Rendered ${chapters.length} chapters.`, { chapters });
  };

  // Set the filename of the template - useful for debugging.
  (renderStep as any).filename = templatePath;

  return renderStep as RenderStep<Locked<RenderContext>>;
}
