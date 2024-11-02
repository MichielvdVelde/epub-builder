import { supportedReaders } from "./readers";
import type { Entry, EntryObject, EntryType, ReaderType } from "./types";

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
 * @param readers The supported readers for the entry types.
 * @returns The reader.
 */
export function createReader<T extends EntryType>(
  entry: T,
  readers = supportedReaders,
): ReaderType<T> {
  try {
    for (const { check, create } of readers) {
      if (check(entry)) {
        return create(entry);
      }
    }

    throw new TypeError("Unsupported entry type.");
  } catch (error) {
    throw new AggregateError([error], "Failed to create reader.");
  }
}
