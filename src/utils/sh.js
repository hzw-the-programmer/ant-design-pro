import { IDAS_HTTP_API_ROOT } from '@/services/constants';

//时间搓转化
export function formatDate(date) {
  var date = new Date(date * 1000);
  var myyear = date.getFullYear();
  var mymonth = date.getMonth() + 1;
  var myweekday = date.getDate();
  var myHour = date.getHours();
  var myMinute = date.getMinutes();
  var mySecond = date.getSeconds();
  if (mymonth < 10) {
    mymonth = '0' + mymonth;
  }
  if (myweekday < 10) {
    myweekday = '0' + myweekday;
  }
  if (myHour < 10) {
    myHour = '0' + myHour;
  }
  if (myMinute < 10) {
    myMinute = '0' + myMinute;
  }
  if (mySecond < 10) {
    mySecond = '0' + mySecond;
  }
  return myyear + '-' + mymonth + '-' + myweekday + ' ' + myHour + ':' + myMinute + ':' + mySecond;
}

export function findAncestors(place, id, ids) {
  const r = place.children.filter(c => c.value === id);

  if (r.length !== 0) {
    ids.push(place.value);
    return true;
  }

  for (let i = 0; i < place.children.length; i += 1) {
    if (findAncestors(place.children[i], id, ids)) {
      ids.unshift(place.value);
      return true;
    }
  }

  return false;
}

export function getPlace(place, ids, i) {
  if (i > ids.length - 1) {
    return null;
  }

  if (place.value !== ids[i]) {
    return null;
  }

  const pl = {
    ...place,
    children: [],
  };

  place.children.forEach(p => {
    const tp = getPlace(p, ids, i + 1);
    if (tp) {
      pl.children.push(tp);
    }
  });

  return pl;
}

export function getFirstPlace(place, ids) {
  ids.push(place.value);
  if (place.children.length !== 0) {
    getFirstPlace(place.children[0], ids);
  }
}

export function convertMap(map) {
  const newMap = {
    url: IDAS_HTTP_API_ROOT + map.image,
    ratio: parseFloat(map.ratio),
    extent: [0, 0, 0, 0],
  };

  return newMap;
}

export function convertPlace(place) {
  const newPlace = {
    label: place.name,
    value: place.id,
    children: [],
  };

  place.children.forEach(child => {
    newPlace.children.push(convertPlace(child));
  });

  return newPlace;
}

export function convertRegions(regions) {
  const r = []

  regions.forEach(re => {
    const x = parseInt(re.pick1x, 10)
    const y = parseInt(re.pick1y, 10)
    const w = re.pick2x - re.pick1x
    const h = re.pick2y - re.pick1y
    
    r.push({
      id: parseInt(re.id, 10),
      name: re.region_name,
      extent: [x, y, w, h],
      type: parseInt(re.type, 10)
    })
  })

  return r
}

export function convertStations(stations) {
  const s = []

  stations.forEach(sa => {
    const x = parseInt(sa.x, 10)
    const y = parseInt(sa.y, 10)
    
    s.push({
      extent: [x, y, 0, 0],
      type: parseInt(sa.type, 10)
    })
  })

  return s
}
