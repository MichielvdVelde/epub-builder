import type {
  EntryObject,
  EntryType,
  EpubStructure,
  StreamFile,
} from "./types";
import type { Log } from "../log";
import { createReader, isEntry, isEntryObject } from "./helpers";
import {
  type EntryMetaData,
  TextReader,
  type Writer,
  type ZipReaderConstructorOptions,
  ZipWriter,
  type ZipWriterAddDataOptions,
} from "@zip.js/zip.js";

/** The options for adding the mimetype file. */
export type AddMimeTypeOptions = Omit<
  ZipWriterAddDataOptions,
  "level" | "keepOrder"
>;

/**
 * Add the mimetype file to the ZIP archive.
 *
 * **Note:** According to the EPUB specification, the mimetype file must be the
 * first file in the ZIP archive and must not be compressed. The compression level
 * and `keepOrder` option are set to ensure that the mimetype file is added correctly.
 *
 * @template Type The type of the writer.
 * @param writer The ZIP writer.
 * @param mimetype The mimetype string (default: "application/epub+zip").
 * @param options The options for adding the mimetype file.
 */
async function addMimetype<Type>(
  writer: ZipWriter<Type>,
  mimetype = "application/epub+zip",
  options?: AddMimeTypeOptions,
): Promise<EntryMetaData> {
  return writer.add("mimetype", new TextReader(mimetype), {
    ...options,
    level: 0,
    keepOrder: true,
  });
}

/** The options for adding entries to the ZIP archive. */
export type AddEntriesOptions = ZipWriterAddDataOptions;

/**
 * Add entries to the ZIP archive.
 * @template Type The type of the writer.
 * @param writer The ZIP writer.
 * @param entries The entries to add.
 * @param options The options for adding the entries.
 * @param prefix The prefix for the entries.
 */
export async function addEntries<Type>(
  writer: ZipWriter<Type>,
  entries: EntryObject<EntryType>,
  options?: AddEntriesOptions,
  prefix = "",
): Promise<void> {
  for (const [key, value] of Object.entries(entries)) {
    if (isEntryObject(value)) {
      await addEntries(writer, value, options, `${prefix}${key}/`);
    } else if (isEntry(value)) {
      await addEntry(writer, `${prefix}${key}`, value, options);
    }
  }
}

/** The options for adding an entry to the ZIP archive. */
export interface AddEntryOptions extends ZipWriterAddDataOptions {
  /** The logger for logging messages. */
  log?: Log;
  /** The function to stream a file. */
  streamFile?: StreamFile;
}

/**
 * Add an entry to the ZIP archive.
 * @template Type The type of the writer.
 * @param writer The ZIP writer.
 * @param filename The filename of the entry.
 * @param entry The entry to add.
 * @param options The options for adding the entry.
 */
export async function addEntry<Type>(
  writer: ZipWriter<Type>,
  filename: string,
  entry: EntryType,
  options?: AddEntryOptions,
): Promise<EntryMetaData> {
  const log = options?.log;
  const streamFile = options?.streamFile;

  let meta: EntryMetaData | undefined;

  try {
    const reader = await createReader(entry, { streamFile });
    meta = await writer.add(filename, reader, options);
    log?.info(`Added entry "${filename}".`, { meta });
  } catch (error) {
    const err = new AggregateError(
      [error],
      `Failed to add entry "${filename}".`,
    );

    log?.error(err.message);
    throw err;
  }

  return meta;
}

/** The options for the EPUB generator. */
export interface GenerateOptions extends
  Omit<
    ZipReaderConstructorOptions,
    "keepOrder" | "level"
  > {
  /** The logger for logging messages. */
  log?: Log;
  /**
   * The function to stream a file. This function is used to stream a file from the source
   * using a readable stream. This is useful for streaming large files or files that are not
   * available in memory.
   *
   * This function is called for deferred content sources ({@link DeferredContentSource}).
   */
  streamFile?: StreamFile;
}

/**
 * Generate an EPUB book.
 *
 * This function generates an EPUB book from the given structure and options.
 * The resulting EPUB book is written to the writer, allowing you to handle the output
 * in different ways, such as saving it to a file or streaming it over the network.
 *
 * @template Type The type of the writer.
 * @param writer The writer for the EPUB book.
 * @param structure The structure of the EPUB book.
 * @param options The options for the ZIP writer.
 * @returns The writer with the EPUB book.
 * @see https://www.w3.org/publishing/epub3/
 *
 * @example
 * ```ts
 * import { generateEpub, type EpubStructure } from "./generate";
 * import { BlobWriter } from "@zip.js/zip.js";
 *
 * // Create a ZIP writer for the EPUB book.
 * // In this case, we use the BlobWriter to write the EPUB book to a Blob.
 * const writer = new BlobWriter("application/epub+zip");
 *
 * // The structure of the EPUB book.
 * const structure: EpubStructure = {
 *   mimetype: "application/epub+zip",
 *   META_INF: {
 *     "container.xml": `<?xml version="1.0" encoding="UTF-8"?>...`,
 *   },
 *   OEBPS: {
 *     "content.opf": `<?xml version="1.0" encoding="UTF-8"?>...`,
 *     "nav.xhtml": `<?xml version="1.0" encoding="UTF-8"?>...`,
 *   },
 * };
 *
 * // Generate the EPUB book.
 * const blob = await generateEpub(writer, structure);
 * ```
 */
export async function generateEpub<Type>(
  writer: Writer<Type>,
  structure: EpubStructure,
  options?: GenerateOptions,
): Promise<Type> {
  let zipWriter: ZipWriter<Type> | undefined;

  try {
    zipWriter = new ZipWriter(writer, {
      level: 9,
      keepOrder: true,
      ...options,
    });
  } catch (error) {
    throw new AggregateError([error], "Failed to create ZIP writer.");
  }

  const { mimetype, ...entries } = structure;

  // NOTE: The mimetype file must be the first file in the ZIP archive.
  await addMimetype(zipWriter, mimetype, options);
  await addEntries(zipWriter, entries as EntryObject<string>, options);

  return zipWriter.close();
}
