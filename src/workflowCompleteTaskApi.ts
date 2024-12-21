import { check } from "k6";
import { Options } from "k6/options";
import http from "k6/http";
import { Counter, Trend } from "k6/metrics"; // Import Trend metric
import { getLoginCookie } from "./login";
import { authoringApiUrl, authoringOrigin, authoringLogin, rateConfigValue } from "./envrionments";
// @ts-ignore
import { htmlReport } from "./javascripts/htmlReportFormat";
import { textSummary } from "./javascripts/index";
import getDate from "./utils/helpers";
import { WORKFLOW_COMPLETE_TASK_QUERY } from "./constants/constants";
import { WORKFLOW_STAGE_INFO_QUERY } from "./constants/constants";

var myCounter = new Counter("resultCode");
var workflowCompleteTaskDuration = new Trend("workflowCompleteTaskDuration"); // Custom metric for workflowCompleteTaskQuery duration
var workflowStageInfoDuration = new Trend("workflowStageInfoDuration");  // Custom metric for workflowStageInfoDuration duration
var workflow_taskid: string;

export let options: Options = {
  scenarios: {
    rateConfigValue
  },
  insecureSkipTLSVerify: true,
  thresholds: {
  //  workflowCompleteTaskDuration: ["p(90) < 500", "p(95) < 800", "p(99) < 1000", "med<600"],
  //  workflowStageInfoDuration: ["p(90) < 500", "p(95) < 800", "p(99) < 1000", "med<600"], // Set thresholds for the specific API
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

 // let randomUser = cookies[Math.floor(Math.random() * cookies.length)];
  //const cookie = randomUser;
  var params: any = {
    headers: {
      "Content-Type": "application/json",
      cookie: `aauth=CfDJ8HfDEgiqr3lDv4evfJ-Zx35sni4EOSAcXoUAA1ZW9OGORMQBbHdAkEtDwo2m0ucsQCaIYh9iF5igY-VRW3kBJQk-ZHQwJk_M3iGAWDzCXFZIyN501zwPDc57eT8dgLoyGriXst2647iK-hLWZwN0g8emqxV2dFJiLnY80gGsT0ihDKgem1x1Tql0LtkO_ADQmGOrwrSgSyfPjTz_3BckOpVZLxAxcM-0Djtx053XuNcNG4G7dufAYoLCvq7oUy6-CJ48j2FTdlWKiSIffzZmIhyOK2wJYtRXFQFHWD9xnRU7`,
      "initialStatus": "DRAFT",
      "testHarness": "TRUE",
      "workspaceId": "intelligence",
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

  const workflowStageInfoQuery = WORKFLOW_STAGE_INFO_QUERY;
  const res1 = http.post(authoringApiUrl,JSON.stringify(workflowStageInfoQuery),params);
  const jsonBody = res1.body;
  if (jsonBody) {
    const data = JSON.parse(jsonBody as string);
    workflow_taskid  = data.data.workflowStageInfo.id;
    workflowStageInfoDuration.add(res1.timings.duration); // Record the duration of workflowStageInfoQuery
    const result = res1.status;
    check(res1, {
      "Workflow Stage Info API status is 200": () => result === 200,
    });
    console.log("workflow_taskid - "+ workflow_taskid); 

    const workflowCompleteTaskQuery = WORKFLOW_COMPLETE_TASK_QUERY(workflow_taskid);
    let res;
    try {
      res = http.post(authoringApiUrl, JSON.stringify(workflowCompleteTaskQuery), params);
      if (res.status === 200 && workflowCompleteTaskQuery) {
        workflowCompleteTaskDuration.add(res.timings.duration); // Record the duration of workflowCompleteTaskQuery
      }
      const jsonBody4 = res.body;
        if (jsonBody4) {
          const data = JSON.parse(jsonBody4 as string);
          console.log("workflowcompleteTask response - "+ JSON.stringify(data));
          const result4 = res.status;
          console.log("completeTask API =" + result4);
          console.log("completed taskid =" + workflow_taskid);
        }
      const result = res.status;
      // console.log("completeTask API =" + result);
      // console.log("completed taskid =" + workflow_taskid);

      myCounter.add(1, {
        result: `${result}`,
        endTimeStamp: getDate().timestamp.toString(),
      });
      check(res, {
        "Workflow Complete Task API status is 200": () => result === 200,
      });
    } 
    catch (error) {
      console.log("complete-task api error - "+ error);
    }
  }
};

export function handleSummary(data: any) {
  return {
    "./results/workflowCompleteTaskApi.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}