import {
  CronCapability,
  HTTPClient,
  handler,
  consensusIdenticalAggregation,
  Runner,
  type NodeRuntime,
  type Runtime,
  json,
  ok,
} from "@chainlink/cre-sdk"

// This is from the config.staging.json file
export type Config = {
  schedule: string
  apiUrl: string
}

// Typescript Type called Person. Any value of type Person must match this shape,
// e.g. {"name":"Luke Skywalker","height":"172","mass":"77","birth_year":"19BBY","gender":"male"}
type Person = {
  name: string
  height: string
  mass: string
  birth_year: string
  gender: string
}

// swapi.tech wraps the actual fields inside result.properties
type SwapiResponse = {
  result: {
    properties: Person
  }
}

// Defines a Type called MyResult. MyResult is the final shape returned by the workflow.
// Example:
/*
const result: MyResult = {
  person: {
    name: "Luke Skywalker",
    height: "172",
    mass: "77",
    birth_year: "19BBY",
    gender: "male"
  }
}
*/
type MyResult = {
  person: Person
}

// Creates a function called initWorkflow
// takes one argument, config, of Type Config
// The config object is expected to contain schedule and apiUrl
export const initWorkflow = (config: Config) => {
  const cron = new CronCapability() // Creates an instance of the cron capability
  return [handler(cron.trigger({ schedule: config.schedule }), onCronTrigger)]
}
// Calls cron.trigger() and passes it the schedule from config,
// and creates a trigger that fires according to that schedule.
// Wraps that trigger with a handler(), pairing the trigger with the function that
// actually runs when the schedule fires (onCronTrigger).
// Returns an array containing that single handler/trigger pair.

// fetchPerson is the function passed to the runInNodeMode helper.
// It contains the logic for making the request and parsing the response.
// The fetchPerson function receives a nodeRuntime argument of type NodeRuntime<Config>
// and is expected to return a value of type Person.
const fetchPerson = (nodeRuntime: NodeRuntime<Config>): Person => {
  const httpClient = new HTTPClient() // Instantiate the HTTP client

  const req = {
    url: nodeRuntime.config.apiUrl,
    method: "GET" as const,
  }

  // Send the request using the HTTP client
  // Instead of async/await, .result() is used to handle asynchronous operations
  // within WASM's synchronous execution model
  const resp = httpClient.sendRequest(nodeRuntime, req).result()

  if (!ok(resp)) {
    throw new Error(`HTTP request failed with status: ${resp.statusCode}`)
  }

  // swapi.tech returns { result: { properties: { name, height, ... } } }
  const parsed = json(resp) as SwapiResponse
  return parsed.result.properties
}

// onCronTrigger receives a runtime object of type Runtime<Config>
// and is expected to return a value of type MyResult (contains the Person)
export const onCronTrigger = (runtime: Runtime<Config>): MyResult => {
  runtime.log("Hello, Star Wars! Workflow triggered.")

  // Use runInNodeMode to execute the offchain fetch.
  // /people/1 is deterministic, so every node should get the same Person object.
  // We use identical consensus so nodes must agree on the exact same result.
  const person = runtime
    .runInNodeMode(fetchPerson, consensusIdenticalAggregation<Person>())()
    .result()

  runtime.log(
    `Successfully fetched person: ${person.name} (${person.height} cm, ${person.mass} kg, born ${person.birth_year})`
  )

  return {
    person,
  }
}

// Entry point for the CRE runner
export async function main() {
  const runner = await Runner.newRunner<Config>()
  await runner.run(initWorkflow)
}