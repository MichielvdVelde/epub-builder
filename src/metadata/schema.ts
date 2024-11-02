import { z } from "zod";

/**
 * The zod schema for the metadata object.
 *
 * The schema is used to validate the metadata object before building it.
 * This ensures that the metadata object is valid.
 */
const schema = z.object({
  title: z.string(),
  author: z.string(),
  description: z.string(),
  additional: z.record(z.string()).optional(),
  language: z.union([z.string(), z.array(z.string())]),
  identifier: z.union([z.string(), z.array(z.string())]),
  publisher: z.union([z.string(), z.array(z.string())]),
  contributor: z.union([z.string(), z.array(z.string())]).optional(),
  date: z.string(),
  type: z.union([z.string(), z.array(z.string())]),
  format: z.string().optional(),
  source: z.union([z.string(), z.array(z.string())]).optional(),
  relation: z.union([z.string(), z.array(z.string())]).optional(),
  coverage: z.string().optional().optional(),
  rights: z.union([z.string(), z.array(z.string())]),
  subject: z.union([z.string(), z.array(z.string())]).optional(),
});

export default schema;

/**
 * The type of the metadata object after validation.
 */
export type ParsedMetadata = z.infer<typeof schema>;
