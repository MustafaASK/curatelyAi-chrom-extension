const DEBUG = false;

let network_filter_requests = ['https://www.linkedin.com/voyager/api/feed/dash/followingStates/urn:li:fsd_followingState:urn:li:fsd_profile','https://www.linkedin.com/voyager/api/voyagerRelationshipsDashMemberRelationships?action=verifyQuotaAndCreateV2&decorationId=com.linkedin.voyager.dash.deco.relationships.InvitationCreationResultWithInvitee-2']

importScripts(
    "lib/lodash.min.js",
    "storage-util.js",
    "downloads.js"
);

Downloads.DEBUG = DEBUG;
StorageMixin.DEBUG = DEBUG;


Downloads.validExtensions = "pdf";

chrome.cookies.getAll({ domain: "resume.accuick.com" }, (cookies) => {
})

chrome.downloads.onCreated.addListener(downloadItem => {
    Downloads.onCreatedListener(downloadItem);
});

chrome.downloads.onChanged.addListener(downloadDelta => {
    Downloads.onChangedListener(downloadDelta);
});

// Define the listener function
function onCompletedListener(details) {
    let requestData ={
        url:details.url,
        requestBody:''
    } 
    if(details.url.startsWith(network_filter_requests[0]) || details.url.startsWith(network_filter_requests[1])){
        // Check if the request has a request body
        if (details.requestBody && details.requestBody.raw && details.requestBody.raw.length > 0) {
            const bytes = new Uint8Array(details.requestBody.raw[0].bytes);

            // Convert bytes to string
            const decoder = new TextDecoder('utf-8');
            const jsonString = decoder.decode(bytes);

            // Parse string into JSON
            try {
                requestData.requestBody = JSON.parse(jsonString);
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
            
        }

        chrome.tabs.sendMessage(details.tabId, { type:"SEND_CONNECTION_REQUEST",data: requestData }, function(response) {
        });

    }
  }
  
  // Define filter criteria
  const filter = {urls: ['https://www.linkedin.com/voyager/*']};
  
  // Define extra info specifications
  const extraInfoSpec = ["requestBody"];
  
  // Add listener using chrome.webRequest.onCompleted.addListener
  chrome.webRequest.onBeforeRequest.addListener(onCompletedListener,filter,extraInfoSpec);
  

// setTimeout(() => {
//     chrome.tabs.query({
//         active: true,
//         currentWindow: true
//     }, function (tabs) {
//         if (tabs[0] && tabs[0].id) {
//             chrome.tabs.sendMessage(
//                 tabs[0].id,
//                 {
//                     localData: true
//                 },
//                 function (response) {
//                     console.log('ext send message: ' + new Date().getMilliseconds());
//                     console.log(response);
//                     // window.close();
//                 }
//             );
//         }
//     });
// }, 100);