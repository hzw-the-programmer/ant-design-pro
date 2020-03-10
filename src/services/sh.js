import request from '@/utils/request';

import { IDAS_HTTP_API_ROOT } from './constants';

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
