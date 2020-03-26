import moment from 'moment';
import { isEqual } from 'lodash';

import {
  queryRoutes,
  queryMap,
  queryPlaceRegions,
} from '@/services/sh';

import {
  findAncestors,
  getPlace,
  getFirstPlace,
  convertMap,
  combinePlaces,
  convertRegions,
} from '@/utils/sh';

function convertLocation(d) {
  const { x, y } = d;

  const l = {
    datetime: moment(d.time).unix(),
    duration: 0,
    coord: [x, y],
  };

  return l;
}

export default {
  namespace: 'route',

  state: {
    routes: [],
    places: [],
    place: [],
    formValues: {},
    displayTime: false,
    regions: [],
    map: {url: '', ratio: 0.0, extent: [0, 0, 0, 0]}
  },

  effects: {
    *queryRoutes({payload: { person, datetime },}, {call, select, put}) {
      try {
        const places = yield select(state => state.monitor.places);

        const pls = [];
        const routes = [];

        const response = yield call(queryRoutes, person, datetime);
        response.result.forEach(r => {
          const pid = r.place_id;
          const pids = [];
          findAncestors({ value: 0, children: places }, pid, pids);
          pids.push(pid);
          pids.shift();

          pls.push(pids);

          const locations = [];
          r.data.forEach(d => {
            locations.push(convertLocation(d));
          });

          const route = {
            place: pids,
            locations,
          };

          routes.push(route);
        });

        yield put({
          type: 'saveRoutes',
          payload: routes,
        });

        const rPlaces = [];
        pls.forEach(pl => {
          places.forEach(p => {
            const tp = getPlace(p, pl, 0);
            if (tp) {
              rPlaces.push(tp);
            }
          });
        });
        const fPlaces = combinePlaces(rPlaces)

        yield put({
          type: 'savePlaces',
          payload: fPlaces,
        });

        const rPlace = [];
        getFirstPlace({ value: 0, children: rPlaces }, rPlace);
        rPlace.shift();

        yield put({
          type: 'changePlace',
          payload: rPlace,
        });
      } catch (e) {
        console.log(e);
      }
    },

    *changePlace({ payload }, { put, call }) {
      try {
        if (payload.length === 0) {
          return;
        }

        let response = yield call(queryPlaceRegions, payload)
        const regions = convertRegions(response.result)

        response = yield call(queryMap, payload);
        if (response.result.length === 0) {
          return;
        }
        const map = convertMap(response.result[0]);

        yield put({
          type: 'savePlace',
          payload,
        });

        yield put({
          type: 'saveRegions',
          payload: regions,
        })

        yield put({
          type: 'saveMap',
          payload: map,
        });
      } catch (e) {
        console.log(e);
      }
    },
  },

  reducers: {
    saveFormValues(state, { payload }) {
      return {
        ...state,
        formValues: payload,
      };
    },

    saveRoutes(state, { payload }) {
      return {
        ...state,
        routes: payload,
      };
    },

    savePlaces(state, { payload }) {
      return {
        ...state,
        places: payload,
        place: [],
        map: {url: '', ratio: 0.0, extent: [0, 0, 0, 0]},
      };
    },

    savePlace(state, { payload }) {
      return {
        ...state,
        place: payload,
      };
    },

    saveRegions(state, { payload }) {
      return {
        ...state,
        regions: payload,
      };
    },

    saveMap(state, { payload }) {
      return {
        ...state,
        map: payload,
      };
    },

    saveDisplayTime(state, { payload }) {
      return {
        ...state,
        displayTime: payload,
      };
    },
  },
};
