import uuid from 'uuid';

function genUUID () {
  return uuid.v4()
}

function includeTemplates () {
  var z, i, elmnt, file, xhttp;
  const incEls = document.getElementsByClassName("w3-include-html")  
  for (let i = 0; i < incEls.length; i++) {
    const incEl = incEls[i];

    const file = incEl.getAttribute('w3-include-html');

    if (file) {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {incEl.innerHTML = this.responseText;}
          if (this.status == 404) {incEl.innerHTML = "Page not found.";}

          /* Remove the attribute, and call this function once more: */
          incEl.removeAttribute("w3-include-html");
        }
      }
      xhttp.open("GET", file, true);
      xhttp.send();
      /* Exit the function: */
      return;
    }
  }
}

function tryNumberParse (v: string) {
  const result = Number(v)
  if (!Number.isNaN(result)) {
    return result
  }
  return null
}

function tryJsonParse (v:string) {
  try {
    return JSON.parse(v);
  } catch (e) {
    return null
  }
}

function stringify (value: string|number|JSON) {
  switch (typeof value) {
      case 'string': {
          return value;
      } break;
      case 'number': {
          return String(value);
      } break;
      default: {
          return JSON.stringify(value);
      }
  }
}

/**
 * Try to parse value to json|number|string or return null if undefined
 * @param {any} value 
 * @returns 
 */
function tryParse (value: JSON|number|string) {
        const json = tryJsonParse(value as string);
        if (json) return json;

        const num = tryNumberParse(value as string);
        if (num) return num;

        if (value != null) return value; // expect to be a string

        return null;
    }


function getDateFormat (date=(new Date())) {
  const _d = {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
    hour: date.getHours(),
    min: date.getMinutes(),
    sec: date.getSeconds(),
    period: date.getHours() > 12 ? 'PM' : 'AM'
  }

  return {
    YYYY: _d.year,
    YYYYMM: `${_d.month}`,
    YYYYMMDD: `${_d.day}`,
    YYYYMMDD_SLASH: `${_d.year}/${_d.month}/${_d.day}`,
    YYYYMMDD_HHMM_SLASH_COLON: `${_d.year}/${_d.month}/${_d.day} ${_d.hour}:${_d.min}`,
    Date_Time: `${_d.year}/${_d.month}/${_d.day} ${_d.hour}:${_d.min}`,
    Date_Time_Period: `${_d.year}/${_d.month}/${_d.day} ${_d.hour}:${_d.min}:${_d.sec} ${_d.period}`,
  }
}

async function fetchWithTimeout(resource: string, options?: { timeout?: number } & RequestInit) {
  const defaultTimeout = 2000;
  
  const controller = new AbortController();
  const id = setTimeout(() => {
    return controller.abort()
  }, options?.timeout || defaultTimeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);
  return response;
}



export {
  tryJsonParse,
  tryNumberParse,
  tryParse,
  getDateFormat,
  stringify,
  genUUID,
  fetchWithTimeout
}
