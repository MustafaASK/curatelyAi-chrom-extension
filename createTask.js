
if(document.querySelector('.l-section.l-full-height')==null){
  var loaderInnerHtml=`<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" width="25" height="25" viewBox="0 0 128 128" xml:space="preserve"><g><path d="M71 39.2V.4a63.6 63.6 0 0 1 33.96 14.57L77.68 42.24a25.53 25.53 0 0 0-6.7-3.03z" fill="#000"/><path d="M71 39.2V.4a63.6 63.6 0 0 1 33.96 14.57L77.68 42.24a25.53 25.53 0 0 0-6.7-3.03z" fill="#e1e1e1" transform="rotate(45 64 64)"/><path d="M71 39.2V.4a63.6 63.6 0 0 1 33.96 14.57L77.68 42.24a25.53 25.53 0 0 0-6.7-3.03z" fill="#e1e1e1" transform="rotate(90 64 64)"/><path d="M71 39.2V.4a63.6 63.6 0 0 1 33.96 14.57L77.68 42.24a25.53 25.53 0 0 0-6.7-3.03z" fill="#e1e1e1" transform="rotate(135 64 64)"/><path d="M71 39.2V.4a63.6 63.6 0 0 1 33.96 14.57L77.68 42.24a25.53 25.53 0 0 0-6.7-3.03z" fill="#bebebe" transform="rotate(180 64 64)"/><path d="M71 39.2V.4a63.6 63.6 0 0 1 33.96 14.57L77.68 42.24a25.53 25.53 0 0 0-6.7-3.03z" fill="#979797" transform="rotate(225 64 64)"/><path d="M71 39.2V.4a63.6 63.6 0 0 1 33.96 14.57L77.68 42.24a25.53 25.53 0 0 0-6.7-3.03z" fill="#6e6e6e" transform="rotate(270 64 64)"/><path d="M71 39.2V.4a63.6 63.6 0 0 1 33.96 14.57L77.68 42.24a25.53 25.53 0 0 0-6.7-3.03z" fill="#3c3c3c" transform="rotate(315 64 64)"/><animateTransform attributeName="transform" type="rotate" values="0 64 64;45 64 64;90 64 64;135 64 64;180 64 64;225 64 64;270 64 64;315 64 64" calcMode="discrete" dur="720ms" repeatCount="indefinite"/></g><g><circle fill="#000" cx="63.66" cy="63.16" r="12"/><animate attributeName="opacity" dur="720ms" begin="0s" repeatCount="indefinite" keyTimes="0;0.5;1" values="1;0;1"/></g></svg>`
  var errorIcon =`<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-1.5-5.009c0-.867.659-1.491 1.491-1.491.85 0 1.509.624 1.509 1.491 0 .867-.659 1.509-1.509 1.509-.832 0-1.491-.642-1.491-1.509zM11.172 6a.5.5 0 0 0-.499.522l.306 7a.5.5 0 0 0 .5.478h1.043a.5.5 0 0 0 .5-.478l.305-7a.5.5 0 0 0-.5-.522h-1.655z" fill="red"/></svg>`
  var successIcon =`<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" viewBox="0 0 50 50" xml:space="preserve"><circle style="fill:#25AE88;" cx="25" cy="25" r="25"/><polyline style="fill:none;stroke:#FFFFFF;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" points="  38,15 22,33 12,25 "/>
</svg>`
  let innerHtmlOfPoup = 
    `
    <div id="processing_popup" style="display: none;box-shadow: 3px 5px 25px -2px;position: fixed;width: 300px;background: white;top: 0;left: 0;padding: 10px;z-index: 9999999999999999999;height: 400px;border-radius: 10px;">
      <div style="display: flex;justify-content: space-between;">
        <div style="font-size: 16px;font-weight: 700;cursor: n-resize;">Processing...</div>
        <div id="close_processing_popup" style="font-size: 20px;font-weight: 700;cursor: pointer;float: right;margin-right: 5px;">X</div>
      </div>
      <div style="margin-top: 10px;">
        <ul style="max-height: 350px;overflow: auto;padding: 10px;" id="progress_list"></ul>
      </div>
    </div>

    <div id="alert_popup" style="display: none;box-shadow: 3px 5px 25px -2px;position: fixed;transform: translate(50%, 50%);width: 300px;background: white;top: -4%;left: 32%;padding: 10px;z-index: 9999999999999999999;height: 400px;border-radius: 10px;">
        <div style="text-align: center;margin-top: 30px;">
            <img src="`+chrome.runtime.getURL("alert.png")+`" style="width: 40%;height: 40%;">
        </div>
        <h3 style="text-align: center;">
            One Last Things!
          </h3>
        <div style="text-align: center;margin-top: 20px;">
            While we're executing your linkedIn tasks,<b>Please do not leave this tab.</b> Leaving the tab will loose this process.
        </div>
        <div style="text-align: center;margin-top: 20px;">
            <button id="alert_close" style="padding: 10px;background: #ec3636;border-radius: 10px;color: white;min-width: 70px;cursor: pointer;">cancel</button>
            <button id="alert_start" style="padding: 10px;background: #05a705;border-radius: 10px;color: white;cursor: pointer;min-width: 70px;">Start</button>
        </div>
    </div>

    <iframe style="display: none;position: fixed;top: 0;left: 0;z-index: 999999;width: 100%;height: 100%;" id="linkedInIframe"></iframe>
    <div class="l-modal active" id="modal">
        <div class="l-modal-wrap">
            <div style="padding: 15px">
              <h3>Create Task</h3>
              <div>
                <label for="title">Add Prospects Profile Urls</label>
                <textarea id="urlInput" style="outline:none;" rows="10" id="messageInput" placeholder="https://www.linkedin.com/in/parthsolanki049/"></textarea>
                <div style="display: flex;justify-content: end;margin-top: 30px;">
                  <button id="createTask" style="padding: 10px;border-radius: 10px;color: white;background: #17ba17;font-size: 16px;">Create</button>
                </div>
              </div>
            </div>
        </div>
    </div>`;  

  var section = document.createElement("div");
  section.setAttribute('class','l-section l-full-height');
  section.innerHTML = innerHtmlOfPoup;
  document.body.appendChild(section);

  const modal = document.getElementById('modal');
  
  modal.addEventListener('click', (e) => {
      if (e.target === modal) {
          modal.classList.remove('active');
      }
  });

  const process_popup = document.getElementById('processing_popup');

  let close_processing_popup = document.getElementById('close_processing_popup');
  close_processing_popup.addEventListener('click',()=>{
    process_popup.style.display='none';    
  })

  const alert_popup = document.getElementById('alert_popup');
  const alert_start = document.getElementById('alert_start');
  const alert_close = document.getElementById('alert_close');

  const createTask = document.getElementById('createTask');
  const urlInput = document.getElementById('urlInput');
  createTask.addEventListener('click', async() => {
    let runningTask = await chrome.storage.sync.get(['runningTask']);
    // if(!runningTask['runningTask']){
      await chrome.storage.sync.set({ 'runningTaskData': [] });      
      
      let URIS_1 = await getSplitedUrlsArry(urlInput);

      if (URIS_1.length > 0) {
        alert_popup.style.display='block';    
        modal.classList.remove('active');    
      }

      alert_close.addEventListener('click',()=>{
        alert_popup.style.display='none';
        modal.classList.add('active');
      })
    
      alert_start.addEventListener('click',async()=>{

        let progressList = document.getElementById("progress_list");
        while (progressList.firstChild) {
          progressList.removeChild(progressList.firstChild);
        }

        let URIS_2 = await getSplitedUrlsArry(urlInput);

        if (URIS_2.length > 0) {
          alert_popup.style.display='block';    
          modal.classList.remove('active');    
        }

        alert_popup.style.display='none';
        process_popup.style.display='block';
        document.querySelector('[id="searchlistPopupDivClass"]').style.display = 'none';        
        await chrome.storage.sync.set({ 'runningTask': true });
        await chrome.storage.sync.set({ 'runningTaskData': URIS_2 });
        startTask(URIS_2);
      })

    // }
  })

  const getSplitedUrlsArry = (urlInput) => {
    return new Promise((resolve, reject) => {
      let urls = [];
      urls = urlInput.value.split('https:');

      let jsonOfUrls = [];

      urls.forEach(url => {
        if(url.trim()!=''){
          let details = {
            src: 'https:'+url.trim(),
            hasError: false,
            error: '',
            isInvited: false
          };
          jsonOfUrls.push(details);
        }
      });

      resolve(jsonOfUrls);
    })
  }
  
  const startTask = async (listOfUrls=[])=>{
    try{
      let isAvailable = await checkTabAvailability();
      if(isAvailable){
        document.getElementById('linkedInIframe').style.display = 'block';
        for (let index = 0; index < listOfUrls.length; index++) {
          chrome.storage.sync.set({'run':listOfUrls[index].src});
          let iframe = document.getElementById('linkedInIframe');  
          iframe.src=listOfUrls[index].src;
          await delay(8000);
          if((iframe.contentDocument.location.href.includes('linkedin.com') && !iframe.contentDocument.location.href.includes('404'))){
            let iframeContent = iframe.contentWindow.document;
            if(iframeContent.querySelectorAll('main button.pvs-profile-actions__action').length>0){
              iframeContent.querySelector('main button.pvs-profile-actions__action').click();
              await delay(8000);
              if(iframeContent.querySelector('[data-test-modal].send-invite')!=null){
                iframeContent.querySelector('[data-test-modal].send-invite .artdeco-modal__actionbar [aria-label="Send without a note"]').click();
                await delay(2000);
                listOfUrls[index].hasError = false;
                listOfUrls[index].error = '';
                listOfUrls[index].isInvited = true;
                await delay(1000);
                await chrome.storage.sync.set({ 'runningTaskData': listOfUrls });
                continue;
              }else{
                listOfUrls[index].hasError = true;
                listOfUrls[index].error = 'Already Invited';
                await chrome.storage.sync.set({ 'runningTaskData': listOfUrls });
                continue;
              }
            }else{
              listOfUrls[index].hasError = true;
              listOfUrls[index].error = 'Alrady In Your Connection';
              await chrome.storage.sync.set({ 'runningTaskData': listOfUrls });
              continue;
            }
          }else{
            listOfUrls[index].hasError = true;
            listOfUrls[index].error = 'Invalid Url';
            await chrome.storage.sync.set({ 'runningTaskData': listOfUrls });
            continue;
          }
        }
        console.log(listOfUrls);
      }
    }finally{
      document.getElementById('linkedInIframe').style.display = 'none';
      chrome.storage.sync.set({'runningTask':false});
      chrome.storage.sync.set({'run':''});
      document.querySelector('[id="searchlistPopupDivClass"]').style.display = 'block';      
    }
  }

  const checkTabAvailability = async () => {
    return new Promise((resolve, reject) => {
        resolve(document.getElementById('linkedInIframe')!=null);   
    })
  }

  const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

}else{
  const modal = document.getElementById('modal');
  modal.classList.add('active');
}


chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      console.log(
          `Storage key "${key}" in namespace "${namespace}" changed.`,
          `Old value was "${oldValue}", new value is "${newValue}".`
      );

      if(key==='runningTaskData'){
        if(newValue.length>0){
          const container = document.getElementById('progress_list');
          for (let index = 0; index < newValue.length; index++) {

              if(container.querySelector(`[id="${newValue[index].src}loader"]`)!=null){
                if(newValue[index].hasError){
                  container.querySelector(`[id="${newValue[index].src}loader"]`).innerHTML = errorIcon;
                  container.querySelector(`[id="${newValue[index].src}error"]`).textContent = newValue[index].error;
                }else if(newValue[index].isInvited){
                  container.querySelector(`[id="${newValue[index].src}loader"]`).innerHTML = successIcon;
                }
                continue;
              }

              const listItem = document.createElement('li');
              listItem.style.marginTop = '15px';
              listItem.style.marginBottom = '15px';

              const div = document.createElement('div');
              div.style.display = 'flex';
              div.style.alignItems = 'center';
              div.style.justifyContent = 'space-between';

              const startErrorDiv = document.createElement('div');
              startErrorDiv.id=newValue[index].src+'error';
              startErrorDiv.setAttribute('style','width: 75%;white-space: nowrap;overflow: hidden;margin-left: 5px;text-overflow: ellipsis;color: red;')
                            
              const startDiv = document.createElement('div');
              startDiv.setAttribute('style','width: 75%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;padding: 5px;');
              startDiv.textContent = newValue[index].src.replace('https://www.linkedin.com/in/','').split('?')[0];
              
              const startParentDiv = document.createElement('div');
              startParentDiv.style.maxWidth = '75%';
              startParentDiv.appendChild(startDiv);
              startParentDiv.appendChild(startErrorDiv);
              
              const loaderDiv = document.createElement('div');
              loaderDiv.id=newValue[index].src+'loader';
              loaderDiv.innerHTML = loaderInnerHtml;

              div.appendChild(startParentDiv);
              div.appendChild(loaderDiv);
              listItem.appendChild(div);
              container.appendChild(listItem);
          }
        }
      }      
  }
});

