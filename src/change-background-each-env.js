{
  const hostname = window.location.hostname;
  window.onload = function() {
    chrome.storage.local.get('data', function(param) {
      if (!Array.isArray(param.data)) {
        return 0;
      }
      param.data.forEach((items) => {
        if (hostname === items.host && items.active) {
          setBg(items);
        }
      });
    });
  };

  /**
   * 表示切替
   */
  chrome.runtime.onMessage.addListener((request, sender, callback) => {

    chrome.storage.local.get('data', function(param) {

      if (!Array.isArray(param.data)) {
        callback(false);
        return true;
      }

      param.data.forEach((items) => {
        if (hostname === items.host) {
          let result = false;
          if (request.type === 'show') {
            result = setBg(items);

          } else if (request.type === 'hide') {
            result = setBg(items, true);

          } else if (request.type === 'active') {
            toggleBackground(items.host);
            result = setBg(items);
          }
          callback(result);
          return true;
        }
      });
    });
    return true;
  });

  /**
   * 有効・無効の切り替え
   * @param Array items
   * @param Boolean isClear
   */
  function toggleBackground(target_host) {

    chrome.storage.local.get('data', function(param) {

      const updated_data = param.data.map((items) => {

        if (items.host === target_host) {
          let tgl = (items.active) ? false : true;
          return {
            host: target_host,
            target: items.target,
            color: items.color,
            active: tgl,
          };

        } else {
          return items;
        }
      });

      chrome.storage.local.set({'data': updated_data});
    });
    return true;
  }

  /**
   * 背景のセット・クリア
   * @param Object items
   * @param Boolean isClear
   */
   function setBg(items, isClear = false) {
    let target = document.querySelectorAll(items.target);
    if(target.length === 0) {
      return false;
    }
    if (isClear) {
      target[0].style.cssText = null;
    } else {
      target[0].style.cssText += `background-color: ${items.color} !important;`;
    }
    return true;
  }
}
