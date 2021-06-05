{
  "use strict";
  const dspbtn  = document.querySelector('#display');
  const tglbtn  = document.querySelector('#toggle');
  const rgstbtn = document.querySelector('#register');
  const rdtbtn  = document.querySelector('#redirect');
  const msg     = document.querySelector('.msg');
  let hostname = null;
  let showFlg  = true;
  let active   = null;


  /**
   * onload
   */
  document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.local.get('data', function(param) {

      chrome.tabs.query({active: true, currentWindow: true}, (e) => {
        let a = document.createElement("a");
        a.href = e[0].url;
        msg.innerHTML = hostname = a.hostname;

        let already = false;
        if (param.data) {
          param.data.forEach((items) => {
            if (hostname === items.host) {
              already = true;
              active = items.active;
            }
          });
        }

        if (already) {
          if (active) {
            dspbtn.style.display = 'inline';
          } else {
            tglbtn.style.display = 'inline';
          }
        } else {
          rgstbtn.style.display = 'inline';
        }

      });

    });
  }, false);

  /**
   * 一時的な切り替え
   */
  dspbtn.addEventListener( "click", function(btn) {
    btn.disabled = true;
    chrome.tabs.query({ active: true, currentWindow: true }, (e) => {
      const tab = e.shift();
      if (tab.status === 'complete') {
        const type = showFlg? 'hide' : 'show';
          chrome.tabs.sendMessage(tab.id, {type: type}, () => {
            showFlg = showFlg? false : true;
            msg.innerHTML = '切り替えが完了しました。';
            setTimeout(() => {
              msg.innerHTML = hostname;
              btn.disabled = false;
            }, 2000)
        });
      } else {
        msg.innerHTML = 'ページの読み込みが完了してから再度お試し下さい';
        setTimeout(() => {
          msg.innerHTML = hostname;
          btn.disabled = false;
        }, 2000)
      }
    });
  });

  /**
   * 有効に戻す
   */
   tglbtn.addEventListener( "click", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, (e) => {
      chrome.tabs.sendMessage(e[0].id, { type: 'active'}, () => {
        dspbtn.style.display = 'inline';
        tglbtn.style.display = 'none';
      });
    });
  });

  /**
   * 背景の登録
   */
   rgstbtn.addEventListener( "click", function() {
    chrome.tabs.query({active: true, currentWindow: true}, (e) => {

      const row = {
        'host'   : hostname,
        'target' : 'body',
        'color'  : '#cccccc',
        'active' : true,
      }

      chrome.storage.local.get('data', function(param) {
        param.data.push(row);
        chrome.storage.local.set({'data': param.data});
      });
      // go to option.html
      const url = chrome.extension.getURL("options.html");
      chrome.tabs.create({"url": `${url}?h=${hostname}`});
    });
  });

  /**
   * 登録済一覧へ
   */
   rdtbtn.addEventListener( "click", function() {
    chrome.tabs.create({"url": chrome.extension.getURL("options.html")});
  });
}