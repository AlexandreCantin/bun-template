import { describe, expect, test } from "bun:test";

import { createNewTestServer, doGet } from "./utils/server";

describe("checking if wiptest works", () => {
  test("check server ping", async () => {
    const app = await createNewTestServer();

    const { statusCode, json } = await doGet(app, "");
    expect(statusCode).toBe(200);
    expect(json.message).toBe("Hello World!");
  });
});
