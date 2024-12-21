import { check } from "k6";
import { Options } from "k6/options";
import http from "k6/http";
import { Counter } from "k6/metrics";
import { getLoginCookie } from "./login";
import { authoringApiUrl, authoringOrigin, authoringLogin,rateConfigValue } from "./envrionments";
// @ts-ignore
import { htmlReport } from "./javascripts/htmlReportFormat";
import { textSummary } from "./javascripts/index";
import getDate from "./utils/helpers";
import { WORKFLOW_STAGE_INFO_QUERY } from "./constants/constants";

var myCounter = new Counter("resultCode");

export let options: Options = {
  scenarios: {
    rateConfigValue
  },
  insecureSkipTLSVerify: true,
  thresholds: {
   // http_req_duration: ["p(90) < 500", "p(95) < 800", "p(99) < 2000", "med < 600"], // med/avg of requests must complete below 1.5s
    http_req_failed: ["rate < 0.01"],
  },
};

// Setup stage - login and set up cookies
/*export function setup() {
  const cookies: string[] = [];
  for (let user of authoringLogin) {
    const cookie = getLoginCookie(user.user, user.pass);
    if (cookie) {
        cookies.push(cookie);
    }
  }
  return cookies;
}*/

export default (cookies: string[]) => {
  
//  let randomUser = cookies[Math.floor(Math.random() * cookies.length)];
 // const cookie = randomUser;
  var params: any = {
    headers: {
      "Content-Type": "application/json",
      cookie: `aauth=CfDJ8HfDEgiqr3lDv4evfJ-Zx35sni4EOSAcXoUAA1ZW9OGORMQBbHdAkEtDwo2m0ucsQCaIYh9iF5igY-VRW3kBJQk-ZHQwJk_M3iGAWDzCXFZIyN501zwPDc57eT8dgLoyGriXst2647iK-hLWZwN0g8emqxV2dFJiLnY80gGsT0ihDKgem1x1Tql0LtkO_ADQmGOrwrSgSyfPjTz_3BckOpVZLxAxcM-0Djtx053XuNcNG4G7dufAYoLCvq7oUy6-CJ48j2FTdlWKiSIffzZmIhyOK2wJYtRXFQFHWD9xnRU7`,
      "initialStatus":"DRAFT",
      "testHarness":"TRUE",
      "workspaceId":"intelligence",
      "accept-encoding": "gzip, deflate, br",
      Accept: "*/*",
      origin: authoringOrigin,
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    },
  };
  const workflowQuery = WORKFLOW_STAGE_INFO_QUERY;
  const res = http.post(
    authoringApiUrl,
    JSON.stringify(workflowQuery),
    params
  );
  const dateMarker = getDate();
  const result = res.status;
  myCounter.add(1, {
    result: `${result}`,
    endTimeStamp: dateMarker.timestamp.toString(),
  });
  check(res, {
    "Workflow StageInfo API status is 200": () => result === 200,
  });

};

export function handleSummary(data: any) {
    return {
      "./results/workflowStageInfoApi.html": htmlReport(data),
      stdout: textSummary(data, { indent: " ", enableColors: true }),
    };
  }