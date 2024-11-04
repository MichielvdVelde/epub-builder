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

/** A node with an order. */
export type Ordered = { order: number };

/** Sort nodes by order. */
const sortOrdered = (a: Ordered, b: Ordered) => a.order - b.order;

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
    const { view, templates, structure, log: baseLog } = ctx;
    const log = baseLog.namespace("chapters");
    const template = templates[path];

    if (!template) {
      const error = new IncludeError(
        path,
        `Template not found: ${path}`,
      );

      log.error(error.message, { error });
      throw error;
    }

    if (!view.chapters.length) {
      log.warn(`No chapters found in view.`, { view });
      return;
    }

    // Create a renderer for the template.
    const render = createRenderer(template, {
      filename: path,
      includer: makeIncluder(ctx),
    });

    let chapterCount = 0;

    /** Render the given chapters. */
    const renderChapters = async (chapters: ChapterNode[], depth = 0) => {
      // Sort chapters so they are rendered in the correct order.
      const sortedChapters = [...chapters].sort(sortOrdered);

      for (let i = 1; i <= sortedChapters.length; i++) {
        await renderChapter(sortedChapters[i], i, depth);
      }
    };

    /** Render a chapter and its children. */
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
          ? `OEBS/chapter-${i}-${depth}.xhtml`
          : `OEBS/chapter-${i}.xhtml`;

        // Set the rendered content in the structure.
        setAtPath(structure, filename, content, pathSep);
        chapterCount++;
      } catch (err) {
        const error = new RenderError(
          [err],
          renderStep as RenderStep<RenderContext>,
          `Failed to render chapter: ${chapter.title} (${i})`,
        );

        log.error(error.message, { error });
        throw err;
      }

      if (chapter.children?.length) {
        await renderChapters(chapter.children, depth + 1);
      }
    };

    // Render the chapters in the view.
    await renderChapters(view.chapters);

    log.info(`Rendered ${chapterCount} chapters.`, {
      chapters: ctx.view.chapters,
      count: chapterCount,
    });
  };

  // Set the filename of the template - useful for debugging.
  (renderStep as RenderStep<Locked<RenderContext>>).filename = path;

  return renderStep as RenderStep<Locked<RenderContext>>;
}
