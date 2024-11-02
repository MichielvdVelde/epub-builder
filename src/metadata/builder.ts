import type {
  Metadata,
  MetadataWithoutAdditional,
  MultiTypeKeys,
} from "./types";
import schema, { ParsedMetadata } from "./schema";
import { ParseError } from "./errors";

/**
 * A builder class for the metadata object.
 *
 * @example
 * ```typescript
 * const metadata = MetadataBuilder.create("Title", "Author", "Description")
 *  .set("publisher", "Publisher")
 *  .add("subject", "Subject 1")
 *  .add("subject", "Subject 2")
 *  .build();
 * ```
 */
export class MetadataBuilder {
  /**
   * Create a new instance of the {@link MetadataBuilder} class.
   * @param title The title of the text.
   * @param author The author of the text.
   * @param description A brief description of the text.
   */
  static create(
    title: string,
    author: string,
    description: string,
  ): MetadataBuilder {
    return new MetadataBuilder(title, author, description);
  }

  /** The metadata object. */
  #metadata: Metadata;

  private constructor(title: string, author: string, description: string) {
    this.#metadata = { title, author, description };
  }

  /**
   * Get the metadata object. This is the raw metadata object.
   */
  get metadata(): Metadata {
    return this.#metadata;
  }

  /**
   * Set a metadata key-value pair.
   *
   * In contrast to {@link MetadataBuilder.add}, this method sets a single value for the metadata key.
   * For properties that can have multiple values, use {@link MetadataBuilder.add} to add a value instead.
   *
   * @template Key The key of the metadata.
   * @param key The key of the metadata.
   * @param value The value of the metadata.
   */
  set<Key extends keyof MetadataWithoutAdditional>(
    key: Key,
    value: Metadata[Key],
  ): this {
    this.#metadata[key] = value;
    return this;
  }

  /**
   * Set an additional metadata key-value pair.
   * @param key The key of the metadata.
   * @param value The value of the metadata.
   */
  setAdditional(key: string, value: string): this {
    this.#metadata.additional = this.#metadata.additional ?? {};
    this.#metadata.additional[key] = value;
    return this;
  }

  /**
   * Add a metadata key-value pair.
   *
   * In contrast to {@link MetadataBuilder.set}, this method adds a value to the metadata key.
   * For properties that can have only a single value, use {@link MetadataBuilder.set} instead.
   *
   * @template Key The key of the metadata.
   * @param key The key of the metadata.
   * @param value The value of the metadata.
   */
  add<Key extends MultiTypeKeys[number]>(key: Key, value: Metadata[Key]): this {
    if (!this.#metadata[key]) {
      this.#metadata[key] = Array.isArray(value) ? [...value] : [value];
    } else {
      if (!Array.isArray(this.#metadata[key])) {
        this.#metadata[key] = [this.#metadata[key] as string];
      }

      if (Array.isArray(value)) {
        (this.#metadata[key] as string[]).push(...value);
      } else if (value) {
        (this.#metadata[key] as string[]).push(value);
      }
    }

    return this;
  }

  /**
   * Build the metadata object.
   * @returns The parsed metadata object.
   * @throws {ParseError} Thrown if the metadata object is invalid.
   */
  build(): ParsedMetadata {
    const parsed = schema.safeParse(this.#metadata);

    if (parsed.success) {
      return parsed.data;
    } else {
      throw new ParseError(
        parsed.error.errors,
        "The metadata object is invalid.",
      );
    }
  }
}
