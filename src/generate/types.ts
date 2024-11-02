import type { TextReader, Uint8ArrayReader } from "@zip.js/zip.js";

/**
 * An entry object in the ZIP archive. The key is the file path and the value is the entry.
 */
export type EntryObject<T = unknown> = { [key: string]: Entry<T> };

/**
 * An entry in the ZIP archive. It can be a string or an entry object.
 */
export type Entry<T = unknown> = T | EntryObject<T>;

/**
 * The type of an entry in the ZIP archive.
 */
export type EntryType = string | Uint8Array;

/**
 * The structure of an EPUB book.
 */
export interface EpubStructure {
  /** The mimetype of the EPUB book. */
  mimetype: string;
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
     * The content.opf file. It contains the metadata and manifest of the EPUB book.
     * @see https://www.w3.org/publishing/epub3/epub-packages.html#sec-package-metadata
     */
    "content.opf": string;
    /**
     * The nav.xhtml file. It contains the navigation of the EPUB book.
     * @see https://www.w3.org/publishing/epub3/epub-packages.html#sec-xhtml-nav
     */
    "toc.ncx": string;
    /**
     * The nav.xhtml file. It contains the navigation of the EPUB book.
     * @see https://www.w3.org/publishing/epub3/epub-packages.html#sec-xhtml-nav
     */
    "nav.xhtml": string;
  } & EntryObject;
}

/**
 * The supported entry types.
 *
 * Each supported entry type has a check function to determine if the entry is of that type
 * and a create function to create a reader from the entry.
 *
 * @template T The type of the entry.
 */
export interface SupportedEntryType<T extends EntryType> {
  /** The type of the entry. */
  readonly type: string;
  /** Check if the entry is of the supported type. */
  check: (type: EntryType) => type is T;
  /** Create a reader from the entry. */
  create: (entry: T) => ReaderType<T>;
}

/** The reader type for the entry. */
export type ReaderType<T extends EntryType> = T extends string ? TextReader
  : Uint8ArrayReader;
