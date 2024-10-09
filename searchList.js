var currentUri;
var connection_estalish = false
var ping_interval;

const drag_drop_btn_innerHtml = `
    <div id="curtly_drag_drop_btn_logo" style="cursor: pointer; border-radius: 5px; padding: 5px; display: flex; justify-content: center; align-items: center;">
        <img src="` + chrome.runtime.getURL('black_logo.png') + `" style="border-radius: 4px;" width="40" height="40">
    </div>
    <div id="curtly_drag_drop_btn_area" style="display: none; justify-content: center; align-items: center;">
        <svg style="cursor: grab;" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="white" class="bi bi-grip-vertical" viewBox="0 0 16 16">
            <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
        </svg>
    </div>
`;

window.onload = async () => {
    await chrome.storage.sync.remove('actionType');
    setInterval(start, 200);
    setInterval(injectDragDropBtn, 200);
}

const injectDragDropBtn = () => {
    // Check if button is not already injected and the URL matches the condition
    if (document.getElementById('curtly_drag_drop_btn') == null && (window.location.href.toLowerCase().startsWith('https://www.linkedin.com/search/results/people/?keywords=') || window.location.href.toLowerCase().startsWith('https://www.linkedin.com/search/results/people/?heroentitykey='))) {

        // Create the button container
        const drag_drop_btn = document.createElement('div');
        drag_drop_btn.innerHTML = drag_drop_btn_innerHtml;
        drag_drop_btn.setAttribute('id', 'curtly_drag_drop_btn');
        drag_drop_btn.setAttribute('style', `
            background: #221C36;
            border-radius: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 999999999999;
            position: fixed;
            box-shadow: 1px 1px 3px 1px;
            top: 30%;
            right: 0;
        `);
        document.body.appendChild(drag_drop_btn);

        drag_drop_btn.querySelector('#curtly_drag_drop_btn_logo').addEventListener('click', () => {
            drag_drop_btn.style.display = 'none';
            injectSearchListPopupDiv();
        })


        // Initialize drag functionality
        const draggableArea = document.getElementById('curtly_drag_drop_btn_area');
        let isDragging = false;
        let offsetY = 0;

        drag_drop_btn.addEventListener('mouseover', () => {
            draggableArea.style.display = 'flex';
        })

        drag_drop_btn.addEventListener('mouseout', () => {
            draggableArea.style.display = 'none';
        })

        // Event listeners for drag and drop
        draggableArea.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetY = (e.clientY - drag_drop_btn.getBoundingClientRect().top) - 10; // Calculate the offset from the top
            document.addEventListener('mousemove', moveElement);
            document.addEventListener('mouseup', dropElement);
        });

        // Move the button vertically
        function moveElement(e) {
            if (isDragging) {
                drag_drop_btn.style.top = `${e.clientY - offsetY}px`;
            }
        }

        // Snap the button to the right side of the screen on drop
        function dropElement() {
            if (isDragging) {
                isDragging = false;
                document.removeEventListener('mousemove', moveElement);
                document.removeEventListener('mouseup', dropElement);
            }
        }
    }
};

const injectSearchListPopupDiv = async () => {
    let isLogin = await chrome.storage.sync.get(['login']);
    console.log(isLogin, 'isLogin')
    let actionType = await chrome.storage.sync.get(['actionType']);
    actionType = actionType['actionType'] != undefined && actionType['actionType'] != null ? actionType['actionType'] : null;

    if (document.querySelector("#searchlistPopupDivClass") == null) {

        var div = document.createElement('div');
        div.setAttribute('id', 'searchlistPopupDivClass')
        div.setAttribute('class', 'searchListPopupDivId')
        if (isLogin?.login) {
            div.style.width = "400px";
            div.innerHTML = `<iframe id="searchListIframe" src="` + chrome.runtime.getURL('searchList.html') + `"></iframe>`;
            setTimeout(() => {
                processToGetList(actionType);
            }, 500);
            ping_interval = setInterval(startPing, 5000);
        } else {
            div.style.width = "320px";
            div.innerHTML = `<iframe id="searchListIframe" src="https://resume.accuick.com/curatelychromeextensionlinkedindemo/"></iframe>`;
        }

        document.body.appendChild(div);

    }
    if (isLogin?.login) {
        setTimeout(() => {
            processToGetList(actionType);
        }, 500);
    } else {
        document.getElementById("searchlistPopupDivClass").style.display = "block";
    }
}

