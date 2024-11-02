#!/usr/bin/env node

import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { stat } from "fs/promises";

const execPromise = promisify(exec);

const DEFAULT_SRC = "../artifacts/book.epub"; // Relative path to the EPUBCheck JAR file
const EPUBCHECK_PATH = new URL("../lib/epubcheck.jar", import.meta.url);

/** Error message to display when the EPUBCheck JAR file is not found. */
const notFoundMessage = "EPUBCheck JAR file not found. " +
  "Please download it from http://www.epubcheck.org/ and place it in the 'lib' directory.";

/**
 * Checks if the EPUBCheck JAR file exists in the 'lib' directory.
 * @returns {Promise<boolean>} Whether the EPUBCheck JAR file exists.
 */
export async function checkJar() {
  try {
    await stat(EPUBCHECK_PATH);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    } else {
      throw error;
    }
  }
}

/**
 * Validates an EPUB file using EPUBCheck.
 * @param {string} path Path to the EPUB file to validate.
 * @throws {AggregateError} If the EPUB validation fails.
 * @returns {Promise<string>} The stdout output from the EPUBCheck process.
 */
async function validateEpub(path) {
  const { stdout, stderr } = await execPromise(
    `java -jar ${fileURLToPath(EPUBCHECK_PATH)} ${path}`,
  );

  if (stderr) {
    // Build the error(s) from the stderr output
    const errors = stderr.trim().split("\n");

    throw new AggregateError(
      errors.map((error) => new Error(error)),
      "EPUB validation failed",
    );
  }

  return stdout;
}

// Run the script
const args = process.argv.slice(2);
const src = args[0] ?? DEFAULT_SRC;

try {
  // Check if the EPUBCheck JAR file exists
  const exists = await checkJar();

  if (!exists) {
    throw new Error(notFoundMessage);
  }
} catch (error) {
  console.error("An error occurred while checking for the EPUBCheck JAR file:");
  console.error(error);
  process.exit(1);
}

// Validate the EPUB file
let stdout;

try {
  stdout = await validateEpub(src);
} catch (error) {
  console.error("An error occurred while validating the EPUB file:");
  console.error(error.errors.map((err) => ` ${err.message}`).join("\n"));
  process.exit(1);
}

console.log("EPUB validation successful.\n-----\n");
console.log(stdout);
