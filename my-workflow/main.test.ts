//bun add -d @types/bun | bun add -d typescript @types/bun . Also change config, check assets folder
import { expect } from "bun:test";
import { test, newTestRuntime, HttpActionsMock } from "@chainlink/cre-sdk/test";
import { onCronTrigger } from "./main";
import type { Config } from "./main";

const fakePerson = {
  name: "Luke Skywalker",
  height: "172",
  mass: "77",
  birth_year: "19BBY",
  gender: "male",
};

const fakeSwapiResponse = {
  message: "ok",
  result: {
    properties: fakePerson,
  },
};

test("onCronTrigger returns a person and logs a message", () => {
  // Mock HTTP
  const httpMock = HttpActionsMock.testInstance();
  httpMock.sendRequest = (() => ({
    statusCode: 200,
    headers: {},
    body: new TextEncoder().encode(JSON.stringify(fakeSwapiResponse)),
  })) as any;

  // Test runtime
  const runtime = newTestRuntime() as any;
  runtime.config = {
    schedule: "* * * * * *",
    apiUrl: "https://www.swapi.tech/api/people/1",
  } satisfies Config;

  // Call handler
  const result = onCronTrigger(runtime) as { person: typeof fakePerson };

  // 1️⃣ Check returned person
  expect(result.person).toEqual(fakePerson);

  // 2️⃣ Check logs
  const logs = runtime.getLogs() as string[];
  expect(logs.some((log: string) => log.includes("Hello, Star Wars! Workflow triggered."))).toBe(true);
});
