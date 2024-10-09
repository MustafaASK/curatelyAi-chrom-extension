// globle variables--------------------------------------------
var searchList = [];
var emailPhoneData = [];
const quill = new Quill('#editor', {
    theme: 'snow'
});
var bar = new ProgressBar.Line("#progressContainer", {
    strokeWidth: 4,
    easing: 'easeInOut',
    duration: 1400,
    color: '#146ef6',
    trailColor: '#eee',
    trailWidth: 1,
    svgStyle: { width: '100%', height: '100%' }
});
var connect_svg =
    `<svg style="margin-right: 5px;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people" viewBox="0 0 16 16">
    <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
</svg>`;

var message_svg =
    `<svg style="margin-right: 5px;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-left-dots" viewBox="0 0 16 16">
  <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
  <path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
</svg>`;
// globle variables--------------------------------------------

const checkIsChecked = () => {
    const isAllChecked = Array.from(document.querySelectorAll('[id^="CK_BOX_"]')).every(a => a.checked);
    if (isAllChecked && !document.querySelector('[id="first_connection"]').checked && !document.querySelector('[id="second_connection"]').checked) {
        document.getElementById("select_all").checked = true;
    } else {
        document.getElementById("select_all").checked = false;
    }
    const isChecked = Array.from(document.querySelectorAll('[id^="CK_BOX_"]')).some(a => a.checked);
    document.querySelector(".bottom-done_btn").style.display = isChecked ? "block" : "none";
};

setInterval(checkIsChecked, 200);

// form_container
const closePopup = (close = true) => {
    var hidepopup = null;
    if (close) {
        hidepopup = () => {
            document.getElementById("searchlistPopupDivClass").style.display = "none";
            document.getElementById("curtly_drag_drop_btn").style.display = "flex";
        }
    } else {
        hidepopup = () => {
            document.getElementById("searchlistPopupDivClass").style.display = "block";
            document.getElementById("curtly_drag_drop_btn").style.display = "none";
        }
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: hidepopup,
        })
            .then(() => { });
    });
}

