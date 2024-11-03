import type {
  CreateRenderer,
  Locked,
  RenderContext,
  RenderStep,
  RenderView,
  TransformFilename,
  TransformView,
} from "../types";
import type { Step } from "../../pipeline";
import type { ChapterNode } from "../../types";
import { setAtPath } from "../../helpers";
import { getRenderView, makeIncluder, pathSep } from "../helpers";
import { IncludeError, RenderError } from "../errors";

/** Options for rendering chapters. */
export interface RenderChapterOptions<View> {
  /** Create a renderer for the template. */
  createRenderer: CreateRenderer<View>;
  /** Transform the filename of a chapter. */
  transformFilename?: TransformFilename<ChapterNode>;
  /** Transform the view for rendering. */
  transformView?: TransformView<View, ChapterNode>;
}

/**
 * Make a render step for rendering chapters. This step renders each chapter in
 * the view using the specified template.
 * @template View The type of the view.
 * @param path The path to the template.
 * @param options The options for rendering chapters.
 */
export function makeRenderChapters<View = RenderView>(
  path: string,
  options: RenderChapterOptions<View>,
): RenderStep<Locked<RenderContext>> {
  const { createRenderer } = options;
  const transformFilename = options.transformFilename;
  const transformView = options.transformView;

  const renderStep: Step<RenderContext> = async function renderChapters(ctx) {
    const { view, templates, structure, log } = ctx;
    const template = templates[path];
    let chapterCount = 0;

    if (!template) {
      const error = new IncludeError(
        path,
        `Template not found: ${path}`,
      );

      log.error(`[chapters] ${error.message}`, { error });
      throw error;
    }

    // Create a renderer for the template.
    const render = createRenderer(
      template,
      {
        filename: path,
        includer: makeIncluder(ctx),
      },
    );

    const renderChapter = async (
      chapter: ChapterNode,
      i: number,
      depth = 0,
    ) => {
      // Get the render view from the context.
      const renderView = getRenderView(ctx, chapter, transformView);

      try {
        const content = await render(renderView);
        const filename = transformFilename?.(chapter, i) ??
            depth > 0
          ? `OEBS/chapter-${depth + 1}-${i}.xhtml`
          : `OEBS/chapter-${i}.xhtml`;

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

      if (chapter.children?.length) {
        // Order children so they are rendered in the correct order.
        const children = [...chapter.children].sort(sortChapters);

        // Render each child chapter.
        for (let j = 1; j <= children.length; j++) {
          chapterCount++;
          const child = children[j];

          // Render the child chapter.
          await renderChapter(child, j, depth + 1);
        }
      }

      // Order chapters so they are rendered in the correct order.
      const chapters = [...view.chapters].sort(sortChapters);

      // Render each chapter.
      for (let i = 1; i <= chapters.length; i++) {
        chapterCount++;
        const chapter = chapters[i];

        // Render the chapter.
        await renderChapter(chapter, i);
      }
    };

    // Render each chapter.
    for (let i = 1; i <= view.chapters.length; i++) {
      chapterCount++;
      const chapter = view.chapters[i];

      // Render the chapter.
      await renderChapter(chapter, i);
    }

    // Log the number of chapters rendered.
    log.info(`[chapters] Rendered ${chapterCount} chapters.`, {
      chapters: ctx.view.chapters,
      count: chapterCount,
    });
  };

  // Set the filename of the template - useful for debugging.
  (renderStep as RenderStep<Locked<RenderContext>>).filename = path;

  return renderStep as RenderStep<Locked<RenderContext>>;
}

const sortChapters = (a: ChapterNode, b: ChapterNode) => a.order - b.order;
