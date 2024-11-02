import makeRenderStep, {
  createRenderContext,
  Locked,
  type RenderContext,
  RenderView,
  Templates,
} from "./render/render";
import createPipeline from "./pipeline";
import { Uint8ArrayWriter } from "@zip.js/zip.js";
import { generateEpub } from "./generate/generate";
import { NodeType } from "./types";
import { wrapTemplate } from "./render/helpers";
import { EpubStructure } from "./generate/types";
import { makeRenderChaptersStep } from "./render/nodes/chapters";
import { makeRenderFonts } from "./render/nodes/fonts";

// Create the render pipeline.
// This pipeline generates the structure of the book.
const renderPipeline = createPipeline<Locked<RenderContext>>(
  makeRenderStep("META-INF/container.xml"),
  makeRenderStep("OEBPS/content.opf"),
  makeRenderStep("OEBPS/toc.ncx"),
  makeRenderStep("OEBPS/nav.xhtml"),
  makeRenderChaptersStep({
    templatePath: "chapter.xhtml",
    transformFilename: (_, i) => `OEBS/chapters/chapter-${i}.xhtml`,
  }),
  makeRenderFonts({
    transformFilename: (font) => `OEBPS/fonts/${font.name}`,
  }),
  // ... Add more steps here.
);

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

const templates: Templates = {
  "META-INF/container.xml": wrapTemplate(""),
  "OEBPS/content.opf": wrapTemplate(""),
  "OEBPS/toc.ncx": wrapTemplate(""),
  "OEBPS/nav.xhtml": wrapTemplate(""),
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
