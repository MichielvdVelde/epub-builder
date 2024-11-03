import { createLog } from "../src/log";

test("createLog", () => {
  const log1 = createLog();
  expect(log1).toBeDefined();
  expect(log1.error).toBeDefined();
  expect(log1.warn).toBeDefined();
  expect(log1.info).toBeDefined();
  expect(log1.log).toBeDefined();
  expect(log1.addEventListener).toBeDefined();
  expect(log1.removeEventListener).toBeDefined();
});
