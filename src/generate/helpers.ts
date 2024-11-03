import type { Entry, EntryObject, EntryType, ReaderType } from "./types";
import { TextReader, Uint8ArrayReader } from "@zip.js/zip.js";

/** Check if the entry is an entry object. */
export function isEntryObject<T>(entry: Entry<T>): entry is EntryObject<T> {
  return typeof entry === "object" && entry !== null;
}

/** Check if the entry is an entry. */
export function isEntry(entry: unknown): entry is Entry {
  return typeof entry === "string" || isEntryObject(entry);
}

/**
 * Create a reader from the entry.
 * @param entry The entry to create a reader from.
 * @returns The reader.
 */
export function createReader<T extends EntryType>(
  entry: T,
): ReaderType<T> {
  if (typeof entry === "string") {
    return new TextReader(entry) as ReaderType<T>;
  } else if (entry instanceof Uint8Array) {
    return new Uint8ArrayReader(entry) as ReaderType<T>;
  } else {
    throw new Error(`Unsupported entry type: ${typeof entry}`);
  }
}
