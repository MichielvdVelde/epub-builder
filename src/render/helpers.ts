import type { TemplateObject } from "./types";

/**
 * Wraps a template with the template key.
 * @param template The template to wrap.
 */
export const wrapTemplate = (template: string): TemplateObject => ({
  template,
});
