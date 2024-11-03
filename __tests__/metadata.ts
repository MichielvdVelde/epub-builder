import { MetadataBuilder } from "../src/metadata/builder";

// This is just a starting point
// More comprehensive tests should be added

test("metadata builder", () => {
  const metadata = MetadataBuilder.create()
    .set("title", "Test Title")
    .set("author", "Test Author")
    .set("description", "Test Description")
    .set("language", "en")
    .set("identifier", "test-identifier")
    .add("publisher", "Test Publisher")
    .set("date", "2021-01-01")
    .set("type", "Text")
    .set("rights", "CC0")
    .add("rights", "CC BY")
    .build();

  expect(metadata).toEqual({
    title: "Test Title",
    author: "Test Author",
    description: "Test Description",
    language: "en",
    identifier: "test-identifier",
    publisher: ["Test Publisher"],
    date: "2021-01-01",
    type: "Text",
    rights: ["CC0", "CC BY"],
  });
});
