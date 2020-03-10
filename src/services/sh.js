import request from '@/utils/request';

import { IDAS_HTTP_API_ROOT, LOCATION_HTTP_API_ROOT } from './constants';

export async function queryPlaces() {
  return request(`${IDAS_HTTP_API_ROOT}/api/config/get_place_now_nodes`, {
    credentials: 'omit',
  });
}

export async function queryMap(params) {
  const body = { place_id: params[1] };

  return request(`${IDAS_HTTP_API_ROOT}/api/image/place/query`, {
    method: 'POST',
    body,
    credentials: 'omit',
  });
}

export async function queryPeople() {
  return request(`${LOCATION_HTTP_API_ROOT}/staff_id/list`, {
    credentials: 'omit',
  });
}

function createRtlWS() {
  console.log('createRtlWS');
  let ws = null;

  function open(url, dispatch) {
    if (ws && ws.url === url && ws.readyState === WebSocket.OPEN) {
      return;
    }

    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('onopen');
    };

    ws.onmessage = ev => {
      const response = JSON.parse(ev.data);

      dispatch({
        type: 'rtlMsg',
        payload: response,
      });
    };

    ws.onerror = () => {
      console.log('onerror');
    };

    ws.onclose = () => {
      console.log('onclose');
      ws = null;
    };
  }

  function close() {
    if (ws) ws.close();
  }

  function send(msg) {
    if (!ws) return;
    ws.send(JSON.stringify(msg));
  }

  return {
    open,
    close,
    send,
  };
}

export const rtlWS = createRtlWS();