document.getElementById("closePopup").addEventListener("click", closePopup);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "DELETE_CHECKBOX") {
        document.getElementById("CK_BOX_" + request.data).parentElement.remove();
        sendResponse(true);
    }
    if (request.type === "LIST_OF_SEARCHES") {
        document.getElementById('first_connection').checked = false;
        document.getElementById('second_connection').checked = false;
        document.querySelector('.ovrly').style.display = "flex";
        try {
            searchList = request?.data;
            closePopup(false);
            const profilesContainer = document.getElementById('list_of_search');
            let index = 0;
            profilesContainer.innerHTML = '';
            if (searchList.length == 0 || searchList == null) {
                chrome.storage.sync.get(['actionType']).then((actionType) => {
                    if (actionType['actionType'] == 'SEND_REQUEST') {
                        document.querySelector('#connection_not_found').style.display = "block";
                    } else if (actionType['actionType'] == 'SEND_MESSAGES') {
                        document.querySelector('#message_not_found').style.display = "block";
                    }
                });
            } else {
                document.querySelector('#connection_not_found').style.display = "none";
                document.querySelector('#message_not_found').style.display = "none";
            }

            getEmailPhoneData(request?.data).then(() => {
                _.forEach(request?.data, async (profile) => {
                    profile.hasMobile = false;
                    profile.hasEmail = false;
                    profile.userId = null;

                    emailPhoneData?.forEach((a) => {
                        if (profile.linkedin_url.toLowerCase().startsWith(a.linkedinUrl.toLowerCase())) {
                            if (a.userId) {
                                profile.userId = a.userId
                            }
                        }
                    });

                    const profileCard = document.createElement('div');
                    profileCard.className = 'profile-card';
                    if (request?.data.length - 1 == index) {
                        profileCard.classList.add('mb-100px');
                    }

                    const profileHeader = document.createElement('div');
                    profileHeader.className = 'profile-header';

                    const checkboxContainer = document.createElement('div');
                    checkboxContainer.style.padding = '10px';
                    checkboxContainer.style.marginLeft = '-18px';
                    checkboxContainer.style.transform = 'scale(1.7)';

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'form-control';
                    checkbox.id = "CK_BOX_" + profile.id;
                    checkbox.setAttribute("data-url", profile.linkedin_url)
                    checkboxContainer.appendChild(checkbox);


                    const col2 = document.createElement('div');
                    col2.className = 'col-2';

                    const profileImage = document.createElement('img');
                    profileImage.src = profile.imageUri;
                    profileImage.alt = profile.name;
                    profileImage.className = 'profile-image';

                    const profileDetails = document.createElement('div');
                    profileDetails.className = 'profile-details';

                    const profileName = document.createElement('div');
                    profileName.className = 'profile-name';
                    profileName.textContent = profile.name;

                    const profileLocation = document.createElement('div');
                    profileLocation.className = 'f-12 profile-location';
                    profileLocation.textContent = profile.location;

                    const profileLink = document.createElement("a")
                    profileLink.className = 'profile-name profile-link';
                    profileLink.textContent = profile.name;
                    profileLink.setAttribute("target", "_blank");
                    profileLink.setAttribute("href", `https://appqa.curately.ai/#/qademo/candidate/view/` + profile.userId)
                    col2.appendChild(profileImage);
                    if (profile.userId) {
                        profileDetails.appendChild(profileLink);
                    }
                    else {
                        profileDetails.appendChild(profileName);
                    }

                    profileDetails.appendChild(profileLocation);

                    if (profile.allowToCheck) {
                        profileHeader.appendChild(checkboxContainer);
                    }
                    profileHeader.appendChild(col2);
                    profileHeader.appendChild(profileDetails);

                    profileCard.appendChild(profileHeader);

                    const profileJobTitle = document.createElement('div');
                    profileJobTitle.className = 'f-12 profile-job-title';
                    profileJobTitle.textContent = profile.job_title;

                    profileCard.appendChild(profileJobTitle);


                    emailPhoneData?.forEach((a) => {
                        if (profile.linkedin_url.toLowerCase().startsWith(a.linkedinUrl.toLowerCase())) {
                            if (a.email) {
                                const email_main_div = document.createElement('div');
                                email_main_div.className = 'f-12 email_main_div d-flex-align-items-center my-1';

                                const email_label = document.createElement('b');
                                email_label.className = 'email_label mx-1';
                                email_label.textContent = "Email:";
                                email_main_div.appendChild(email_label);

                                const email = document.createElement('div');
                                email.className = 'email';
                                email.textContent = a.email;
                                email_main_div.appendChild(email);

                                profileCard.appendChild(email_main_div);

                                profile.hasEmail = true;
                            }


                            // if (a.phone) {
                            //     const phone_main_div = document.createElement('div');
                            //     phone_main_div.className = 'f-12 phone_main_div d-flex-align-items-center my-1';

                            //     const phone_label = document.createElement('b');
                            //     phone_label.className = 'phone_label mx-1';
                            //     phone_label.textContent = "Phone:";
                            //     phone_main_div.appendChild(phone_label);

                            //     const phone = document.createElement('div');
                            //     phone.className = 'phone';
                            //     phone.textContent = a.phone;
                            //     phone_main_div.appendChild(phone);

                            //     profileCard.appendChild(phone_main_div);
                            //     profile.hasMobile = true;
                            // }

                        }
                    })
                    let email_icon_style = ``;
                    if (profile.hasEmail) {
                        email_icon_style = `border: 1px solid;
                            padding: 5px;
                            display: flex;
                            justify-content: center;
                            cursor: pointer;
                            align-items: center;
                            border-top-left-radius: 5px;
                            border-bottom-left-radius: 5px;`
                    }
                    else {
                        email_icon_style = `border: 1px solid #999999;
                        background-color: #cccccc;
                        color: #666666;
                            padding: 5px;
                            display: flex;
                            justify-content: center;
                            cursor: pointer;
                            align-items: center;
                            border-top-left-radius: 5px;
                            border-bottom-left-radius: 5px;`
                    }

                    let mobile_icon_style = ``;
                    if (profile.hasMobile) {
                        mobile_icon_style = `
                        border: 1px solid;
                        padding: 5px;
                        display: flex;
                        cursor: pointer;
                        justify-content: center;
                        align-items: center;
    
                        `
                    }
                    else {
                        mobile_icon_style = `
                        border: 1px solid #999999;
                         background-color: #cccccc;
                         color: #666666;
                         padding: 5px;
                         display: flex;
                         cursor: pointer;
                         justify-content: center;
                         align-items: center;
                         `

                    }

                    if (profile.saved) {

                        const email_menu = document.createElement('div');
                        email_menu.className = 'email-menu email-open-modal';
                        email_menu.setAttribute('style', email_icon_style);
                        if (!profile.hasEmail) {
                            email_menu.setAttribute('title', "Upgrade to get email");
                        }
                        else {
                            email_menu.removeAttribute("title")
                        }
                        email_menu.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="mx-3 bi bi-envelope-at" viewBox="0 0 16 16">
                                <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2zm3.708 6.208L1 11.105V5.383zM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2z"/>
                                <path d="M14.247 14.269c1.01 0 1.587-.857 1.587-2.025v-.21C15.834 10.43 14.64 9 12.52 9h-.035C10.42 9 9 10.36 9 12.432v.214C9 14.82 10.438 16 12.358 16h.044c.594 0 1.018-.074 1.237-.175v-.73c-.245.11-.673.18-1.18.18h-.044c-1.334 0-2.571-.788-2.571-2.655v-.157c0-1.657 1.058-2.724 2.64-2.724h.04c1.535 0 2.484 1.05 2.484 2.326v.118c0 .975-.324 1.39-.639 1.39-.232 0-.41-.148-.41-.42v-2.19h-.906v.569h-.03c-.084-.298-.368-.63-.954-.63-.778 0-1.259.555-1.259 1.4v.528c0 .892.49 1.434 1.26 1.434.471 0 .896-.227 1.014-.643h.043c.118.42.617.648 1.12.648m-2.453-1.588v-.227c0-.546.227-.791.573-.791.297 0 .572.192.572.708v.367c0 .573-.253.744-.564.744-.354 0-.581-.215-.581-.8Z"/>
                            </svg>
                        `;

                        const mobile_menu = document.createElement('div');
                        mobile_menu.className = 'mobile_menu';
                        mobile_menu.setAttribute('style', mobile_icon_style);
                        if (!profile.hasMobile) {
                            mobile_menu.setAttribute('title', "Upgrade to get mobile");
                        }
                        else {
                            mobile_menu.removeAttribute("title")
                        }
                        mobile_menu.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="mx-3 bi bi-telephone" viewBox="0 0 16 16">
                                <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"/>
                            </svg>
                        `;

                        const save_menu = document.createElement('div');
                        save_menu.className = 'email-menu';
                        save_menu.setAttribute('style', `
                            border: 1px solid;
                            padding: 5px;
                            display: flex;
                            cursor: pointer;
                            justify-content: center;
                            align-items: center;`
                        );
                        save_menu.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="mx-3 bi bi-person-lines-fill" viewBox="0 0 16 16">
                                <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1z"/>
                            </svg>
                        `;

                        const send_menu = document.createElement('div');
                        send_menu.className = 'send-menu';
                        send_menu.setAttribute('style', `
                            border: 1px solid;
                            padding: 5px;
                            display: flex;
                            cursor: pointer;
                            justify-content: center;
                            align-items: center;`
                        );
                        send_menu.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="mx-3 bi bi-send" viewBox="0 0 16 16">
                                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
                            </svg>
                        `;

                        const three_dots = document.createElement('div');
                        three_dots.className = 'three-dots-menu';
                        three_dots.setAttribute('style', `
                            border: 1px solid;
                            padding: 5px;
                            display: flex;
                            cursor: pointer;
                            justify-content: center;
                            border-top-right-radius: 5px;
                            border-bottom-right-radius: 5px;
                            align-items: center;`
                        );
                        three_dots.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="mx-3 bi bi-three-dots" viewBox="0 0 16 16">
                                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                            </svg>
                        `;

                        const main_div_of_menus = document.createElement('div');
                        main_div_of_menus.className = 'main-div-of-menus my-5';
                        main_div_of_menus.appendChild(email_menu);
                        // main_div_of_menus.appendChild(mobile_menu);
                        main_div_of_menus.appendChild(save_menu);
                        main_div_of_menus.appendChild(send_menu);
                        main_div_of_menus.appendChild(three_dots);
                        main_div_of_menus.setAttribute('style', `display: flex;align-items: center;`);

                        profileCard.appendChild(main_div_of_menus);

                    } else {
                        const email_menu = document.createElement('div');
                        email_menu.className = 'email-menu email-open-modal';
                        email_menu.setAttribute('style', email_icon_style);
                        if (!profile.hasEmail) {
                            email_menu.setAttribute('title', "Upgrade to get email");
                        }
                        else {
                            email_menu.removeAttribute("title")
                        }
                        email_menu.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="mx-3 bi bi-envelope" viewBox="0 0 16 16">
                                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
                            </svg>
                        `;

                        const mobile_menu = document.createElement('div');
                        mobile_menu.className = 'mobile_menu';
                        mobile_menu.setAttribute('style', mobile_icon_style)
                        if (!profile.hasMobile) {
                            mobile_menu.setAttribute('title', "Upgrade to get mobile");
                        }
                        else {
                            mobile_menu.removeAttribute("title")
                        }
                        mobile_menu.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="mx-3 bi bi-telephone" viewBox="0 0 16 16">
                                <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"/>
                            </svg>
                        `;

                        const save_menu = document.createElement('div');
                        save_menu.className = 'email-menu';
                        save_menu.setAttribute('style', `
                            border: 1px solid;
                            padding: 5px;
                            display: flex;
                            font-size: 15px;
                            justify-content: center;
                            cursor: pointer;
                            align-items: center;
                            border-top-right-radius: 5px;
                            border-bottom-right-radius: 5px;`
                        );
                        save_menu.innerHTML = '<b class="mx-3">Save</b>';

                        const main_div_of_menus = document.createElement('div');
                        main_div_of_menus.className = 'main-div-of-menus my-5';
                        main_div_of_menus.appendChild(email_menu);
                        // main_div_of_menus.appendChild(mobile_menu);
                        main_div_of_menus.appendChild(save_menu);
                        save_menu.addEventListener(('click'), async () => {
                            console.log(profile, 'ffuuuuu')
                            const savedResp = await saveData([profile.linkedin_url.split("?")[0]]);
                            console.log(savedResp, "saav")
                            // profile.saved = true;

                            // chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
                            //     let tabId = tabs[0].id;
                            //     chrome.tabs.sendMessage(tabId, { type: "RE_CALL_METHOD_FOR_UPDATE_UI", data: searchList }, (response) => { })
                            // })
                        })
                        main_div_of_menus.setAttribute('style', `display: flex;align-items: center;`);

                        profileCard.appendChild(main_div_of_menus);
                    }

                    profilesContainer.appendChild(profileCard);
                    index++;
                });
            })

            sendResponse({ response: "Hello from background script" });
        } catch (e) {
            setTimeout(() => {
                document.querySelector('.ovrly').style.display = "none";
            }, 2000);
        }
        setTimeout(() => {
            document.querySelector('.ovrly').style.display = "none";
        }, 2000);

    }
    if (request.type === "PING") {
        sendResponse({ response: "Hello from background script" });
    }
});


const openLinkInNewTab = (url) => {
    window.open(url, '_blank');
}


document.getElementById('select_all').addEventListener('change', (data) => {
    document.getElementById('first_connection').checked = false;
    document.getElementById('second_connection').checked = false;
    if (data.target.checked) {
        document.querySelector(".bottom-done_btn").style.display = "block";
    } else {
        document.querySelector(".bottom-done_btn").style.display = "none";
    }
    document.querySelectorAll('[id^="CK_BOX_"]').forEach((a) => {
        a.checked = data.target.checked;
    })

    console.log(document.querySelectorAll('[id^="CK_BOX_"]'), 'lioooo')
})


// popup

// Get modal element
var modal = document.getElementById('myModal');

// Get open modal button
var openModalBtn = document.getElementById('openModalBtn');
var openModalBtn_svg = document.getElementById('openModalBtn_svg');

// Get close button
var closeBtn = document.getElementsByClassName('close')[0];

// Get submit button
var submitMessageBtn = document.getElementById('submitMessage');
var withoutMessage = document.getElementById('withoutMessage');

// Get textarea
var messageInput = document.getElementById('messageInput');

// var task_tab = document.getElementById('task_tab');

// var prospect_tab = document.getElementById('prospect_tab');

var first_connection = document.getElementById('first_connection');
var second_connection = document.getElementById('second_connection');


first_connection.addEventListener('change', async (e) => {
    second_connection.checked = false;
    document.getElementById("select_all").checked = false;
    document.querySelectorAll('[id^="CK_BOX_"]').forEach((a) => { a.checked = false; })
    if (e.target.checked) {
        await chrome.storage.sync.set({ 'actionType': 'SEND_MESSAGES' });
        first_connection.checked = true;
        document.querySelector('#openModalBtn').textContent = 'Messages'
        withoutMessage.style.display = 'none';
        submitMessageBtn.textContent = 'Start Send Messages';
        openModalBtn_svg.innerHTML = message_svg;
        searchList.forEach((a) => {
            if (a.is_first_connection) {
                document.querySelector(`#CK_BOX_${a.id}`).checked = true;
            }
        })
    }
})

second_connection.addEventListener('change', async (e) => {
    first_connection.checked = false;
    document.getElementById("select_all").checked = false;
    document.querySelectorAll('[id^="CK_BOX_"]').forEach((a) => { a.checked = false; })
    if (e.target.checked) {
        await chrome.storage.sync.set({ 'actionType': 'SEND_REQUEST' });
        second_connection.checked = true;
        document.querySelector('#openModalBtn').textContent = 'Connect'
        withoutMessage.style.display = 'block';
        submitMessageBtn.textContent = 'With Message';
        openModalBtn_svg.innerHTML = connect_svg;
        searchList.forEach((a) => {
            if (!a.is_first_connection) {
                document.querySelector(`#CK_BOX_${a.id}`).checked = true;
            }
        })
    }
})

// task_tab.addEventListener('click',()=>{

//     document.getElementById('prospect_tab_ele').style.display='none';
//     document.getElementById('task_tab_ele').style.display='block';

//     document.getElementById('prospect_tab_svg').style.fill='gray';
//     document.getElementById('prospect_tab_text').style.color='gray';

//     document.getElementById('task_tab_svg').style.fill='#146ef6';
//     document.getElementById('task_tab_text').style.color='#146ef6';
// });

// prospect_tab.addEventListener('click',()=>{

//     document.getElementById('prospect_tab_ele').style.display='block';
//     document.getElementById('task_tab_ele').style.display='none';

//     document.getElementById('task_tab_svg').style.fill='gray';
//     document.getElementById('task_tab_text').style.color='gray';

//     document.getElementById('prospect_tab_svg').style.fill='#146ef6';
//     document.getElementById('prospect_tab_text').style.color='#146ef6';
// });


// Open modal event
openModalBtn.onclick = function () {
    messageInput.value = '';
    modal.style.display = 'block';
}

// Close modal event
closeBtn.onclick = function () {
    modal.style.display = 'none';
}

// Close modal when clicking outside of it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Submit message event
submitMessageBtn.onclick = function () {
    var message = messageInput.value;
    if (message.trim()) {
        let filterList = filterListHowManyChecked();
        chrome.storage.sync.get(['actionType']).then((actionType) => {
            if (actionType['actionType'] == 'SEND_REQUEST') {
                start_send_request_process(filterList, message);
            } else if (actionType['actionType'] == 'SEND_MESSAGES') {
                start_send_message_process(filterList, message);
            }
        })
        modal.style.display = 'none';
    }
}

withoutMessage.onclick = () => {
    let filterList = filterListHowManyChecked();
    start_send_request_process(filterList);
    modal.style.display = 'none';
}

const filterListHowManyChecked = () => {
    const checkedItems = searchList.filter(item => {
        const checkbox = document.querySelector(`#CK_BOX_${item.id}`);
        return checkbox !== null && checkbox.checked;
    });

    return checkedItems;
};




const start_send_request_process = (filterList, message = null) => {
    if (filterList.length > 0) {
        let requestData = {
            filterList: filterList,
            message: message,
            type: "SEND_REQUEST"
        }
        chrome.tabs.getCurrent((tab) => {
            chrome.tabs.sendMessage(tab.id, requestData, (response) => {
            })
        })
    }
}

const start_send_message_process = (filterList, message = null) => {
    if (filterList.length > 0) {
        let requestData = {
            filterList: filterList,
            message: message,
            type: "SEND_MESSAGES"
        }
        chrome.tabs.getCurrent((tab) => {
            chrome.tabs.sendMessage(tab.id, requestData, (response) => {
            })
        })
    }
}


// let sendRequest = document.getElementById('sendRequest');
// let sendMessages = document.getElementById('sendMessages');

// sendRequest.addEventListener('click',async()=>{
//     await chrome.storage.sync.set({'actionType':'SEND_REQUEST'});
//     document.querySelector('#openModalBtn').textContent='Send Request'
//     withoutMessage.style.display='block';
//     submitMessageBtn.textContent='With Message';
// })

// sendMessages.addEventListener('click',async()=>{
//     await chrome.storage.sync.set({'actionType':'SEND_MESSAGES'});
//     document.querySelector('#openModalBtn').textContent='Send Messages'
//     withoutMessage.style.display='none';
//     submitMessageBtn.textContent='Start Send Messages';
// })


let createNewTask = document.getElementById('createNewTask');
createNewTask.addEventListener('click', (a) => {
    // get current tab id
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        let tabId = tabs[0].id;

        // Insert CSS file into the active tab
        await chrome.scripting.insertCSS({
            target: { tabId: tabId },
            files: ['createTask.css']
        });

        // Insert JS file into the active tab
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['createTask.js']
        });
    });
})

