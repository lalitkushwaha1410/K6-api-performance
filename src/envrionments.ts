import { Scenario } from "k6/options";

type Env = "systest" | "performance" | "staging";
type Rate = "1" | "2" | "5" | "10" | "15" | "20" | "25";

const authoringLogins = [
  {
    user: "cha\\wf_reviewer@cha.rbxd.ds",
    pass: "Passw0rd",
  },
];

const environments = {
  systest: {
    authoringLoginUrl: "https://authoring.systest.cha.rbxd.ds/workflow-test-harness/",
    authoringApiUrl: "https://authoring.systest.cha.rbxd.ds/api/workflow/v1/graphql",
    subscriberApiUrl: "https://subscriber.systest.genesis.cha.rbxd.ds/api/workflow/v1/graphql",
    webhook: "https://authoring.systest.cha.rbxd.ds/api/workflow/v1/webhooks/",
    authoringOrigin: "https://authoring.systest.cha.rbxd.ds",
    referer: "",
    authoringLogins: authoringLogins,
  },
  staging: {
    authoringLoginUrl: "https://authoring.staging.cha.rbxd.ds/workflow-test-harness/",
    authoringApiUrl: "https://authoring.staging.cha.rbxd.ds/api/workflow/v1/graphql",
    subscriberApiUrl: "https://subscriber.staging.genesis.cha.rbxd.ds/api/video/v1/graphql",
    webhook: "https://authoring.staging.cha.rbxd.ds/api/workflow/v1/webhooks/",
    authoringOrigin: "https://authoring.staging.cha.rbxd.ds",
    referer: "",
    authoringLogins: authoringLogins,
  },
  integration: {
    authoringLoginUrl: "https://authoring.integration.cha.rbxd.ds/workflow-test-harness/",
    authoringApiUrl: "https://authoring.integration.cha.rbxd.ds/api/workflow/v1/graphql",
    subscriberApiUrl: "https://subscriber.integration.genesis.cha.rbxd.ds/api/workflow/v1/graphql",
    webhook: "https://authoring.integration.cha.rbxd.ds/api/workflow/v1/webhooks/",
    authoringOrigin: "https://authoring.integration.cha.rbxd.ds",
    referer: "",
    authoringLogins: authoringLogins,
  },
  performance: {
    authoringLoginUrl: "https://authoring.performance.cha.rbxd.ds/workflow-test-harness/",
    authoringApiUrl: "https://authoring.performance.cha.rbxd.ds/api/workflow/v1/graphql",
    subscriberApiUrl: "https://subscriber.performance.genesis.cha.rbxd.ds/api/workflow/v1/graphql",
    webhook: "https://authoring.performance.cha.rbxd.ds/api/workflow/v1/webhooks/",
    authoringOrigin: "https://authoring.performance.cha.rbxd.ds",
    referer: "",
    authoringLogins: authoringLogins,
  }
};

interface RateConfig {
  1: Scenario;
  2: Scenario;
  5: Scenario;
  10: Scenario;
  15: Scenario;
  20: Scenario;
  25: Scenario;
}

const loadTestConfig: RateConfig = {
  1: {
    executor: "constant-arrival-rate",
    rate: 1,
    timeUnit: "1s",
    duration: "3m",
    gracefulStop: "5s",
    preAllocatedVUs: 10,
    maxVUs: 20, // double the max rate vu's
  },
  2: {
    executor: "constant-arrival-rate",
    rate: 2,
    timeUnit: "1s",
    duration: "3m",
    gracefulStop: "5s",
    preAllocatedVUs: 15,
    maxVUs: 20, // double the max rate vu's
  },
  5: {
    executor: "constant-arrival-rate",
    rate: 5,
    timeUnit: "1s",
    duration: "3m",
    gracefulStop: "5s",
    preAllocatedVUs: 40,
    maxVUs: 40, // double the max rate vu's
  },
  10: {
    executor: "per-vu-iterations",
    vus: 1,
    iterations: 1,
    maxDuration: '1m',
  },
  15: {
    executor: "per-vu-iterations",
    vus: 15,
    iterations: 1,
    maxDuration: '1m',
  },
  20: {
    executor: "per-vu-iterations",
    vus: 20,
    iterations: 1,
    maxDuration: '1m',
  },
  25: {
    executor: "per-vu-iterations",
    vus: 25,
    iterations: 1,
    maxDuration: '1m',
  },
};

// @ts-ignore
let environment = __ENV.environment as Env;
// @ts-ignore
if (!environment) {
  environment = "performance";
}

// @ts-ignore
let rateConfig = __ENV.rateConfig as Rate;
// @ts-ignore
if (!rateConfig) {
  rateConfig = "10";
}

export const authoringLoginUrl = environments[environment].authoringLoginUrl;
export const authoringApiUrl = environments[environment].authoringApiUrl;
export const subscriberApiUrl = environments[environment].subscriberApiUrl;
export const webhook = environments[environment].webhook;
export const authoringOrigin = environments[environment].authoringOrigin;
export const referer = environments[environment].referer;
export const authoringLogin = environments[environment].authoringLogins;
export const rateConfigValue = loadTestConfig[rateConfig];
