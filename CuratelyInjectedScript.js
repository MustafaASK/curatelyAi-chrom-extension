
var url = '';
var currentlySelectedURL = '';
var nameOfUser = '';
var resumeBase64 = "";
var tempJson = {
    name: "",
    jobtitle: "",
    location: "",
    summary: "",
    linkedinUrl: "",
    topSkills: [],
    certifications: [],
    experience: [],
    education: [],
    imgUrl: "",
    resumeBase64: ""
};
var months = ['Jan ', 'Feb ', 'Mar ', 'Apr ', 'May ', 'Jun ', 'July ', 'Aug ', 'Sept ', 'Oct ', 'Nov ', 'Dec '];

var pdfLoaded = false;
var isFromLinkedin = false;


// var reactURL = 'https://localhost:3000/src/index.html';
var reactURL = 'https://resume.accuick.com/curatelychromeextensionlinkedindemo/';

chrome.runtime.onMessage.addListener(
    function (msg, sender, sendResponse) {
        if (msg.localDataURL) {
            console.log('localData');
            console.log({ resumeDataURL: msg.dataURL });
        }
        if (msg.localDataURL || msg.loadData) {
            resumeBase64 = (msg.dataURL) ? msg.dataURL : "";
            tempJson.resumeBase64 = resumeBase64;
            tempJson.linkedinUrl = (window.location.pathname.startsWith('/talent/')) ? document.getElementsByClassName('personal-info__link')[0].getAttribute('href') : window.location.href;
            tempJson.name = (window.location.pathname.startsWith('/talent/')) ? (document.querySelector('[data-test-row-lockup-full-name]') && document.querySelector('[data-test-row-lockup-full-name]').textContent && document.querySelector('[data-test-row-lockup-full-name]').textContent.trim()) ? document.querySelector('[data-test-row-lockup-full-name]').textContent.trim() : "" : ($('.text-heading-xlarge').innerText) ? $('.text-heading-xlarge').innerText : $('.text-heading-xlarge').eq(0).text() ? $('.text-heading-xlarge').eq(0).text() : "";
            // if (msg.dataURL) {
            // }
            // if (!tempJson.resumeBase64) {
            //     resumeBase64 = "";
            // }
            // initialLoad();
            sendDataFromExtensionToIframe({ passingDataFromCurately: true, json: tempJson });
            sendResponse({
                message: "Loading complete"
            });
            isFromLinkedin = true;
        } else if (msg.pdfPath) {
            console.log(msg);
            sendDataFromExtensionToIframe(msg);
            sendResponse({
                message: "PDF Called"
            });
        } else if (msg.responseText) {
            console.log(msg.responseText);
            sendResponse({
                message: "Loading complete"
            });
        }
    }
);
var initialLoad = function () {
    console.log("initialLoad");
    console.log('page send message: ' + new Date().getMilliseconds());


    tempJson = {
        name: "",
        // (window.location.pathname.startsWith('/talent/')) ? (document.querySelector('[data-test-row-lockup-full-name]') && document.querySelector('[data-test-row-lockup-full-name]').textContent && document.querySelector('[data-test-row-lockup-full-name]').textContent.trim()) ? document.querySelector('[data-test-row-lockup-full-name]').textContent.trim() : "" : ($('.text-heading-xlarge').innerText) ? $('.text-heading-xlarge').innerText : $('.text-heading-xlarge').eq(0).text() ? $('.text-heading-xlarge').eq(0).text() : "",
        jobtitle: "",
        location: "",
        summary: "",
        linkedinUrl: "",
        topSkills: [],
        certifications: [],
        experience: [],
        education: [],
        imgUrl: "",
        resumeBase64: resumeBase64
    }
    if (window.location.pathname.startsWith('/talent/')) {
        // loadDataFromRecruiterSearch();
        tempJson.linkedinUrl = document.getElementsByClassName('personal-info__link') && document.getElementsByClassName('personal-info__link').length && document.getElementsByClassName('personal-info__link')[0].getAttribute('href');
    }
    else {
        // loadScroll();
        tempJson.linkedinUrl = window.location.href;
    }
    loadIframeUrl(true);
}


