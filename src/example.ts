import type {
  Locked,
  RenderContext,
  RenderView,
  Templates,
} from "./render/types";
import type { EpubStructure } from "./generate/types";
import { Uint8ArrayWriter } from "@zip.js/zip.js";
import { NodeType } from "./types";
import { createPipeline } from "./pipeline";
import { createRenderContext, makeRenderFile } from "./render/render";
import { generateEpub } from "./generate/generate";
import { wrapTemplate } from "./render/helpers";
import { createRenderer } from "./render/renderers/mustache";
import { makeRenderChapters } from "./render/nodes/chapters";
import { makeRenderFonts } from "./render/nodes/fonts";

// This is an example of how to use the library to generate an EPUB file.
// This example is currently **not** working because epub-builder is a work in progress.

// We'll use the built=in Mustache renderer.
// The other built-in option is EJS.
const options = { createRenderer };

// Create the render pipeline.
// This pipeline generates the structure of the book.
const renderPipeline = createPipeline<Locked<RenderContext>>(
  makeRenderFile("META-INF/container.xml", options),
  makeRenderFile("OEBPS/content.opf", options),
  makeRenderFile("OEBPS/toc.ncx", options),
  makeRenderFile("OEBPS/nav.xhtml", {
    createRenderer,
    // Transform the view to include only the spine.
    transformView: (ctx) => (ctx.view.spine),
  }),
  makeRenderChapters({
    createRenderer,
    templatePath: "chapter.xhtml",
    // Transform the filename of a chapter.
    transformFilename: (_, i) => `OEBS/chapters/chapter-${i}.xhtml`,
  }),
  makeRenderFonts({
    transformFilename: (font) => `OEBPS/fonts/${font.name}`,
  }),
  // ... Add more steps here.
);

// Create the view.
// This represents the structure of the book.
// In a real application, this would be the actual structure of the book.
const view: RenderView = {
  metadata: {
    id: "metadata",
    type: NodeType.Metadata,
    title: "My Book",
    author: "John Doe",
    description: "This is a book.",
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
      idref: {
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

// Create dummy templates.
// In a real application, these would be the actual templates.
const templates: Templates = {
  "META-INF/container.xml": wrapTemplate("..."),
  "OEBPS/content.opf": wrapTemplate("..."),
  "OEBPS/toc.ncx": wrapTemplate("..."),
  "OEBPS/nav.xhtml": wrapTemplate("..."),
};

// Create the context.
const context = createRenderContext(view, templates);

// Run the render pipeline with the context.
await renderPipeline.run(context);

// Generate the EPUB file.
const writer = new Uint8ArrayWriter();
const buf = await generateEpub(writer, context.structure as EpubStructure);

// Example of how to save the EPUB file to the Origin Private File System (OPFS) in a web browser.
// OPFS is a new web standard that allows web applications to store files in a private file system.
if (navigator?.storage?.getDirectory) {
  const root = await navigator.storage.getDirectory();
  const booksDir = await root.getDirectoryHandle("books", { create: true });
  const file = await booksDir.getFileHandle("book.epub", { create: true });
  const writable = await file.createWritable();
  await writable.write(buf);
  await writable.close();
}
