import { expect, test } from "bun:test";
import { parse, SlidesParser } from "./google";
import { writeFile } from "node:fs/promises";

test("Parse Slides", async () => {
  const parser = new SlidesParser();
  const res = await parser.parse(
    "1NnYelsyJnnDCKrtr24hB86jKz3s9AcKoJ33vO1yROK8"
  );
  const res2 = await parser.parse(
    "1NXcEQZQfVMEZ2pMoZvyhG-oxnNHr-B6zfq7OE8UHvxQ"
  );
  const res3 = await parser.parse(
    "1yzEX9iwu7mKVubfBeCFblmAyo_mLxfRq5ZbgaKL5xWA"
  );

  // await writeFile("slides.json", JSON.stringify(res, null, 2), "utf-8");
  console.log(JSON.stringify(res, null, 2));
  console.log(JSON.stringify(res2, null, 2));
  console.log(JSON.stringify(res3, null, 2));
  expect(2 + 2).toBe(4);
});
