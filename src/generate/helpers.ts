import type {
  Entry,
  EntryObject,
  EntryType,
  ReaderType,
  StreamFile,
} from "./types";
import type { DeferredContentSource } from "../types";
import { TextReader, Uint8ArrayReader } from "@zip.js/zip.js";

/** Check if the entry is an entry object. */
export function isEntryObject<T>(entry: Entry<T>): entry is EntryObject<T> {
  return typeof entry === "object" && entry !== null;
}

/** Check if the entry is an entry. */
export function isEntry(entry: unknown): entry is Entry {
  return typeof entry === "string" || isEntryObject(entry);
}

/** Check if the source is a deferred content source. */
export function isDeferredContentSource(
  source: unknown,
): source is DeferredContentSource {
  return typeof source === "object" && source !== null && "src" in source &&
    "deferred" in source && source.deferred === true;
}

/** The options for creating a reader. */
export interface CreateReaderOptions {
  /** The function to stream a file. */
  streamFile?: StreamFile;
}

/**
 * Create a reader from the entry.
 * @param entry The entry to create a reader from.
 * @returns The reader.
 */
export async function createReader<T extends EntryType>(
  entry: T,
  options?: CreateReaderOptions,
): Promise<ReaderType<T>> {
  if (typeof entry === "string") {
    return new TextReader(entry) as ReaderType<T>;
  } else if (entry instanceof Uint8Array) {
    return new Uint8ArrayReader(entry) as ReaderType<T>;
  } else if (isDeferredContentSource(entry)) {
    if (!options?.streamFile) {
      throw new Error(
        "The streamFile function is required for deferred content sources.",
      );
    }

    const stream = await options.streamFile(entry.src);
    return stream as ReaderType<T>;
  } else {
    throw new Error(`Unsupported entry type: ${typeof entry}`);
  }
}
