# EPUB Builder

> **Note:** This project is still in development and is not yet ready for use.

EPUB Builder is a TypeScript environment-agnostic library for building EPUB
files. It provides a modular pipeline architecture for generating EPUB files
with rich metadata, hierarchical chapter management, and customizable content
structure.

## Rationale

Recently I found myself in need of a modern, maintained, and flexible EPUB
generation library for a project I was working on. I searched for existing
solutions, but most of them were either outdated, incomplete, or not flexible
enough for my needs. So I decided to build my own.

This is very much a work in progress, and I'm still figuring out the best way to
implement certain features. If you have any suggestions or feedback, please feel
free to open an issue or a pull request.

## Features

These are some of the features that EPUB Builder aims to provide:

- 📚 **Complete EPUB Generation**: Automatically generates EPUB files with all
  required structure and metadata, ensuring compatibility with EPUB readers.
- 🧩 **Modular Pipeline Architecture**: Uses a step-by-step pipeline approach,
  making it easy to add, remove, or rearrange processing steps.
- 📄 **File System Agnostic**: Supports both direct input and file paths for
  content and templates, allowing for flexible content sourcing.
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

## Concept

Building an EPUB consists of two steps.

1. **Define the view model**: This is the data structure that represents the
   content of the EPUB. It consists of metadata, chapters, and other content
   nodes.
2. **Build the EPUB**: This is the process of converting the view model into an
   actual EPUB file.

## Installation

> **Note:** This library is not yet published to npm. You can install it
> directly from GitHub using npm.

Clone the repository and install dependencies using npm:

```sh
git clone https://github.com/MichielvdVelde/epub-builder.git
cd epub-builder
npm install
```

## Example

> **Note:** This example is not yet functional.

See [src/example.ts](src/example.ts) for an example of how to use this library.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file
for details.
