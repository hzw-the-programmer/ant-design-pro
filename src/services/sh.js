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
  if(body.place_id){
    body.place_id = body.place_id[body.place_id.length-1]
  }

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
  const body = {...params, datetime: params.datetime.format('YYYY-MM-DD')}
  return request(`${HTTP_API_ROOT}/staff_event/daily`, {
    method: 'POST',
    body,
    credentials: 'omit',
  });
}

export async function queryRegionDuration(params) {
  console.log('queryRegionDuration', params)
  const body = {
    staff_id: params.id,
    region_id: params.key,
    starttime: params.starttime,
    endtime: params.endtime,
  }
  return request(`${HTTP_API_ROOT}/region/duration`, {
    method: 'POST',
    body,
    credentials: 'omit',
  });
}

export async function queryPlaceRegions(params) {
  const body = { place_id: params[params.length - 1] };
  
  return request(`${HTTP_API_ROOT}/region/region_list_place`, {
    method: 'POST',
    credentials: 'omit',
    body,
  });
}

export async function queryPlaceStations(params) {
  const body = {
    place_id: params[params.length - 1],
    page: 1,
    rows: 10000,
  };
  
  return request(`${HTTP_API_ROOT}/basestation/station_list_place`, {
    method: 'POST',
    credentials: 'omit',
    body,
  });
}

export async function addStation(params) {
  const body = {...params}
  body.place_id = params.place[params.place.length - 1]
  delete body.place
  return request(`${HTTP_API_ROOT}/basestation/station_add`, {
    method: 'POST',
    credentials: 'omit',
    body,
  });
}

export async function addRegion(params) {
  const body = {
    region_name: params.name,
    pick1x: params.x,
    pick1y: params.y,
    pick2x: params.x + params.w,
    pick2y: params.y + params.h,
    place_id: params.place[params.place.length - 1],
    type: params.type,
  }
  return request(`${HTTP_API_ROOT}/region/region_add`, {
    method: 'POST',
    credentials: 'omit',
    body,
  });
}

export async function queryAlarms(params) {
  const body = {
    type: params.filter,
    page: params.current,
    rows: params.pageSize,
  }

  return request(`${HTTP_API_ROOT}/region_alarm/list`, {
    method: 'POST',
    credentials: 'omit',
    body,
  });
}

export async function processAlarm(params) {
  return request(`${HTTP_API_ROOT}/region_alarm/handle`, {
    method: 'POST',
    credentials: 'omit',
    body: params,
  });
}

export async function queryUnhandledAlarmsCount() {
  return request(`${HTTP_API_ROOT}/region_alarm/unhandle_num`, {
    method: 'POST',
    credentials: 'omit',
  });
}

export async function queryPatrolConfigs(params) {
  const body = {...params}
  body.page = body.current
  delete body.current
  body.rows = body.pageSize
  delete body.pageSize
  body.staff_id = params.name,
  delete body.name
  
  return request(`${HTTP_API_ROOT}/patrol/spc_list`, {
    method: 'POST',
    credentials: 'omit',
    body,
  });
}

export async function queryPatrolTimeRanges(params) {
  const body = {
    staff_id: params.name,
    date: params.date.format('YYYY-MM-DD'),
  }
  
  return request(`${HTTP_API_ROOT}/patrol/spc_staff_date`, {
    method: 'POST',
    credentials: 'omit',
    body,
  });
}

export async function queryPatrolLog(params) {
  const body = {
    config_id: params.id,
    date: params.date.format('YYYY-MM-DD'),
  }
  
  return request(`${HTTP_API_ROOT}/patrol/map_patrol_log`, {
    method: 'POST',
    credentials: 'omit',
    body,
  });
}

export async function queryNormalPatrolLog(params) {
  const body = {
    page: params.current,
    rows: params.pageSize,
  }
  if (params.name) {
    body.staff_id = params.name
  }
  if (params.datetime) {
    body.starttime = params.datetime[0].format('YYYY-MM-DD HH:mm:ss')
    body.endtime = params.datetime[1].format('YYYY-MM-DD HH:mm:ss')
  }

  return request(`${HTTP_API_ROOT}/patrol/patrol_log`, {
    method: 'POST',
    credentials: 'omit',
    body,
  })
}

export async function queryAbnormalPatrolLog(params) {
  const body = {
    page: params.current,
    rows: params.pageSize,
  }
  if (params.name) {
    body.staff_id = params.name
  }
  if (params.datetime) {
    body.starttime = params.datetime[0].format('YYYY-MM-DD HH:mm:ss')
    body.endtime = params.datetime[1].format('YYYY-MM-DD HH:mm:ss')
  }

  return request(`${HTTP_API_ROOT}/patrol/all_patrol_list`, {
    method: 'POST',
    credentials: 'omit',
    body,
  })
}