async function getContactDetails(linkedinUrls) {
    const url = 'https://qaadminapi.curately.ai/curatelyAdmin/hasContactDetails';
    const clientId = 3;

    const data = {
        linkedinUrl: linkedinUrls,
        clientId: clientId
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'insomnia/9.3.3'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function saveData(linkedinUrls) {
    const url = 'https://qaadminapi.curately.ai/curatelyAdmin/saveLinkedinData ';
    const clientId = 3;
    let dataArr = []
    _.forEach(linkedinUrls, function (url) {
        dataArr.push({
            "url": url,
            "type": 1
        })
    })
    const data = {
        requestInfo: dataArr,
        clientId: clientId
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'insomnia/9.3.3'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}


const getEmailPhoneData = (data) => {
    return new Promise((resolve) => {
        getContactDetails(data.filter(a => a.linkedin_url && a.linkedin_url !== '').map(a => a.linkedin_url.split("?")[0]).filter(url => url && url !== '')).then(result => {
            emailPhoneData = result.data
            resolve(true);
        }).catch(() => {
            resolve(true);
        })
    })
}

const emailModal = document.getElementById("emailModal");

// const openEmailModalBtns = document.querySelectorAll('.email-menu');

// Get the close button
const closeMailBtn = document.getElementsByClassName("close-mail")[0];

// Get modal title and content elements


// Loop through all open modal buttons and add event listeners
const templateListElement = document.getElementById("templateList");
const templateTypeEle = document.getElementById("mySelect");
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("list_of_search").addEventListener("click", async function (event) {
        // Check if a button was clicked
        if (event.target !== this) {
            return;  // Let the checkbox handle its own click event
        }
        event.preventDefault();
        // event.stopPropagation();
        console.log("is click")
        if ((event.target && event.target.classList.contains("email-menu")) || (event.target && event.target.classList.contains("bi-envelope"))) {
            console.log("is click com")
            const templateData = await getTemplates("AllEmailTemplates");
            setTempalteData(templateData)



            // Show the modal
            emailModal.style.display = "block";
        }
    }, true)
});

function setTempalteData(templatesList) {
    if (templatesList && templatesList.TemplatesAutoComplete.length > 0) {
        _.forEach(templatesList?.TemplatesAutoComplete, function (template) {
            const optionEle = document.createElement("option")
            optionEle.setAttribute("value", template.templateId)
            optionEle.textContent = template.templateName;
            templateListElement.appendChild(optionEle)

        })
    }
    else {
        const optionEle = document.createElement("option")
        optionEle.setAttribute("value", "")
        optionEle.textContent = "No templates found";
        templateListElement.appendChild(optionEle)
    }
}

templateTypeEle.addEventListener("change", async function (event) {
    const templateData = await getTemplates(templateTypeEle.value);
    templateListElement.replaceChildren();
    setTempalteData(templateData);
})

async function getTemplates(type) {
    const url = 'https://qaadminapi.curately.ai/curatelyAdmin/searchTemplates';
    const clientId = 3;

    const data = {
        clientId,
        "templateName": "",
        "type": type
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'insomnia/9.3.3'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }

}

// Close the modal when the user clicks on (X)
closeMailBtn.onclick = function () {
    emailModal.style.display = "none";
}
const closeProgressBtn = document.getElementsByClassName("close-progress-modal")[0];


const addTocuratelyBtn = document.getElementById("addToCuratelyBtn")
addTocuratelyBtn.addEventListener("click", addToCurately);

const progressModal = document.getElementById("progressModal");
const progressContent = document.getElementById("progressContent");

closeProgressBtn.onclick = function () {
    progressModal.style.display = "none";
}
async function addToCurately() {
    let checkedItems = document.querySelectorAll('[id^="CK_BOX_"]');
    let linkedInUrls = [];
    _.forEach(checkedItems, function (item) {
        if (item.checked) {
            linkedInUrls.push(item.dataset.url)
        }
    });
    let finalUrls = linkedInUrls.map(a => a.split("?")[0]).filter(url => url && url !== '');
    // let chars = ['A', 'B', 'A', 'C', 'B'];

    let uniqueUrls = finalUrls.filter((element, index) => {
        return finalUrls.indexOf(element) === index;
    });
    console.log(linkedInUrls, "linkedInUrls", finalUrls)
    progressContent.textContent = `Adding ${uniqueUrls.length} users`;
    progressModal.style.display = "block";

    bar.animate(0.5);
    bar.animate(0.8);

    const response = await saveData(uniqueUrls);
    bar.animate(1);
    bar.set(1.0)
    console.log(bar.value(), 'eeerr')
    if (bar.value() == 1) {
        setTimeout(() => {
            progressModal.style.display = "none";
            document.querySelector(".bottom-done_btn").style.display = "none";
            bar.set(0)
        }, 500)
    }

    // progressModal.style.display = "none";

}