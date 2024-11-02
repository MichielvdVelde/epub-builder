# EPUB Builder

EPUB Builder is a TypeScript environment-agnostic library for building EPUB
files.

> **Note:** This project is still in development and is not yet ready for use.

## Installation

Clone the repository and install dependencies using npm:

```sh
git clone https://github.com/MichielvdVelde/epub-builder.git
cd epub-builder
npm install
```

## Features

- 📚 **Complete EPUB Generation**: Automatically generates EPUB files with all
  required structure and metadata, ensuring compatibility with EPUB readers.
- 🧩 **Modular Pipeline Architecture**: Uses a step-by-step pipeline approach,
  making it easy to add, remove, or rearrange processing steps.
- 🛠️ **Flexible Template Rendering**: Renders core EPUB files (`content.opf`,
  `toc.ncx`, `nav.xhtml`, etc.) using customizable templates.
- 📝 **Rich Metadata Support**: Allows inclusion of detailed metadata such as
  title, author, description, and more for complete book information.
- 📖 **Hierarchical Chapter Management**: Supports multi-level chapters with
  automatic ordering for organized book navigation.
- 🗂️ **Customizable Content Structure**: Easily configure and nest various file
  types (CSS, fonts, images, audio) in the EPUB’s internal structure.
- 🔍 **Content Type Safety**: Enforces content type safety with TypeScript
  interfaces for each node type (e.g., Chapter, Image, Font).
- 🌐 **Path-Based Content Manipulation**: Utilities for setting and retrieving
  values in deeply nested structures using flexible path strings.
- 🔄 **Dynamic Content Source Handling**: Supports content from both direct
  input and file paths, handling text and binary data seamlessly.
- 🧪 **Error Handling and Logging**: Detailed logging and custom error types for
  clear debugging and error tracking throughout the pipeline.
- 💾 **EPUB-Compliant ZIP Archiving**: Generates ZIP-compressed EPUB files with
  correct directory layout, mimetype, and file order.
- 🚀 **Web and Node.js Compatibility**: Designed to work in both Node.js and
  modern web environments, including support for the Origin Private File System
  (OPFS).
- 🔧 **Easy Integration**: Simple API for defining content and templates, making
  it easy to embed in other applications or scripts.

## Example

> **Note:** This example is not yet functional.

See [src/test.ts](src/test.ts) for an example of how to use this library.

## License

This project is licensed under the MIT License.
