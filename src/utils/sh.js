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