function loadIframeUrl(reload) {
    console.log("loadIframeUrl");
    if (reload) {
        resumeBase64 = '';
        tempJson.resumeBase64 = '';
    }
    // if ($('#accuickCuratelyChromeExtensionDiv').length) {
    //     // $('#accuickCuratelyChromeExtensionDiv').remove();
    //     $('#accuickCuratelyChromeExtensionDiv').css('display', 'none');
    // }


    if (
        window.location.href.includes('www.linkedin.com')
        &&
        (
            (
                window.location.pathname.startsWith('/talent/') && document.getElementsByClassName('personal-info__link') && document.getElementsByClassName('personal-info__link').length && document.getElementsByClassName('personal-info__link')[0].getAttribute('href')
            ) || (document.querySelectorAll("[aria-label='More actions']")?.length > 1)
            // ) || document.querySelector("[aria-label='More actions']")
        )
    ) {
        // ${reload ? '' : 'minimizedDiv'}
        if ($('#accuickCuratelyChromeExtensionDiv').length) {
            $('#accuickCuratelyChromeExtensionDiv').css('display', 'block');
            sendDataFromExtensionToIframe({ passingDataFromCurately: true, json: tempJson, loadInitialData: true });

            // $('#accuickCuratelyChromeExtensionIframe')[0]?.contentWindow?.location?.replace(reactURL);
        } else {
            $('body').append(`<div class="accuickCuratelyChromeExtensionDiv minimizedDiv" id="accuickCuratelyChromeExtensionDiv"><iframe id="accuickCuratelyChromeExtensionIframe" allow="clipboard-read; clipboard-write" src="${reactURL}"  title="Curately Chrome Extension Iframe"></iframe>` + stylesForCuratelyIFrame + `</div>`);
            // https://resume.accuick.com/curatelychromeextensionlinkedin/
            // https://localhost:3000/src/index.html

            // https://resume.accuick.com/CuratelyChromeExtension/index.html?v=' + new Date().toISOString() + '
        }
    }
}
function sendDataFromExtensionToIframe(data) {
    console.log("sendDataFromExtensionToIframe");
    const iframe = document.getElementById("accuickCuratelyChromeExtensionIframe");
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(data, "*");
    } else {
        loadIframeUrl();
        if (data.json && data.json.resumeBase64) {
            setTimeout(() => {
                sendDataFromExtensionToIframe(data);
            }, 3000);
        }
    }
}

function showDownloadPDFIntro() {
    console.log("showDownloadPDFIntro");
    if (document.querySelectorAll("[aria-label='More actions']")?.length > 1 || document.querySelector("[data-walkme-id='profile-more-actions'] .more-actions__trigger")) {
        let element = document.querySelectorAll(".artdeco-button--2[aria-label='More actions']")[1] ? document.querySelectorAll(".artdeco-button--2[aria-label='More actions']")[1] : document.querySelector("[data-walkme-id='profile-more-actions'] .more-actions__trigger");
        introJs().setOptions({
            showButtons: false,
            showBullets: false,
            steps: [{
                element: element,
                intro: "Click here and select Save to PDF from the list"
            }]
        }).start();
    }
}