const start = () => {
    if (window.location.href.toLowerCase().startsWith('https://www.linkedin.com/search/results/people/?keywords=') || window.location.href.toLowerCase().startsWith('https://www.linkedin.com/search/results/people/?heroentitykey=')) {
        if (window.location.href != currentUri) {
            currentUri = window.location.href;
            if (document.querySelector('[id="searchlistPopupDivClass"]') != null && document.querySelector('[id="searchlistPopupDivClass"]').style.display == "block") {
                injectSearchListPopupDiv();
            }
        }
    } else {
        document.getElementById("searchlistPopupDivClass") != null ? document.getElementById("searchlistPopupDivClass").remove() : "";
    }
}

const generateRandomString = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

const processToGetList = () => {
    if (document.querySelector("main") != null) {
        let arrOfSearchList = []
        let list_of_search = document.querySelectorAll('main ul li.reusable-search__result-container');
        if (list_of_search?.length > 0) {
            for (let k = 0; k < list_of_search.length; k++) {
                let jsonData = {
                    "imageUri": '',
                    "name": '',
                    "location": '',
                    "job_title": '',
                    "linkedin_url": '',
                    "summery": '',
                    "id": '',
                    "saved": false,
                    "allowToCheck": true,
                    "is_first_connection": false
                }
                let uniqueid = generateRandomString();
                list_of_search[k].classList.add(uniqueid);
                jsonData.id = uniqueid;

                jsonData.allowToCheck = ((list_of_search[k].querySelector('.entity-result__actions button') != null
                    && list_of_search[k].querySelector('.entity-result__actions button.artdeco-button--muted') == null
                    && list_of_search[k].querySelector('.profile-action-compose-option') == null)
                    || (list_of_search[k].querySelector('.entity-result__actions button') != null
                        && list_of_search[k].querySelector('.entity-result__actions button.artdeco-button--muted') == null
                        && list_of_search[k].querySelector('.profile-action-compose-option') != null)
                )

                jsonData.is_first_connection = !(list_of_search[k].querySelector('.entity-result__badge .image-text-lockup__text.entity-result__badge-text')?.textContent?.trim()?.includes('3rd') || list_of_search[k].querySelector('.entity-result__badge .image-text-lockup__text.entity-result__badge-text')?.textContent?.trim()?.includes('2nd'))
                jsonData.imageUri = list_of_search[k].querySelector('img') != null ? list_of_search[k]?.querySelector('img')?.src : "no_user.png";
                jsonData.name = list_of_search[k].querySelector(".t-roman.t-sans [aria-hidden='true']") != null ? list_of_search[k]?.querySelector(".t-roman.t-sans [aria-hidden='true']")?.textContent?.trim() : list_of_search[k]?.querySelector(".t-roman.t-sans")?.textContent?.trim();
                jsonData.location = list_of_search[k]?.querySelector(".entity-result__secondary-subtitle")?.textContent?.trim();
                jsonData.job_title = list_of_search[k]?.querySelector(".entity-result__primary-subtitle")?.textContent?.trim();
                jsonData.summery = list_of_search[k]?.querySelector(".entity-result__summary.entity-result__summary--2-lines")?.textContent?.trim();
                jsonData.linkedin_url = list_of_search[k]?.querySelector(".entity-result__title-text a")?.href;
                if (jsonData.allowToCheck) {
                    arrOfSearchList.push(jsonData);
                }
            }

            sendMessageToIframe({ type: "LIST_OF_SEARCHES", data: arrOfSearchList });
        }
    }
}




const sendMessageToIframe = (data) => {

    const sendMessage = () => {
        chrome.runtime.sendMessage(data, (response) => {
            connection_estalish = true;
        });
    };

    if (connection_estalish) {
        sendMessage();
    } else {
        setTimeout(() => {
            sendMessage();
        }, 500);
    }
};


