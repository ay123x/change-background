{
  /**
   * onload
   * chrome-extension://lcfkaknnfhjichmmefggdfdkbichijnf/popup.html
   */
  window.onload = function() {

    chrome.storage.local.get('data', function(param) {
      const tbody      = document.querySelector('.js-show');
      const host_param = getHostParam();

      if (Array.isArray(param.data)) {
        param.data.forEach((items, index) => {
          let tgl = (items.active) ? '[Now valid] 無効にする': '[Now invalid] 有効にする';
          let attention = (host_param === items.host)? 'attention' : '';
          let tr = "<tr>" +
                      `<td class="${attention}">${items.host}</td>` +
                      `<td><input type="text" name="item[${items.host}][target]" value="${items.target}"></td>` +
                      `<td><input type="color" name="item[${items.host}][color]" value="${items.color}"><span class="color">${items.color}</span></td>` +
                      `<td><button class="toggle" data-host="${items.host}">${tgl}</button></td>` +
                      `<td><button class="update" data-host="${items.host}">update</button></td>` +
                      `<td><button class="remove" data-host="${items.host}">remove</button></td>` +
                   "</tr>";
            tbody.insertAdjacentHTML('beforeend', tr);
        });
        if (host_param) {
          alert('背景の登録を行いました。上書きする要素や背景色をデフォルトから更新してください。');
        }
      } else {
        const table = document.querySelector('#tbl-list');
        const h2    = document.querySelector('#h2-list');
        table.style.display = 'none';
        h2.style.display = 'none';
      }
    });
  };

  /**
   * register
   */
  document.getElementById('register').addEventListener('click', () => {
    let input_host   = document.querySelector('input[name="host"]').value;
    let input_target = document.querySelector('input[name="target"]').value;
    let input_color  = document.querySelector('input[name="color"]').value;

    if (input_host === '') {
      alert('hostを入力して下さい');
      return;
    }
    if (input_target === '') {
      input_target = 'body';
    }

    const row = {
      'host'   : input_host,
      'target' : input_target,
      'color'  : input_color,
      'active' : true,
    }

    chrome.storage.local.get('data', function(param) {
      param.data.push(row);
      chrome.storage.local.set({'data': param.data});
    });
    reload();
  });

  /**
   * update, remove, toggle
   */
  document.querySelector('.js-show').addEventListener('click', e => {
    const target = e.target;

    if (target.tagName === 'BUTTON') {
      const target_host = e.target.dataset.host;

      if (target.classList.contains('update')) {
        updateBg(target_host);
        reload();

      } else if (target.classList.contains('remove')) {
        removeBg(target_host);
        reload();

      } else if (target.classList.contains('toggle')) {
        toggleBg(target_host);
        reload();
      }
    }
  });

  function updateBg(target_host) {
    const input_target = document.querySelector(`input[name="item[${target_host}][target]"]`).value;
    const input_color  = document.querySelector(`input[name="item[${target_host}][color]"]`).value;

    chrome.storage.local.get('data', function(param) {
      const updated_data = param.data.map((items) => {
        if (items.host === target_host) {
          return {
            host: target_host,
            target: input_target,
            color: input_color,
            active: items.active
          };
        } else {
          return items;
        }
      });
      chrome.storage.local.set({'data': updated_data});
    });

  }

  function removeBg(target_host) {
    chrome.storage.local.get('data', function(param) {
      const removed_data = param.data.filter((items) => {
        if (items.host === target_host || items.host === undefined) {
          return false;
        } else {
          return true;
        }
      });
      chrome.storage.local.set({'data': removed_data});
      console.log(removed_data);
    });
  }

  function toggleBg(target_host) {
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
  }

  function getHostParam() {
    const url        = new URL(window.location.href);
    const params     = url.searchParams;
    const host_param = params.get('h') ?? null;
    return host_param;
  }

  function reload() {
    location.href = location.protocol + '//' + location.hostname + location.pathname;
  }

}
