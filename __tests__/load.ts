import { load } from "../src/load";
import { resolve } from "path";

test("load", async () => {
  const path = resolve(__dirname, "../templates/default");

  const result = await load(path);
  expect(result).toBeDefined();
});
