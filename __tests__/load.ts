import { load } from "../src/load";
import { resolve } from "path";

test("load", async () => {
  const barePath = "../templates/default";
  const path = resolve(__dirname, barePath);

  const result = await load(path);
  expect(result).toBeDefined();
});
