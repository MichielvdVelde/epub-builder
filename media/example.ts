// This is an example of how to use the library to generate an EPUB file.
// This example is currently **not** working because epub-builder is a work in progress.

import type {
  CreateRenderer,
  Locked,
  RenderContext,
  Renderer,
  RenderView,
  Templates,
} from "./render/types";
import type { EpubStructure } from "./generate/types";
import { Uint8ArrayWriter } from "@zip.js/zip.js";
import { NodeType } from "./types";
import { createPipeline } from "./pipeline";
import { makeRenderFile } from "./render/render";
import { generateEpub } from "./generate/generate";
import { createRenderContext } from "./render/helpers";
import { makeRenderChapters } from "./render/nodes/chapters";
import { makeRenderCss } from "./render/nodes/css";
import { makeRenderImages } from "./render/nodes/images";
import { makeRenderFonts } from "./render/nodes/fonts";
import { MetadataBuilder } from "./metadata/builder";
import { load } from "./load";
import { render, type RenderOptions } from "mustache";
import { createLog } from "./log";

// Create a renderer.
// We'll use Mustache to render the templates.
const createRenderer: CreateRenderer<any> = (template, options) => {
  const renderer: Renderer<any> = async (view) =>
    render(
      template.template,
      view,
      options?.includer,
      options as RenderOptions,
    );

  // Set the filename of the renderer - used for debugging.
  renderer.filename = options?.filename;
  return renderer;
};

const options = { createRenderer };

// Create the render pipeline.
// This pipeline generates the structure of the book.
const renderPipeline = createPipeline<Locked<RenderContext>>(
  // Render the fonts so they're available in the structure.
  makeRenderFonts({
    transformFilename: (font) => `OEBPS/fonts/${font.name}`,
  }),
  // Render the CSS files so they're available in the structure.
  makeRenderCss({
    transformFilename: (css) => `OEBPS/css/${css.name}`,
  }),
  // Render the images so they're available in the structure.
  makeRenderImages({
    transformFilename: (image) => `OEBPS/images/${image.name}`,
  }),
  // Render the files required by the EPUB specification.
  makeRenderFile("META-INF/container.xml", options),
  makeRenderFile("OEBPS/content.opf", options),
  makeRenderFile("OEBPS/toc.ncx", options),
  makeRenderFile("OEBPS/nav.xhtml", {
    createRenderer,
    // Transform the view to include only the spine nodes.
    transformView: (ctx) => (ctx.view.spine),
  }),
  // Render the chapters.
  makeRenderChapters("chapter.xhtml", {
    createRenderer,
    // Transform the filename of a chapter.
    transformFilename: (_, i) => `OEBS/chapters/chapter-${i}.xhtml`,
    // Transform the view to include the chapter, CSS, and fonts nodes.
    transformView: (ctx, chapter) => {
      const { view } = ctx;

      const cssNodes = chapter?.css?.map((css) => {
        const id = css.ref.id;
        return view.css.find((node) => node.id === id)!;
      });

      const fontNodes = chapter?.fonts?.map((font) => {
        const id = font.ref.id;
        return view.fonts.find((node) => node.id === id)!;
      });

      return { chapter, css: cssNodes, fonts: fontNodes };
    },
  }),
  // ... More steps here.
);

// Create the metadata.
// This represents the metadata of the book.
const metadata = MetadataBuilder.create()
  .set("title", "Example Title")
  .set("author", "Example Author")
  .set("description", "Example Description")
  .set("language", "en")
  .set("identifier", "example-identifier")
  .add("publisher", "Example Publisher")
  .set("date", "2021-01-01")
  .set("type", "Text")
  .set("rights", "CC0")
  .add("rights", "CC BY")
  .build();

// Create the view.
// This represents the content of the book.
const view: RenderView = {
  metadata: {
    id: "metadata",
    type: NodeType.Metadata,
    ...metadata,
  },
  chapters: [
    {
      id: "chapter-1",
      type: NodeType.Chapter,
      title: "Chapter 1",
      content: "Hello, world!",
      format: "text/plain",
      order: 1,
    },
  ],
  spine: [
    {
      id: "spine-1",
      type: NodeType.Spine,
      order: 1,
      ref: {
        type: NodeType.Chapter,
        id: "chapter-1",
      },
    },
  ],
  cover: {
    id: "cover",
    type: NodeType.Image,
    src: "cover.jpg",
    format: "image/jpeg",
  },
  fonts: [],
  css: [],
  images: [],
};

// Load the templates.
// The default templates are Mustache templates that are stored in the `templates/default` directory.
const templateDir = new URL("../templates/default", import.meta.url);
const templates = await load(templateDir) as Templates;

// Create a log.
// The log is used to log events during the render pipeline and generation of the EPUB file.
const log = createLog();

// Log events to the console.
log.addEventListener("log", (event) => {
  console.log(log.format(event.detail));
});

// Create the context.
const context = createRenderContext(view, templates, { log });

// Run the render pipeline with the context.
await renderPipeline.run(context);

// Create a writer.
// This writer is used to write the EPUB file to a buffer.
// Al writers supported by @zip.js/zip.js are supported.
const writer = new Uint8ArrayWriter();

// Generate the EPUB file.
const buffer = await generateEpub(
  writer,
  context.structure as EpubStructure,
  { log },
);

// Example of how to save the EPUB file to the Origin Private File System (OPFS) in a web browser.
// OPFS is a new web standard that allows web applications to store files in a private file system.
if (navigator?.storage?.getDirectory) {
  const root = await navigator.storage.getDirectory();
  const books = await root.getDirectoryHandle("books", { create: true });
  const book = await books.getFileHandle("book.epub", { create: true });
  const writable = await book.createWritable();
  await writable.write(buffer);
  await writable.close();
}
