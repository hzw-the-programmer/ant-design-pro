import request from '@/utils/request';

import { HTTP_API_ROOT } from './constants'

export async function queryBeacons(pagination, params) {
    const body = { ...pagination, ...params }
    body.rows = body.pageSize
    delete body.pageSize
    
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
