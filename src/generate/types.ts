import type { TextReader, Uint8ArrayReader } from "@zip.js/zip.js";
import { ContentFormat, DeferredContentSource, PathLike } from "../types";

/**
 * An entry object in the ZIP archive. The key is the file path and the value is the entry.
 */
export type EntryObject<T = unknown> = { [key: string]: Entry<T> };

/**
 * An entry in the ZIP archive. It can be a string or an entry object.
 */
export type Entry<T = unknown> =
  | T
  | EntryObject<T>
  | DeferredContentSource<ContentFormat>;

/**
 * The type of an entry in the ZIP archive.
 */
export type EntryType =
  | string
  | Uint8Array
  | DeferredContentSource<ContentFormat>;

/**
 * The structure of an EPUB book.
 */
export interface EpubStructure {
  /** The mimetype of the EPUB book. */
  mimetype?: string;
  /** The META-INF directory of the EPUB book. */
  META_INF: {
    /**
     * The container.xml file. It is used to locate the OPF file in the EPUB book.
     * @see https://www.w3.org/publishing/epub3/epub-packages.html#sec-container-metainf-file
     */
    "container.xml": string;
  } & EntryObject;
  /** The OEBPS directory of the EPUB book. */
  OEBPS: {
    /**
     * The `content.opf` file. It contains the metadata and manifest of the EPUB book.
     * @see https://www.w3.org/TR/epub-33/#dfn-epub-content-document
     */
    "content.opf": string;
    /**
     * The `toc.ncx` file. It contains the table of contents of the EPUB book. This file is included for compatibility with EPUB 2.
     */
    "toc.ncx": string;
    /**
     * The `nav.xhtml` file. It contains the navigation of the EPUB book. This file is included for compatibility with EPUB 3.
     */
    "nav.xhtml": string;
  } & EntryObject;
}

/** The reader type for the entry. */
export type ReaderType<T extends EntryType> = T extends string ? TextReader
  : T extends Uint8Array ? Uint8ArrayReader
  : T extends DeferredContentSource<ContentFormat> ? ReadableStream<Uint8Array>
  : never;

/**
 * Stream a file from a readable stream. Instead of loading the entire file into memory, the file is streamed,
 * which is useful for large files. This function is used for deferred content sources.
 * @param path The file path or URL of the file to stream.
 */
export type StreamFile = (
  path: PathLike,
) => Promise<ReadableStream<Uint8Array>>;