const startPing = () => {
    chrome.runtime.sendMessage({ type: "PING" }, (response) => {
        connection_estalish = true;
    });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key === 'login') {
            if (newValue) {
                ifLogin();
            } else {
                ifLogout();
            }
        }
    }
});


const ifLogin = () => {
    const mainDiv = document.getElementById('searchlistPopupDivClass');
    mainDiv.querySelector('[id="searchListIframe"]').remove();
    mainDiv.style.width = "400px";
    mainDiv.innerHTML = `<iframe id="searchListIframe" src="` + chrome.runtime.getURL('searchList.html') + `"></iframe>`;
    setTimeout(() => {
        processToGetList();
    }, 1500);
    setTimeout(() => {
        ping_interval = setInterval(startPing, 5000);
    }, 400);
}

const ifLogout = () => {
    clearInterval(ping_interval);
    const mainDiv = document.getElementById('searchlistPopupDivClass');
    mainDiv.querySelector('[id="searchListIframe"]').remove();
    mainDiv.style.width = "320px";
    mainDiv.innerHTML = `<iframe id="searchListIframe" src="https://resume.accuick.com/curatelychromeextensionlinkedindemo/"></iframe>`;
}


const showProgressBar = () => {
    Swal.fire({
        title: "Sending Request in progress",
        html: "Send Request to <b></b>",
        timerProgressBar: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        customClass: {
            popup: 'custom-swal'
        },
        didOpen: () => {
            Swal.showLoading();
        },
    }).then((result) => {
    });
}

const showProgressBarForMessage = () => {
    Swal.fire({
        title: "Sending Messages in progress",
        html: "Send Message to <b></b>",
        timerProgressBar: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        customClass: {
            popup: 'custom-swal'
        },
        didOpen: () => {
            Swal.showLoading();
        },
    }).then((result) => {
    });
}

const deleteCheckbox = (id) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: "DELETE_CHECKBOX", data: id }, () => {
            resolve(true)
        })

    })
}


chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === "RE_CALL_METHOD_FOR_UPDATE_UI") {
        sendMessageToIframe({ type: "LIST_OF_SEARCHES", data: request.data })
    }
    if (request.type === "SEND_REQUEST") {
        showProgressBar()
        if (request.filterList.length > 0) {
            for (let i = 0; i < request.filterList.length; i++) {
                Swal.getPopup().querySelector("b").textContent = request.filterList[i].name;
                let main_ele = document.querySelector('.' + request.filterList[i].id);

                if (main_ele && main_ele.querySelector('.entity-result__actions button') && main_ele.querySelector('.entity-result__actions button.artdeco-button--muted') == null && main_ele.querySelector('.profile-action-compose-option') == null) {
                    main_ele.querySelector('.entity-result__actions button')?.click();
                    await delayFor(1200);
                    if (document.querySelector('[data-test-modal-id="send-invite-modal"] .send-invite') != null) {
                        if (request.message) {
                            document.querySelector('[data-test-modal-id="send-invite-modal"] .send-invite').querySelector('.artdeco-button--secondary')?.click();
                            await delayFor(1500);
                            if (document.querySelector('[data-test-modal-id="send-invite-modal"] .send-invite') != null) {
                                let inputElement = document.querySelector('[data-test-modal-id="send-invite-modal"] .send-invite').querySelector('[name="message"]');
                                inputElement.value = request.message;
                                let event = new Event('input', {
                                    bubbles: true,
                                    cancelable: true,
                                });
                                inputElement.dispatchEvent(event);

                                await delayFor(100);
                                document.querySelector('[data-test-modal-id="send-invite-modal"] .send-invite').querySelector('.artdeco-modal__actionbar')?.click();
                                await delayFor(500);
                                document.querySelector('[data-test-modal-id="send-invite-modal"] .send-invite').querySelector('.artdeco-button--primary')?.click();
                                await delayFor(1200);
                                let isError = await checkErrorMessageGetOrNot();
                                if (isError) {

                                    let stop = await stopProccessOrNot(document.querySelector('[data-test-artdeco-toast-item-type="error"] [class="artdeco-toast-item__message"]')?.textContent?.trim());
                                    if (!stop) {
                                        break;
                                    }
                                    showProgressBar();
                                    document.querySelectorAll('.artdeco-toast-item__dismiss')[0].click();
                                }
                                await delayFor(200);
                                await deleteCheckbox(request.filterList[i].id)
                                await delayFor(3000);
                                continue;
                            } else if (document.querySelector('[data-test-modal-id="upsell-modal"] .upsell-modal,[data-test-modal-id="modal-upsell"] .modal-upsell') != null) {
                                Swal.close()
                                let result = await breackOrContinue();
                                if (result) {
                                    document.querySelector('[data-test-modal-id="upsell-modal"] button[aria-label="Dismiss"],[data-test-modal-id="modal-upsell"] button[aria-label="Dismiss"]').click();
                                    await delayFor(500);
                                    showProgressBar();
                                    i = i - 1;
                                    continue
                                } else {
                                    break;
                                }
                            }
                            // Select the input element

                        } else {
                            document.querySelector('[data-test-modal-id="send-invite-modal"] .send-invite').querySelector('.artdeco-button--primary')?.click();
                            await delayFor(1200);
                            await deleteCheckbox(request.filterList[i].id)
                            await delayFor(3000);
                            continue;
                        }
                    } else if (document.querySelector('[data-test-modal-id="upsell-modal"] .upsell-modal , [data-test-modal-id="modal-upsell"] .modal-upsell') != null) {
                        document.querySelector('[data-test-modal-id="upsell-modal"] button[aria-label="Dismiss"],[data-test-modal-id="modal-upsell"] button[aria-label="Dismiss"]')?.click();
                        Swal.close()
                        let result = await breackOrContinue();
                        if (result) {
                            i = i - 1;
                            showProgressBar();
                            continue;
                        } else {
                            break;
                        }
                    }
                    await delayFor(300);
                    let isError = await checkErrorMessageGetOrNot();
                    if (isError) {
                        let stop = await stopProccessOrNot(document.querySelector('[data-test-artdeco-toast-item-type="error"] [class="artdeco-toast-item__message"]')?.textContent?.trim());
                        if (!stop) {
                            break;
                        }
                        showProgressBar();
                        document.querySelectorAll('.artdeco-toast-item__dismiss')[0].click()
                    }
                    await delayFor(200);
                    await deleteCheckbox(request.filterList[i].id)
                    await delayFor(3000);
                    continue;
                }
            }
        }
        Swal.close()
        Swal.fire({
            // position: "top-end",
            icon: "success",
            title: "Requests Processed Successfully",
            showConfirmButton: false,
            timer: 1500
        });
        sendResponse(request.filterList)
    }
    if (request.type === "SEND_MESSAGES") {
        showProgressBarForMessage()
        if (request.filterList.length > 0) {
            for (let i = 0; i < request.filterList.length; i++) {
                Swal.getPopup().querySelector("b").textContent = request.filterList[i].name;
                let main_ele = document.querySelector('.' + request.filterList[i].id);

                if (main_ele && main_ele.querySelector('.entity-result__actions button') && main_ele.querySelector('.entity-result__actions button.artdeco-button--muted') == null && main_ele.querySelector('.profile-action-compose-option') != null) {
                    await clearOtherOpenMessagePopups();
                    main_ele.querySelector('.entity-result__actions button')?.click();
                    await delayFor(1200);
                    if (document.querySelector('[aria-label="Messaging"]') != null) {
                        await pastMessageOnLinkedPopup(request.message, document.querySelector('[aria-label="Messaging"] [role="textbox"]'));
                        await clearOtherOpenMessagePopups();
                        await delayFor(2000);
                    } else if (document.querySelector('[data-test-modal-id="upsell-modal"] .upsell-modal,[data-test-modal-id="modal-upsell"] .modal-upsell') != null) {
                        Swal.close()
                        let result = await breackOrContinueForMessageSend();
                        if (result) {
                            document.querySelector('[data-test-modal-id="upsell-modal"] .upsell-modal [aria-label="Dismiss"] ,[data-test-modal-id="modal-upsell"] .modal-upsell [aria-label="Dismiss"]').click();
                            await delayFor(1500);
                            showProgressBarForMessage();
                            continue;
                        } else {
                            break;
                        }
                    }
                    await delayFor(300);
                    let isError = await checkErrorMessageGetOrNot();
                    if (isError) {
                        let stop = await stopProccessOrNot(document.querySelector('[data-test-artdeco-toast-item-type="error"] [class="artdeco-toast-item__message"]')?.textContent?.trim());
                        if (!stop) {
                            break;
                        }
                        showProgressBarForMessage();
                        document.querySelectorAll('.artdeco-toast-item__dismiss')[0].click()
                    }
                    await delayFor(200);
                    await deleteCheckbox(request.filterList[i].id)
                    await delayFor(3000);
                    continue;
                }
            }
        }
        Swal.close()
        Swal.fire({
            // position: "top-end",
            icon: "success",
            title: "Messages Sent Processed Successfully",
            showConfirmButton: false,
            timer: 1500
        });
        sendResponse(request.filterList)
    }
});


