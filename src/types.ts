import { FormatToType } from "./helpers";
import type { ReadFile } from "./load";
import { Metadata } from "./metadata/types";

/**
 * A path to a file or URL.
 */
export type PathLike = string | URL;

/**
 * The format of the media.
 *
 * The value is a MIME type and identifies the type of media.
 * The format must be supported by the builder.
 */
export type MediaFormat = string;

/**
 * The format of the font.
 *
 * The value is a MIME type and identifies the type of font.
 * The format must be supported by the builder.
 */
export type FontFormat = string;

/**
 * The type of the node.
 */
export enum NodeType {
  Metadata = "metadata",
  Chapter = "chapter",
  Css = "css",
  Font = "font",
  Image = "image",
  MediaOverlay = "media-overlay",
  Spine = "spine",
  Ref = "ref",
}

/**
 * A node in the book.
 */
export interface Node {
  /** The unique identifier of the node. */
  id: string;
  /** The type of the node. */
  type: NodeType;
}

/**
 * A reference to a node.
 * @template T The type of the reference node.
 */
export interface RefNode<Type extends NodeType> extends Node {
  /** The type of the node. */
  type: NodeType.Ref;
  /** The reference. */
  ref: {
    /** The type of the reference node. */
    type: Type;
    /** The unique identifier of the reference node. */
    id: string;
  };
}

/**
 * The metadata of the book.
 */
export interface MetadataNode extends Node, Metadata {
  type: NodeType.Metadata;
}

/**
 * A chapter in the book.
 */
export interface ChapterNode extends Node, ContentSource<ContentFormat.Text> {
  type: NodeType.Chapter;
  /** The title of the chapter. */
  title: string;
  /** The format of the content. */
  format: MediaFormat;
  /** The order of the chapter. */
  order: number;
  /** The child chapters. */
  children?: ChapterNode[];
  /** The CSS files of the chapter. */
  css?: RefNode<NodeType.Css>[];
  /** The images of the chapter. */
  fonts?: RefNode<NodeType.Font>[];
}

/**
 * A spine in the book.
 */
export interface SpineNode
  extends Node, Omit<RefNode<NodeType.Chapter>, "type"> {
  type: NodeType.Spine;
  /** The order of the spine item. */
  order: number;
}

/**
 * A CSS file in the book.
 */
export interface CssNode extends Node, ContentSource<ContentFormat.Text> {
  type: NodeType.Css;
  /** The name of the CSS file. */
  name?: string;
}

/**
 * A font in the book.
 */
export interface FontNode
  extends Node, ContentSource<ContentFormat.ArrayBuffer> {
  type: NodeType.Font;
  /** The name of the font. */
  name: string;
  /** The format of the font. */
  format: FontFormat;
}

/**
 * An image in the book.
 */
export interface ImageNode
  extends Node, ContentSource<ContentFormat.ArrayBuffer> {
  type: NodeType.Image;
  /** The name of the image. */
  name?: string;
  /** The format of the image. */
  format: MediaFormat;
  /** The alt text of the image. */
  alt?: string;
}

/**
 * A media overlay in the book.
 */
export interface MediaOverlayNode extends Node {
  type: NodeType.MediaOverlay;
  /** The duration of the overlay. */
  duration: number;
  /** The audio of the overlay. */
  audio: ContentSource<ContentFormat.ArrayBuffer>;
  /** The text of the overlay. */
  text: ContentSource<ContentFormat.Text>;
}

/**
 * The supported content formats.
 */
export enum ContentFormat {
  /** The content is a text string. */
  Text = "text",
  /** The content is an ArrayBuffer. */
  ArrayBuffer = "arraybuffer",
}

/**
 * The source of the content.
 *
 * If the `content` property is provided, the `src` property is ignored.
 *
 * @template Format The format of the content.
 * @template Type The type of the content.
 */
export interface ContentSource<
  Format extends ContentFormat,
  Type = FormatToType<Format>,
> {
  /**
   * The content of the source.
   * If provided, the `src` property is ignored.
   */
  content?: Type;
  /**
   * The file path or URL of the source.
   * If `content` is provided, this property is ignored.
   */
  src?: PathLike;
}

/**
 * A deferred content source.
 *
 * @template Format The format of the content.
 * @template Type The type of the content.
 */
export interface DeferredContentSource<Format extends ContentFormat> {
  /** The file path or URL of the source. */
  src: PathLike;
  /** The format of the content. */
  format: Format;
}

/**
 * Options for getting the content.
 */
export interface GetContentOptions<Type = unknown> {
  /**
   * The function to read a file.
   * @template T The type of the content.
   * @param src The file path.
   * @returns The content of the file.
   */
  readFile?: ReadFile<Type>;
}
