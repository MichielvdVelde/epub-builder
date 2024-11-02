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
import { NodeType, SpineNode } from "./types";
import { createPipeline } from "./pipeline";
import { makeRenderFile } from "./render/render";
import { generateEpub } from "./generate/generate";
import { createRenderContext, wrapTemplate } from "./render/helpers";
import { makeRenderChapters } from "./render/nodes/chapters";
import { makeRenderFonts } from "./render/nodes/fonts";
import { MetadataBuilder } from "./metadata/builder";
import { render, type RenderOptions } from "mustache";

// Create a renderer.
// We'll use Mustache to render the templates.
const createRenderer: CreateRenderer<any> = (template, options) => {
  const renderer: Renderer<any> = async (view) => {
    return render(
      template.template,
      view,
      options?.includer,
      options as RenderOptions,
    );
  };

  renderer.filename = options?.filename;
  return renderer;
};

const options = { createRenderer };

// Create the render pipeline.
// This pipeline generates the structure of the book.
const renderPipeline = createPipeline<Locked<RenderContext>>(
  makeRenderFile("META-INF/container.xml", options),
  makeRenderFile("OEBPS/content.opf", options),
  makeRenderFile("OEBPS/toc.ncx", options),
  makeRenderFile<SpineNode[]>("OEBPS/nav.xhtml", {
    createRenderer,
    // Transform the view to include only the spine nodes.
    transformView: (ctx) => (ctx.view.spine),
  }),
  makeRenderChapters("chapter.xhtml", {
    createRenderer,
    // Transform the filename of a chapter.
    transformFilename: (_, i) => `OEBS/chapters/chapter-${i}.xhtml`,
  }),
  makeRenderFonts({
    transformFilename: (font) => `OEBPS/fonts/${font.name}`,
  }),
  // ... Add more steps here.
);

// Create the metadata.
// This represents the metadata of the book.
const metadata = MetadataBuilder.create(
  "My Book",
  "John Doe",
  "This is a book.",
)
  .set("publisher", "My Publisher")
  .set("language", "en")
  .set("identifier", "urn:isbn:1234567890")
  .set("date", "2022-01-01")
  .set("rights", "© 2022 John Doe")
  .build();

// Create the view.
// This represents the content of the book.
const view: RenderView = {
  metadata: {
    id: "metadata",
    ...{ ...metadata, mType: metadata.type }, // FIX: The node has a `type` property which overlaps with the `type` property of the `Metadata` type.
    type: NodeType.Metadata,
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
  "chapter.xhtml": wrapTemplate("..."),
};

// Create the context.
const context = createRenderContext(view, templates);

// Run the render pipeline with the context.
await renderPipeline.run(context);

// Generate the EPUB file.
const writer = new Uint8ArrayWriter();
const buffer = await generateEpub(writer, context.structure as EpubStructure);

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
