import type { PathLike } from "./types";
import { fsNode } from "./helpers";

/**
 * Read the contents of a directory.
 * @param path The path to the directory.
 * @returns The names of the files and directories in the directory.
 */
export type ReadDir = (path: PathLike) => Promise<string[]>;

/**
 * Read a file.
 * @template Type The type of the file contents.
 * @param path The path to the file.
 * @returns The contents of the file in the specified type.
 */
export type ReadFile<Type = unknown> = (path: PathLike) => Promise<Type>;

/**
 * Check if a path is a file.
 * @param path The path to check.
 */
export type IsFile = (path: PathLike) => boolean | Promise<boolean>;

/**
 * Options for loading a directory tree.
 */
export interface LoadOptions<Type> {
  /**
   * The function to read a directory.
   * @param path The path to the directory.
   */
  readDir?: ReadDir;
  /**
   * The function to read a file.
   * @template Type The type of the file contents.
   * @param path The path to the file.
   */
  readFile?: ReadFile<Type>;
  /**
   * The function to check if a path is a file.
   *
   * If not provided, {@link isFileByExt} is used.
   * This function checks if the last part of the path contains a period.
   *
   * @param path The path to check.
   */
  isFile?: IsFile;
}

/**
 * Check if a path is a file. A path is considered a file if the last
 * part of the path contains a period.
 *
 * @param path The path to check.
 * @param separator The separator for the path.
 */
export function isFileByExt(path: PathLike, separator = "/"): boolean {
  const href = path instanceof URL ? path.pathname : path;
  return href.split(separator).pop()?.includes(".") ?? false;
}

/**
 * A directory tree. The keys are the file names and the values are the
 * file contents or nested directory trees.
 * @template Type The type of the file contents.
 */
export type DirectoryTree<Type = unknown> = {
  [key: string]: Type | DirectoryTree;
};

/**
 * Load a directory tree.
 *
 * The function reads the contents of a directory and returns a tree structure of the files and directories.
 * If no options are provided, the function uses the node.js `fs/promises` module if available. Should this
 * fail, an error is thrown.
 *
 * In contrast to the {@link loadDir} function, this function attempts to use Node.js's `fs/promises` module
 * if no options are provided. If the module is not available, an error is thrown.
 *
 * @param path The path to the directory. Assumed to be an absolute path.
 * @param options The options for loading the directory tree.
 * @param options.readDir The function to read a directory.
 * @param options.readFile The function to read a file.
 * @param options.isFile The function to check if a path is a file.
 * @throws An error if the `fs/promises` module is not available.
 *
 * @example
 * ```ts
 * // For this example, we'll use the node.js `fs/promises` module anyway.
 * import { readFile, readDir } from "fs/promises";
 *
 * const tree = await load("path/to/directory", {
 *  readDir,
 *  readFile: (path) => readFile(path, "utf8"),
 * });
 */
export async function load(
  path: PathLike,
  options?: LoadOptions<string>,
): Promise<DirectoryTree<string>> {
  let readDir = options?.readDir;
  let readFile = options?.readFile;
  let isFile = options?.isFile ?? isFileByExt;

  if (!readDir || !readFile) {
    const fs = await fsNode();

    if (!readDir) {
      readDir = (path) => fs.readdir(path);
    }

    if (!readFile) {
      readFile = (path) => fs.readFile(path, "utf8");
    }
  }

  return loadDir(path, { readDir, readFile, isFile });
}

/**
 * Load a directory tree. This function is used internally by the {@link load} function
 * to recursively read the contents of a directory.
 *
 * @template Type The type of the file contents.
 * @param path The path to the directory.
 * @param options The options for loading the directory tree.
 * @param options.readDir The function to read a directory.
 * @param options.readFile The function to read a file.
 * @param options.isFile The function to check if a path is a file.
 * @internal
 */
export async function loadDir<Type = unknown>(
  path: PathLike,
  options: Required<LoadOptions<Type>>,
): Promise<DirectoryTree<Type>> {
  const { readDir, readFile, isFile } = options;
  const files = await readDir(path);
  const tree: DirectoryTree<Type> = {};

  for (const file of files) {
    const filePath = `${path}/${file}`;

    if (await isFile(filePath)) {
      try {
        const content = await readFile(filePath);
        tree[file] = content;
      } catch (error) {
        throw new LoadError([error], filePath);
      }
    } else {
      tree[file] = await loadDir(filePath, options);
    }
  }

  return tree;
}

/**
 * An error that occurs when a file fails to load.
 */
export class LoadError extends AggregateError {
  readonly name = "LoadError";
  /** The path to the file that failed to load. */
  readonly path: string;

  constructor(
    errors: unknown[],
    path: string,
    message = `Failed to load file: ${path}`,
  ) {
    super(errors, message);
    this.path = path;
  }
}
