import { queryRoutes } from '@/services/sh';
import { findAncestors, getPlace, getFirstPlace } from '@/utils/sh';

export default {
  namespace: 'route',

  state: {
    person: undefined,
    datetime: [],
    routes: [],
    places: [],
    place: [],
  },

  effects: {
    *changePerson({ payload }, { put }) {
      yield put({
        type: 'savePerson',
        payload,
      });
    },

    *changeDatetime({ payload }, { put }) {
      yield put({
        type: 'saveDatetime',
        payload,
      });
    },

    *fetchRoutes(
      {
        payload: { person, datetime },
      },
      { call, select, put }
    ) {
      try {
        const places = yield select(state => state.monitor.places);

        const pls = [];
        const routes = yield call(queryRoutes, person, datetime);
        routes.result.forEach(r => {
          const pid = r.place_id;
          const pids = [];
          findAncestors({ value: 0, children: places }, pid, pids);
          pids.push(pid);
          pids.shift();
          pls.push(pids);
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
        console.log(rPlaces);

        yield put({
          type: 'savePlaces',
          payload: rPlaces,
        });

        const rPlace = [];
        getFirstPlace({ value: 0, children: rPlaces }, rPlace);
        rPlace.shift();
        console.log(rPlace);

        yield put({
          type: 'changePlace',
          payload: rPlace,
        });
      } catch (e) {
        console.log(e);
      }
    },

    *changePlace({ payload }, { put }) {
      yield put({
        type: 'savePlace',
        payload,
      });
    },
  },

  reducers: {
    savePerson(state, { payload }) {
      return {
        ...state,
        person: payload,
      };
    },

    saveDatetime(state, { payload }) {
      return {
        ...state,
        datetime: payload,
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
      };
    },

    savePlace(state, { payload }) {
      return {
        ...state,
        place: payload,
      };
    },
  },
};
