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
  required structure and metadata, ensuring compatibility with standard EPUB
  readers.
- 🔄 **Modular Pipeline Architecture**: Uses a flexible, step-based pipeline for
  rendering, allowing easy customization, addition, or removal of specific
  processing steps.
- 📝 **Customizable Template Rendering**: Renders core EPUB files (e.g.,
  `content.opf`, `toc.ncx`) using popular templating engines like Mustache or
  EJS, with the option to switch or add other engines.
- 🧩 **Data Transformation Per Step**: Customize the view for each rendering
  step, isolating only the relevant data (e.g., `spine` nodes for navigation),
  which improves performance and focus.
- 📋 **Comprehensive Metadata Management**: `MetadataBuilder` allows easy
  creation of structured metadata fields such as title, author, language,
  publisher, and identifiers, with validation for EPUB compliance.
- 🗂️ **Organized Content Structure**: Structured types for chapters, fonts,
  images, and CSS ensure consistency, extensibility, and type safety throughout
  the EPUB.
- ✨ **Dynamic Template Loading**: Load customizable templates from a specified
  directory, allowing flexibility in defining the look and layout of the EPUB’s
  content.
- 🖋️ **Logging**: Integrated logging with adjustable levels (info, warn, error)
  and optional metadata, providing real-time visibility and debugging
  information for each stage of the rendering and packaging process.
- 🛠️ **Error Handling and Debugging**: Custom error types and detailed logging
  messages simplify troubleshooting by pinpointing errors in specific templates
  or processing steps.
- 📦 **Standards-Compliant EPUB Packaging**: Uses `@zip.js/zip.js` to compress
  and structure EPUB files in a ZIP format, adhering to EPUB’s directory and
  file organization requirements.
- 🌐 **Browser and Node.js Compatibility**: Designed for use in both Node.js and
  web environments, including support for the Origin Private File System (OPFS)
  for secure, browser-based storage.

## Concept

Building an EPUB consists of two steps.

1. **Define the view model**: This is the data structure that represents the
   content of the EPUB. It consists of metadata, chapters, and other content
   nodes.
2. **Build the EPUB**: This is the process of converting the view model into an
   actual EPUB file.

## Installation

Clone the repository and install dependencies using npm:

```sh
git clone https://github.com/MichielvdVelde/epub-builder.git
cd epub-builder
npm install
```

## Example

See [src/example.ts](src/example.ts) for an example of how to use this library.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file
for details.
