
import { v4 as uuidv4 } from 'uuid';
const processDefinitionKey = "intelligence";
const initialStatus = "DRAFT";
const testHarness = true;
const workspaceId = "intelligence";
const nextAction = "UNDER_REVIEW";
const notifyCopyDesk = false;

export const START_WORKFLOW_QUERY = {
  operationName: "startProcess",
  variables: {
    dto: {
      businessKey: uuidv4(),
      processDefinitionKey,
      variables: {
        initialStatus,
        testHarness,
        workspaceId
      }
    },
  },
  query: `
          mutation startProcess($dto: StartProcessDtoInput!) {
              startProcess(dto: $dto) 
                 {
                        id    
                        definitionId
                        businessKey
                        caseInstanceId
                        ended
                        suspended
                        tenantId
                        variables
                        __typename

                    }
           }
      `,
};

export const WORKFLOW_STATUS_QUERY = {
  operationName: "workflowStatus",
  variables: {
    processDefinitionKey,
    businessKey: "",
  },
  query: `
            query workflowStatus($processDefinitionKey: String!, $businessKey: String!) {
              workflowStatus(
                processDefinitionKey: $processDefinitionKey
                businessKey: $businessKey
              ) {
                    statusCode
                    statusLabel
                    errorMessage
                    isErrorOccurred
                    __typename
                }
              }
      `,
};


export const WORKFLOW_STAGE_INFO_QUERY = {
  operationName: "workflowStageInfo",
  variables: {
    businessKey: "",
  },
  query: `
          query workflowStageInfo($businessKey: String!) 
              { workflowStageInfo(businessKey: $businessKey) 
                   {  
                        id
                        name
                        assignee
                        processInstanceId
                        taskDefinitionKey
                        isLockAllowed
                        isEditable
                        nextActions 
                      {
                            key
                            value
                            message
                            isAllowed
                            properties 
                               {
                                    key       
                                    value
                                    __typename
                                  }
                          __typename }
              __typename }
         }
      `,
};

export const WORKFLOW_COMPLETE_TASK_QUERY = (workflow_taskid: any) => ({
  operationName: "completeTask",
  variables: {
    dto: {
      taskId: workflow_taskid,
      variables: {
        nextAction,
        notifyCopyDesk,
        testHarness,
      },
    },
  },
  query: `
             mutation completeTask($dto: CompleteTaskDtoInput!) { 
                  completeTask(dto: $dto) 
              }
          `,
});

export const WORKFLOW_POST_PUBLISH_ACTION_QUERY = {
  operationName: "postPublishAction",
  variables: {
    processDefinitionKey,
  },
  query: `
            query postPublishAction($processDefinitionKey: String!) {  
                postPublishAction(processDefinitionKey: $processDefinitionKey)  { 
                  nextActions  {
                    isAllowed
                    key
                    message
                    permissions
                    value
                    __typename     
                  }
                      __typename
                } 
            }
          `,
};