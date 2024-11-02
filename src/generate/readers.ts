import type { EntryType, ReaderType, SupportedEntryType } from "./types";
import { TextReader, Uint8ArrayReader } from "@zip.js/zip.js";

/** The supported readers for the entry types. */
export const supportedReaders: SupportedEntryType<EntryType>[] = [
  {
    type: "string",
    check: (type: EntryType): type is string => typeof type === "string",
    create: (entry: EntryType) =>
      new TextReader(entry as string) as ReaderType<string>,
  },
  {
    type: "Uint8Array",
    check: (type: EntryType): type is Uint8Array => type instanceof Uint8Array,
    create: (entry: EntryType) =>
      new Uint8ArrayReader(entry as Uint8Array) as ReaderType<Uint8Array>,
  },
];
