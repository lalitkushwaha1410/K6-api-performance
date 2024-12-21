import { check } from "k6";
import { Options } from "k6/options";
import http from "k6/http";
import { Counter, Trend } from "k6/metrics"; // Import Trend metric
import { authoringApiUrl, authoringOrigin, rateConfigValue } from "./envrionments";
// @ts-ignore
import { htmlReport } from "./javascripts/htmlReportFormat";
import { textSummary } from "./javascripts/index";
import getDate from "./utils/helpers";
import { START_WORKFLOW_QUERY } from "./constants/constants";
import { WORKFLOW_COMPLETE_TASK_QUERY } from "./constants/constants";
import { WORKFLOW_STAGE_INFO_QUERY } from "./constants/constants";
import { WORKFLOW_STATUS_QUERY } from "./constants/constants";
import { WORKFLOW_POST_PUBLISH_ACTION_QUERY } from "./constants/constants";

var myCounter = new Counter("resultCode");
var startworkflowDuration = new Trend("startworkflowDuration");  // Custom metric for startworkflowDuration duration
var workflowStatusDuration = new Trend("workflowStatusDuration");  // Custom metric for workflowStatusDuration duration
var workflowCompleteTaskDuration = new Trend("workflowCompleteTaskDuration"); // Custom metric for workflowCompleteTaskQuery duration
var workflowStageInfoDuration = new Trend("workflowStageInfoDuration");  // Custom metric for workflowStageInfoDuration duration
var workflowPostPublishActionDuration = new Trend("workflowPostPublishActionDuration");  // // Custom metric for workflowPostPublishActionDuration duration
var workflow_taskid: string;
var businessKey: string;

export let options: Options = {
  scenarios: {
    rateConfigValue
  },
  insecureSkipTLSVerify: true,
  thresholds: {
    //  http_req_duration: ["p(90) < 500", "p(95) < 800", "p(99) < 2000", "med < 600"], // med/avg of requests must complete below 1.5s
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
  //let randomUser = cookies[Math.floor(Math.random() * cookies.length)];
  //const cookie = randomUser;
  var params: any = {
    headers: {
      "Content-Type": "application/json",
      cookie: `aauth=CfDJ8LjMsD5NgYpDjLLxwzowPPuhKEl-Xk7U7bR4OocZOe1p2cQPgpMkTMTLhPRVhxz6D8hdT58cVZX22sDrfCamYnsZqYtYnSebCj2nNYAYOAURWKXOQ5zxC_wjUHzMm0cHAAt1YnAVmibdKYy4WaAhVxUV74vrEesH6DLXIyKPS0f0JZfb8bMyCiOC5AGJGXZOh5YZUXlb43L7Z_J2TmDc-0dt2-SP3T83HqvSETa2rwDGc_SJL44pZrf5HufKgvncBCY83SmND483ZaJbu5KHMdWI7iHA3D27b-k3K0nZJof-`,
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
  
  const startWorkflowQuery = { ...START_WORKFLOW_QUERY };
  const res1 = http.post(
    authoringApiUrl,
    JSON.stringify(startWorkflowQuery),
    params
  );
  const jsonBody1 = res1.body;
  if (jsonBody1) {
    const data = JSON.parse(jsonBody1 as string);
   // console.log("StartworkflowQuery response - " + JSON.stringify(data));
    businessKey = data.data.startProcess.businessKey;
   // console.log("businessKey in startapi- " + businessKey);
    startworkflowDuration.add(res1.timings.duration);
    const dateMarker = getDate();
    const result1 = res1.status;

    myCounter.add(1, {
      result: `${result1}`,
      endTimeStamp: dateMarker.timestamp.toString(),
    });
    check(res1, {
      "Start Workflow API status is 200": () => result1 === 200,
    });

    const workflowStatusQuery = { ...WORKFLOW_STATUS_QUERY };
    workflowStatusQuery.variables.businessKey = businessKey;
    const res2 = http.post(
      authoringApiUrl,
      JSON.stringify(workflowStatusQuery),
      params
    );
    const jsonBody2 = res2.body;
    if (jsonBody2) {
      const data = JSON.parse(jsonBody2 as string);
      // console.log("workflowStatusQuery response - "+ JSON.stringify(data));
      workflowStatusDuration.add(res2.timings.duration);
      const result2 = res2.status;
      myCounter.add(1, {
        result: `${result2}`,
        endTimeStamp: dateMarker.timestamp.toString(),
      });
      check(res2, {
        "Workflow Status-API response is 200": () => result2 === 200,
      });
    }

    const workflowStageInfoQuery = { ...WORKFLOW_STAGE_INFO_QUERY };
    workflowStageInfoQuery.variables.businessKey = businessKey;
    const res3 = http.post(authoringApiUrl, JSON.stringify(workflowStageInfoQuery), params);
    const jsonBody3 = res3.body;
    if (jsonBody3) {
      const data = JSON.parse(jsonBody3 as string);
      //  console.log("workflowStageInfoQuery response - "+ JSON.stringify(data));
      workflow_taskid = data.data.workflowStageInfo.id;
      workflowStageInfoDuration.add(res1.timings.duration); // Record the duration of workflowStageInfoQuery
      const result3 = res3.status;
      myCounter.add(1, {
        result: `${result3}`,
        endTimeStamp: dateMarker.timestamp.toString(),
      });
      check(res3, {
        "Workflow Stage Info API response is 200": () => result3 === 200,
      });
    }

    const workflowCompleteTaskQuery = WORKFLOW_COMPLETE_TASK_QUERY(workflow_taskid);
      let res4;
      try {
        res4 = http.post(authoringApiUrl, JSON.stringify(workflowCompleteTaskQuery), params);
        if (res4.status === 200 && workflowCompleteTaskQuery) {
          workflowCompleteTaskDuration.add(res4.timings.duration); // Record the duration of workflowCompleteTaskQuery
        }
        const jsonBody4 = res4.body;
        if (jsonBody4) {
          const data = JSON.parse(jsonBody4 as string);
          //console.log("workflowcompleteTask response - "+ JSON.stringify(data));
          const result4 = res4.status;
          //console.log("completeTask API =" + result4);
          //console.log("completed taskid =" + workflow_taskid);
        }
        const result4 = res4.status;
        // console.log("completeTask API =" + result4);
        // console.log("completed taskid =" + workflow_taskid);
        myCounter.add(1, {
          result: `${result4}`,
          endTimeStamp: getDate().timestamp.toString(),
        });
        check(res4, {
          "Workflow Complete Task API status is 200": () => result4 === 200,
        });
      }
      catch (error) {
        console.log("complete-task api error - " + error);
      }

    const workflowPostPublishActionQuery = { ...WORKFLOW_POST_PUBLISH_ACTION_QUERY };
    const res5 = http.post(
      authoringApiUrl,
      JSON.stringify(workflowPostPublishActionQuery),
      params
    );
    const jsonBody5 = res5.body;
    if (jsonBody5) {
      const data = JSON.parse(jsonBody5 as string);
      // console.log("workflowPostPublishAction response - "+ JSON.stringify(data));
      workflowPostPublishActionDuration.add(res5.timings.duration);
      const result5 = res5.status;
      myCounter.add(1, {
        result: `${result5}`,
        endTimeStamp: dateMarker.timestamp.toString(),
      });
      check(res5, {
        "Workflow Post Publish Action API response is 200": () => result5 === 200,
      });
    }
    }
  };

export function handleSummary(data: any) {
  return {
    "./results/WorkflowApiReport.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}