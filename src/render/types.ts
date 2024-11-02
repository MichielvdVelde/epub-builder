/**
 * A renderer function that takes a view and returns a string.
 * @template View The view type.
 * @param view The view to render.
 */
export interface Renderer<View> {
  (view: View): Promise<string>;
  /** The filename of the template. */
  filename?: string;
}

/** A template object. Acts as a wrapper for a template string. */
export type TemplateObject = { template: string };

/**
 * A function that returns the partial template for a given name.
 * @param name The name of the partial template.
 */
export type Includer = (name: string) => string;

/**
 * Options for creating a renderer.
 * @template T The renderer options type.
 */
export type CreateRendererOptions<T> = T & {
  /** The filename of the template. */
  filename?: string;
  /** A function that returns the partial template for a given name. */
  includer?: Includer;
};

/** Make the value deep readonly. */
export type DeepReadonly<T> = T extends (infer R)[] ? DeepReadonlyArray<R>
  : T extends object ? DeepReadonlyObject<T>
  : T;

/** Make an array deep readonly. */
export interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

/** Make an object deep readonly. */
export type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};
