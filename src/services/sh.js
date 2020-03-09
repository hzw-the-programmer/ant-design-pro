import request from '@/utils/request';

import { HTTP_API_ROOT } from './constants'

export async function queryBeacons(params) {
    return request(`${HTTP_API_ROOT}/config/beacon_list`, {
        method: 'POST',
        body: params,
        credentials: 'omit',
    });
}
  
export async function deleteBeacons(params) {
    return request(`${HTTP_API_ROOT}/config/beacon_delete`, {
        method: 'POST',
        body: params,
        credentials: 'omit',
    });
}