const delayFor = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const breackOrContinue = () => {
    return new Promise((resolve) => {
        Swal.fire({
            title: "Your message limit is reached. ",
            text: "Do you want to continue? without message?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, continue!"
        }).then((result) => {
            if (result.isConfirmed) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
};

const breackOrContinueForMessageSend = () => {
    return new Promise((resolve) => {
        Swal.fire({
            title: "Do you want to continue to next profile?",
            text: "you are not able to send messages for this profile.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, continue!"
        }).then((result) => {
            if (result.isConfirmed) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
};


const stopProccessOrNot = (error) => {
    return new Promise((resolve) => {
        Swal.fire({
            title: "Do You Want to Cancel or Move to the Next Request?",
            text: error,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, continue!"
        }).then((result) => {
            if (result.isConfirmed) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
};


const checkErrorMessageGetOrNot = () => {
    return new Promise((resolve) => {
        let str = document.querySelector('[data-test-artdeco-toast-item-type="error"] [class="artdeco-toast-item__message"]')?.textContent?.trim();
        if (str != null && str != undefined && str != "") {
            resolve(true);
        } else {
            resolve(false);
        }
    });
};

const clearOtherOpenMessagePopups = () => {
    return new Promise(async (resolve) => {
        let all_popups = document.querySelectorAll('[aria-label="Messaging"] header [href="#close-small"]');
        if (all_popups.length > 0) {
            for (let i = 0; i < all_popups.length; i++) {
                all_popups[i].parentElement.parentElement.click();
                await delayFor(1000);
            }
        }
        resolve(true);
    })
}

const pastMessageOnLinkedPopup = (message, i) => {
    return new Promise(async (resolve) => {
        if (i !== null) {
            i.focus();
            document.execCommand('selectAll', false, null);
            await delayFor(500);
            document.execCommand('cut', false, null);
            await delayFor(500);
            document.execCommand('insertText', false, message);
            await delayFor(500);
        }
        if (document.querySelector('[aria-label="Messaging"] footer.msg-form__footer button.msg-form__send-button') == null) {
            document.querySelector('[data-test-msg-ui-send-mode-toggle-presenter__button]')?.click();
            await delayFor(800);
            document.querySelector('[data-test-msg-ui-send-mode-toggle-presenter__click-to-send-input]')?.click();
        }
        if (document.querySelector('[aria-label="Messaging"] footer.msg-form__footer button.msg-form__send-button') == null) {
            document.querySelector('[aria-label="Messaging"] [href="#send-privately-small"]')?.parentElement?.parentElement?.click()
        } else {
            document.querySelector('[aria-label="Messaging"] footer.msg-form__footer button.msg-form__send-button')?.click();
        }
        await delayFor(2000);
        resolve(true);
    })
}