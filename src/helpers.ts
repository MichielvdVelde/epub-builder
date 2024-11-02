import {
  ContentFormat,
  type ContentSource,
  type GetContentOptions,
} from "./types";
import { ReadFile } from "./load";

/**
 * Options for setting a value at a path.
 */
export interface SetAtPathOptions {
  /** The separator for the path (default: "."). */
  separator?: string;
}

/**
 * Set a value at a path in an object.
 * @param obj The object to set the value in.
 * @param path The path to set the value at.
 * @param value The value to set.
 * @param options The options for setting the value.
 * @param options.separator The separator for the path (default: ".").
 *
 * @example
 * ```ts
 * const obj = { a: { b: { c: 1 } } };
 *
 * // Set the value at the path "a.b.c" to 2.
 * setAtPath(obj, "a.b.c", 2);
 * console.log(obj); // { a: { b: { c: 2 } } }
 *
 * // Add a new value at the path "a.b.d" with the value 3.
 * setAtPath(obj, "a.b.d", 3);
 * console.log(obj); // { a: { b: { c: 2, d: 3 } } }
 * ```
 */
export function setAtPath<T>(
  obj: Record<string, unknown>,
  path: string,
  value: T,
  options?: SetAtPathOptions,
): void {
  const separator = options?.separator ?? ".";
  const keys = path.split(separator);
  let current = obj;

  for (let i = 0; i < keys.length; i++) {
    if (i === keys.length - 1) {
      current[keys[i]] = value;
    } else {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }

      current = current[keys[i]] as Record<string, unknown>;
    }
  }
}

/**
 * Options for getting a value at a path.
 */
export interface GetAtPathOptions {
  /** The separator for the path (default: "."). */
  separator?: string;
  /** Whether to throw an error if the path is not found (default: false). */
  throwOnNotFound?: boolean;
}

/**
 * Get a value at a path in an object.
 * @param obj The object to get the value from.
 * @param path The path to get the value from.
 * @param options The options for getting the value.
 * @param options.separator The separator for the path (default: ".").
 * @param options.throwOnNotFound Whether to throw an error if the path is not found (default: false).
 * @returns The value at the path, or `undefined` if not found.
 *
 * @example
 * ```ts
 * const obj = { a: { b: { c: 1 } } };
 * const value = getAtPath(obj, "a.b.c");
 * console.log(value); // 1
 * ```
 */
export function getAtPath<T = unknown>(
  obj: Record<string, unknown>,
  path: string,
  options?: GetAtPathOptions,
): T | undefined {
  const separator = options?.separator ?? ".";
  const throwOnNotFound = options?.throwOnNotFound ?? false;
  const keys = path.split(separator);

  let current = obj;

  for (let i = 0; i < keys.length; i++) {
    if (!current[keys[i]]) {
      if (throwOnNotFound) {
        throw new Error(`The path "${path}" was not found.`);
      } else {
        return;
      }
    } else {
      current = current[keys[i]] as Record<string, unknown>;
    }
  }

  return current as T;
}

/**
 * Content format to type mapping.
 * @template Format The content format.
 */
export type FormatToType<Format> = Format extends ContentFormat.Text ? string
  : Format extends ContentFormat.ArrayBuffer ? ArrayBuffer
  : never;

/**
 * Get the content from a source. If the source is read, it is saved to the content source,
 * making it available for future use.
 *
 * - If the content is provided, it is returned.
 * - If the source is a file path, the file is read and the content is returned.
 *
 * @template Format The content format.
 * @template Type The type of the content.
 * @param source The content source.
 * @param format The content format.
 * @param options The options for getting the content.
 * @throws An error if no content or source is provided.
 *
 * @example
 * ```ts
 * // Get the content from a source directly.
 * const source: ContentSource<ContentFormat.Text> = {
 *   content: "Hello, world!",
 * };
 *
 * const content = await getContent(source, ContentFormat.Text);
 * console.log(content); // "Hello, world!"
 *
 * // Get the content from a file.
 * const source: ContentSource<ContentFormat.Text> = {
 *   src: "file.txt",
 * };
 *
 * const content = await getContent(source, ContentFormat.Text);
 * console.log(content); // "Hello, world!"
 * ```
 */
export async function getContent<
  Format extends ContentFormat,
  Type = FormatToType<Format>,
>(
  source: ContentSource<Format, Type>,
  format: Format,
  options?: GetContentOptions<Type>,
): Promise<Type> {
  if (source.content) {
    return source.content;
  } else if (source.src) {
    let readFile = options?.readFile;

    if (!readFile) {
      readFile = await makeReadFile(format);
    }

    // Save the content to the source.
    source.content = await readFile(source.src);
    return source.content;
  } else {
    throw new TypeError("No content or source provided.");
  }
}

/**
 * Make a function to read a file.
 *
 * This function uses Node.js's `fs/promises` module to read files.
 *
 * @template Format The content format.
 * @template Type The type of the content.
 * @param format The content format.
 * @throws An error if the `fs/promises` module could not be imported.
 * @throws An error if the content format is not supported.
 * @returns The function to read a file.
 */
export async function makeReadFile<
  Format extends ContentFormat,
  Type = FormatToType<Format>,
>(
  format: ContentFormat,
): Promise<ReadFile<Type>> {
  // Attempt to import the `fs/promises` module.
  const fs = await fsNode();

  switch (format) {
    case ContentFormat.Text:
      return ((path) => fs.readFile(path, "utf8")) as ReadFile<Type>;
    case ContentFormat.ArrayBuffer:
      return (async (path) => {
        const buffer = await fs.readFile(path);
        return buffer.buffer;
      }) as ReadFile<Type>;
    default:
      throw new TypeError(`Unsupported content format: ${format}`);
  }
}

/**
 * Import the `fs/promises` module if available.
 * @throws An error if the `fs/promises` module could not be imported.
 */
export async function fsNode(): Promise<typeof import("fs/promises")> {
  try {
    return await import("fs/promises");
  } catch (error) {
    throw new AggregateError([error], "Unable to import 'fs/promises'.");
  }
}
