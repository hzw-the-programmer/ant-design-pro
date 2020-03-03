import { queryRoutes } from '@/services/api';

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
      const routes = yield call(queryRoutes, person, datetime);
      yield put({
        type: 'saveRoutes',
        payload: routes,
      });

      const mPlaces = yield select(state => state.monitor.places);
      const rPlaces = [];
      let rPlace = [];
      routes.forEach(route => {
        const r1 = mPlaces.filter(p => p.value === route.place[0]);
        if (r1.length === 0) return;

        let place;
        const r2 = rPlaces.filter(p => p.value === route.place[0]);
        if (r2.length === 0) {
          place = { ...r1[0], children: [] };
          rPlaces.push(place);
        } else {
          [place] = r2;
        }

        const cr1 = r1[0].children.filter(p => p.value === route.place[1]);
        if (cr1.length === 0) return;

        const cr2 = place.children.filter(p => p.value === route.place[1]);
        if (cr2.length === 0) {
          place.children.push({ ...cr1[0] });
          if (rPlace.length === 0) {
            rPlace = [...route.place];
          }
        }
      });

      yield put({
        type: 'savePlaces',
        payload: rPlaces,
      });

      yield put({
        type: 'changePlace',
        payload: rPlace,
      });
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