window.addEventListener('message', async function (event) {
    if (event?.data?.initialLoad) {
        sendDataFromExtensionToIframe({ passingDataFromCurately: true });
        console.log("Message received from the child: " + event.data);
    }
    if (event?.data?.dataFromIframeToCurately) {
        let isLogin = await chrome.storage.sync.get(['login']);
        if (isLogin?.login) {
            await chrome.storage.sync.remove('login');
        } else {
            await chrome.storage.sync.set({ login: true });
        }
        sendDataFromExtensionToIframe({ passingDataFromCurately: true, json: tempJson, loadInitialData: true });
        console.log("Message received from the child: " + event.data);
    }
    if (event?.data?.expandIframeWidth) {
        $('#accuickCuratelyChromeExtensionDiv').css("width", "330px !important");
    }
    if (event?.data?.showDownloadPDFIntro) {
        showDownloadPDFIntro();
    }
    if (event?.data?.collapseIframeWidth) {
        $('#accuickCuratelyChromeExtensionDiv').css("width", "500px !important");
    }
    if (event?.data?.closeIframeCurately) {
        if ($('#accuickCuratelyChromeExtensionDiv').length) {
            // $('#accuickCuratelyChromeExtensionDiv').remove();
            $('#accuickCuratelyChromeExtensionDiv').css('display', 'none');
            $('#searchlistPopupDivClass').css('display', 'none');
            document.getElementById('accuickCuratelyChromeExtensionDiv').classList.add('minimizedDiv');
            console.log('none');
        }
    }
    if (event?.data?.maximizeDiv) {
        if (document.getElementById('accuickCuratelyChromeExtensionDiv') && document.getElementById('accuickCuratelyChromeExtensionDiv').classList.contains('minimizedDiv')) {
            document.getElementById('accuickCuratelyChromeExtensionDiv').classList.remove('minimizedDiv');
        }
    }
    if (event?.data?.minimizeDiv) {
        if (document.getElementById('accuickCuratelyChromeExtensionDiv')) {
            document.getElementById('accuickCuratelyChromeExtensionDiv').classList.add('minimizedDiv');
        }
    }
    if (event?.data?.reloadEntireIframe) {
        loadIframeUrl(true);
    }
    if (event?.data?.reloadAllDataFromCurately) {
        resumeBase64 = "";
        tempJson.resumeBase64 = resumeBase64;
        tempJson.linkedinUrl = (window.location.pathname.startsWith('/talent/')) ? document.getElementsByClassName('personal-info__link')[0].getAttribute('href') : window.location.href;
        tempJson.name = "";
        // (window.location.pathname.startsWith('/talent/')) ? (document.querySelector('[data-test-row-lockup-full-name]') && document.querySelector('[data-test-row-lockup-full-name]').textContent && document.querySelector('[data-test-row-lockup-full-name]').textContent.trim()) ? document.querySelector('[data-test-row-lockup-full-name]').textContent.trim() : "" : ($('.text-heading-xlarge').innerText) ? $('.text-heading-xlarge').innerText : $('.text-heading-xlarge').eq(0).text() ? $('.text-heading-xlarge').eq(0).text() : "";

        sendDataFromExtensionToIframe({ passingDataFromCurately: true, json: tempJson });
        // sendResponse({
        //     message: "Loading complete"
        // });
        isFromLinkedin = true;
        if (document.getElementById('accuickCuratelyChromeExtensionDiv')) {
            document.getElementById('accuickCuratelyChromeExtensionDiv').classList.add('minimizedDiv');
        }
    }
    if (event?.data?.refreshVersion) {
        if ($('#accuickCuratelyChromeExtensionDiv').length) {
            $('#accuickCuratelyChromeExtensionDiv').remove();
        }
    }


});
// window.addEventListener('popstate', function (event) {
//     // Log the state data to the console
//     console.log(event.state);
// });

setInterval(() => {
    const currUrl = window.location.pathname.startsWith('/talent/') ? (document.getElementsByClassName('personal-info__link') && document.getElementsByClassName('personal-info__link').length && document.getElementsByClassName('personal-info__link')[0].getAttribute('href')) ? document.getElementsByClassName('personal-info__link')[0].getAttribute('href') : "asd" : window.location.href;


    // console.log(str.includes(substr));

    if (currUrl && (currUrl !== currentlySelectedURL)) {
        // URL changed

        currentlySelectedURL = currUrl;
        console.log(`URL changed to : ${currUrl}`);
        sendDataFromExtensionToIframe({ reloadAllDataFromCurately: true });

        if (/^(ftp|http|https):\/\/(?:www\.)?linkedin.com\/(in|pub)\/[a-zA-Z0-9_-]+\/?$/.test(currUrl)) {
            // if (currUrl !== currentlySelectedURL) {
            // console.log('Valid LinkedIn URL');
            setTimeout(() => {
                initialLoad();
                $('#accuickCuratelyChromeExtensionDiv').css('display', 'block');
                console.log('block');
            }, 1500);
            // }
        } else {
            if ($('#accuickCuratelyChromeExtensionDiv').length) {
                // $('#accuickCuratelyChromeExtensionDiv').remove();
                $('#accuickCuratelyChromeExtensionDiv').css('display', 'none');
                document.getElementById('accuickCuratelyChromeExtensionDiv').classList.add('minimizedDiv');
                console.log('none');
            }
        }
    }
}, 60);

