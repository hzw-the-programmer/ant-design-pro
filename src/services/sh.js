import request from '@/utils/request';

import { IDAS_HTTP_API_ROOT } from './constants';

export async function queryPlaces() {
  return request(`${IDAS_HTTP_API_ROOT}/api/config/get_place_now_nodes`, {
    credentials: 'omit',
  });
}

export async function queryMap() {
  return request(`${IDAS_HTTP_API_ROOT}/api/config/get_place_now_nodes`, {
    credentials: 'omit',
  });
}
