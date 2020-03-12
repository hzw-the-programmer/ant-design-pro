import request from '@/utils/request';

import { HTTP_API_ROOT, IDAS_HTTP_API_ROOT, LOCATION_HTTP_API_ROOT } from './constants';

//信标
export async function queryBeacons(pagination, params) {
  const body = { ...pagination, ...params };
  body.rows = body.pageSize;
  delete body.pageSize;

  return request(`${HTTP_API_ROOT}/config/beacon_list`, {
    method: 'POST',
    body,
    credentials: 'omit',
  });
}

export async function deleteBeacon(params) {
  return request(`${HTTP_API_ROOT}/config/beacon_delete`, {
    method: 'POST',
    body: params,
    credentials: 'omit',
  });
}

export async function createBeacon(params) {
  return request(`${HTTP_API_ROOT}/config/beacon_single_add`, {
    method: 'POST',
    body: params,
    credentials: 'omit',
  });
}

export async function debindBeacon(params) {
  return request(`${HTTP_API_ROOT}/config/beacon_unbind`, {
    method: 'POST',
    body: params,
    credentials: 'omit',
  });
}

export async function bindBeacon(params) {
  return request(`${HTTP_API_ROOT}/config/beacon_bind`, {
    method: 'POST',
    body: params,
    credentials: 'omit',
  });
}

// 基站列表
export async function queryStations(pagination, params) {
  const body = { ...pagination, ...params };
  body.rows = body.pageSize;
  delete body.pageSize;

  return request(`${HTTP_API_ROOT}/basestation/station_list`, {
    method: 'POST',
    body,
    credentials: 'omit',
  });
}

//人员列表查询
export async function queryStaffs(pagination, params) {
  const body = { ...pagination, ...params };
  body.rows = body.pageSize;
  delete body.pageSize;

  return request(`${HTTP_API_ROOT}/staff/img_list`, {
    method: 'POST',
    body,
    credentials: 'omit',
  });
}

//组织列表输出
export async function queryTeams() {
  return request(`${HTTP_API_ROOT}/config/group_list`, {
    method: 'POST',
    credentials: 'omit',
  });
}

//查询位置
export async function queryPlaces() {
  return request(`${IDAS_HTTP_API_ROOT}/api/config/get_place_now_nodes`, {
    credentials: 'omit',
  });
}

//查询地图
export async function queryMap(params) {
  const body = { place_id: params[params.length - 1] };

  return request(`${IDAS_HTTP_API_ROOT}/api/image/place/query`, {
    method: 'POST',
    body,
    credentials: 'omit',
  });
}

//查询人员
export async function queryPeople() {
  return request(`${LOCATION_HTTP_API_ROOT}/staff_id/list`, {
    credentials: 'omit',
  });
}

//实时位置的WebSocket
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

//查询轨迹
export async function queryRoutes(person, datetime) {
  const body = {
    staff_id: person,
    starttime: datetime[0].unix(),
    endtime: datetime[1].unix(),
  };
  return request(`${LOCATION_HTTP_API_ROOT}/track/list`, {
    method: 'POST',
    body,
    credentials: 'omit',
  });
}


//活动日报表
export async function queryEvents(params) {

  return request(`${HTTP_API_ROOT}/staff_event/daily`, {
    method: 'POST',
    body: params,
    credentials: 'omit',
  });
}

export async function queryRegionDuration(params) {
  const body = {
    staff_id: params.id,
    region_id: params.key,
  }
  return request(`${HTTP_API_ROOT}/region/duration`, {
    method: 'POST',
    body,
    credentials: 'omit',
  });
}