$(document).ready(function () {

    if (window.location.href.includes('www.linkedin.com')) {
        setTimeout(() => {
            $('body').append(`<div class="accuickCuratelyChromeExtensionDiv minimizedDiv" id="accuickCuratelyChromeExtensionDiv"><iframe id="accuickCuratelyChromeExtensionIframe" allow="clipboard-read; clipboard-write" src="${reactURL}"  title="Curately Chrome Extension Iframe"></iframe>` + stylesForCuratelyIFrame + `</div>`);
            // https://resume.accuick.com/curatelychromeextensionlinkedin/
            // https://localhost:3000/src/index.html

            // https://resume.accuick.com/CuratelyChromeExtension/index.html?v=' + new Date().toISOString() + '
            initialLoad();
            chrome.runtime.sendMessage({
                isLinkedinCurately: window.location.href.includes('www.linkedin.com')
            }, function (response) {
                if (chrome.runtime.lastError) {
                    console.error("Error:", chrome.runtime.lastError.message);
                } else {
                    console.log("Response from background script:", response.response);
                }
            });
        }, 1000);
        $(document).on("click", ".closePopup", function () {
            if ($('#accuickCuratelyChromeExtensionDiv').length) {
                // $('#accuickCuratelyChromeExtensionDiv').remove();
                $('#accuickCuratelyChromeExtensionDiv').css('display', 'none');
                document.getElementById('accuickCuratelyChromeExtensionDiv').classList.add('minimizedDiv');
                console.log('none');
            }
        });
    }
    // setInterval(() => {
    //     let tempLinkedinUrl = (window.location.pathname.startsWith('/talent/')) ? document.getElementsByClassName('personal-info__link')[0]?.getAttribute('href') : window.location.href;
    //     if (tempLinkedinUrl && document.getElementById("accuickCuratelyChromeExtensionIframe")) {
    //         sendDataFromExtensionToIframe({
    //             linkedinUrlToCheck: tempLinkedinUrl,
    //             checkLinkedinCurately: true
    //         })
    //     }
    // }, 1000);

});

