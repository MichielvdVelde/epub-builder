/**
 * The metadata of an epub file.
 */
export interface Metadata {
  /** The title of the text. */
  title: string;
  /** The author of the text. */
  author: string;
  /** A brief description of the text. */
  description: string;
  /** Additional metadata key-value pairs. */
  additional?: Record<string, string>;
  /** The language of the text. */
  language?: string | string[];
  /** A unique identifier for the text. This is usually an ISBN. */
  identifier?: string | string[];
  /** The publisher of the text. This is usually the name of the publishing company. */
  publisher?: string | string[];
  /** A person or organization that contributed to the creation of the text. */
  contributor?: string | string[];
  /** The date the text was published or created. */
  date?: string;
  /** The type or genre of the text. */
  type?: string | string[];
  /** The format of the text. */
  format?: string;
  /** The source of the text. */
  source?: string | string[];
  /** A related resource. */
  relation?: string | string[];
  /** The spatial or temporal coverage of the text */
  coverage?: string;
  /** Information about the rights held in and over the text.. */
  rights?: string | string[];
  /** The subject of the text. */
  subject?: string | string[];
}

/** The metadata of an epub file without the additional metadata. */
export type MetadataWithoutAdditional = Omit<Metadata, "additional">;

/** The keys that can have multiple values. */
export type MultiTypeKeys = [
  "language",
  "identifier",
  "publisher",
  "contributor",
  "type",
  "source",
  "relation",
  "rights",
  "subject",
];
