import { createPipeline } from "../src/pipeline";

test("createPipeline", async () => {
  const pipeline = createPipeline();
  expect(pipeline).toBeDefined();
  expect(pipeline.steps).toHaveLength(0);

  pipeline.add(jest.fn());

  expect(pipeline.steps).toHaveLength(1);

  const ctx = {};
  await expect(pipeline.run(ctx)).resolves.toBe(ctx);
});