const stylesForCuratelyIFrame = `<style>
#accuickCuratelyChromeExtensionDiv{
    position: fixed;
    top: 0px;
    right: 0px;
    width: 330px;
    z-index: 99999999;
    height: 100vh;
    overflow: auto;
    background: white;
    -webkit-box-shadow: -2px 0px 6px 0px rgba(167,167,167,1);
    -moz-box-shadow: -2px 0px 6px 0px rgba(167,167,167,1);
    box-shadow: -2px 0px 6px 0px rgba(167,167,167,1);
    display: none;
}
.minimizedDiv{
    width: 140px !important;
    position: fixed !important;
    top: 50% !important;
    height: 400px !important;
    margin-top: -200px !important;
    right: 0px !important;
    border-radius: 20px 0px 0px 20px !important;
    overflow: hidden !important;
    background-color: rgb(255, 255, 255) !important;
    box-shadow: rgba(0, 0, 0, 0.25) 1px 0px 6px 2px !important;
    border-top: 1px solid rgb(210, 214, 220) !important;
    border-right: none !important;
    border-bottom: 1px solid rgb(210, 214, 220) !important;
    border-left: 1px solid rgb(210, 214, 220) !important;
    border-image: initial !important;
}
#accuickCuratelyChromeExtensionDiv iframe{
    width: 100%;
    height: calc(100vh - 6px);
}
#accuickCuratelyChromeExtensionDiv .spinner-border {
    height: 50px;
    width: 50px;
    z-index: 9999;
    color: #17a2b8 !important;
    display: inline-block;
    vertical-align: text-bottom;
    border: .25em solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    -webkit-animation: spinner-border .75s linear infinite;
    animation: spinner-border .75s linear infinite;
}
#accuickCuratelyChromeExtensionDiv .loader{
    position: absolute;
    top: calc(50% - 25px);
    left: calc(50% - 25px);
}
.d-flexjustify-content-between{
}

#headerDiv {
    display: flex!important;   
    -ms-flex-pack: justify!important;
    justify-content: space-between!important;
    height: 35px;
    width: 100%;
    top: 0;
    background-color: #5952ff;
    -webkit-box-shadow: 0px 5px 5px 0px rgba(238, 238, 238, 1);
    -moz-box-shadow: 0px 5px 5px 0px rgba(238, 238, 238, 1);
    box-shadow: 0px 5px 5px 0px rgba(238, 238, 238, 1);
    padding: 8px 8px;
    z-index: 999999;
}
.d-flex.justify-content-start{
    display: flex!important;   
    -ms-flex-pack: justify!important;
    justify-content: flex-start!important;
}
.closePopup{
    color: white;
}
@keyframes spinner-border {
    to {
        transform: rotate(360deg);
    }
}
.introjs-tooltiptext {
    padding-top: 0 !important;
}
.introjs-skipbutton{
    color: white !important;
}
.introjs-tooltip{
    background-color: #7aa2ca !important;
    color: white !important;
}
.introjs-arrow.top{
    border-bottom-color: #bdc9d6 !important;
}
</style>
`;



chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === "SEND_CONNECTION_REQUEST") {
        if (message.data.url.startsWith("https://www.linkedin.com/voyager/api/voyagerRelationshipsDashMemberRelationships?action=verifyQuotaAndCreateV2&decorationId=com.linkedin.voyager.dash.deco.relationships.InvitationCreationResultWithInvitee-2")) {
            let id = split_profile_id(message.data.requestBody.invitee.inviteeUnion.memberProfile, 0);
            let send_message = message.data.requestBody?.customMessage;
            start_scraping(id, send_message);
        } else {
            let id = split_profile_id(message.data.url, 1);
            start_scraping(id);
        }
    }
})


function split_profile_id(raw_id, get_part) {
    return raw_id.split("urn:li:fsd_profile:")[get_part] != '' ? raw_id.split("urn:li:fsd_profile:")[get_part] : raw_id.split("urn:li:fsd_profile:")[get_part + 1];
}

function start_scraping(id, message = null) {
    let send_connect_request_details = {
        linkedin_url: '',
        profile_name: '',
        job_title: '',
        location: '',
        send_message: '',
        sent_by: ''
    }

    send_connect_request_details.sent_by = document.querySelector('.global-nav__me-photo').getAttribute("alt");
    send_connect_request_details.send_message = message;
    const elementsWithHref = document.querySelectorAll('a[href]');
    for (let i = 0; i < elementsWithHref.length; i++) {
        if (elementsWithHref[i].href.includes("_miniProfile%3A" + id)) {
            let parent_element = elementsWithHref[i].parentElement.parentElement.parentElement;
            if (parent_element) {
                send_connect_request_details.location = elementsWithHref[i]?.parentElement?.parentElement?.parentElement?.querySelector(".entity-result__secondary-subtitle")?.textContent?.trim();
                send_connect_request_details.profile_name = elementsWithHref[i]?.parentElement?.parentElement?.parentElement?.querySelector('.t-roman.t-sans [aria-hidden="true"]')?.textContent?.trim();
                send_connect_request_details.job_title = elementsWithHref[i]?.parentElement?.parentElement?.parentElement?.querySelector(".entity-result__primary-subtitle")?.textContent?.trim();
                send_connect_request_details.linkedin_url = elementsWithHref[i].href
            }
            break;
        }
    }
    console.log(send_connect_request_details);
}