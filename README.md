# CRE Chainlink Star Wars API

A [Chainlink CRE](https://docs.chain.link/cre) workflow written in **TypeScript** that fetches Star Wars character data from the [SWAPI](https://www.swapi.tech/) on a cron schedule.

| | |
|---|---|
| **Runtime** | Chainlink CRE |
| **Language** | TypeScript (Bun) |
| **SDK** | [`@chainlink/cre-sdk`](https://www.npmjs.com/package/@chainlink/cre-sdk) |
| **API** | https://www.swapi.tech |

---

## What it does

- Runs on a **cron trigger** (every 30 seconds by default)
- Calls the SWAPI (`GET /api/people/{id}`)
- Parses character details (name, height, mass, birth year, gender)
- Uses CRE’s HTTP capability with identical consensus aggregation
- Includes unit tests with a mocked HTTP client

Default config fetches **Luke Skywalker** (`people/1`).

## Project structure
``` 
cre-chainlink-starwars-api/
├── my-workflow/
│   ├── main.ts                 # Workflow entry point
│   ├── main.test.ts            # Unit tests
│   ├── workflow.yaml           # CRE workflow settings
│   ├── config.staging.json     # Staging config
│   ├── config.production.json  # Production config
│   ├── package.json
│   └── tsconfig.json
├── project.yaml                # CRE project settings (RPCs)
├── secrets.yaml
├── package.json
└── README.md
```
## Quick start

### Prerequisites
- [Bun](https://bun.sh)
- [CRE CLI](https://docs.chain.link/cre)

### 1. Install dependencies
```
# Project root
bun install

cd my-workflow
bun install
```
### 2. Set Environment Variable
```
# Dummy key is fine (this workflow does not write on-chain)
export CRE_ETH_PRIVATE_KEY=0000000000000000000000000000000000000000000000000000000000000001
```
### 3.Simulate the Workflow(Project Root)
```cre workflow simulate my-workflow --target=staging-settings```
### 4.Run Tests
```
cd my-workflow
bun test
```
## Staging
> Change apiUrl to fetch a different character (e.g. /people/4 for Darth Vader).
```
{
  "schedule": "*/30 * * * * *",
  "apiUrl": "https://www.swapi.tech/api/people/1"
}
```
## Tech stack

| Layer              | Technology                                      |
|--------------------|-------------------------------------------------|
| **Language**       | TypeScript                                      |
| **Runtime**        | Chainlink CRE (WASM)                            |
| **Package manager**| Bun                                             |
| **CRE SDK**        | `@chainlink/cre-sdk` ^1.16.0                    |
| **HTTP capability**| CRE `HTTPClient`                                |
| **Cron capability**| CRE `CronCapability`                            |
| **External API**   | [SWAPI](https://www.swapi.tech/) (Star Wars API)|
| **Consensus**      | Identical aggregation                           |
| **Testing**        | Bun test + CRE HTTP mocks                       |
| **CLI**            | [CRE CLI](https://docs.chain.link/cre)          |
