import { beforeAll, describe, test } from "bun:test";
import { disableConsoleOutput } from "../utils/before-all";
import { createNewTestServer } from "../utils/server";

const BASE_INPUT = {
  username: "username",
  fullname: "fullname",
  email: "email@example.com",
  password: "password",
  locale: "fr_FR",
};

describe("validate-user use case", () => {
  beforeAll(() => {
    disableConsoleOutput();
  });

  test("should throw error if the token is invalid not found", async () => {
    const token = "INVALID_TOKEN";

    const app = await createNewTestServer();
  });
});
