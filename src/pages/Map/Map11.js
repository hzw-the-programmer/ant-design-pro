import React, { Component } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { ZoomSlider } from 'ol/control';

import styles from './Map11.less';

function createMap(target) {
  const view = new View({
    center: [0, 0],
    zoom: 2,
  });

  const source = new OSM();

  const layer = new TileLayer({
    source,
  });

  const layers = [layer];

  const map = new Map({
    target,
    view,
    layers,
  });

  const zoomSlider = new ZoomSlider();
  map.addControl(zoomSlider);
  return map;
}

class Map11 extends Component {
  componentDidMount() {
    createMap('map1');
    createMap('map2');
    createMap('map3');
  }

  render() {
    return (
      <div>
        <div id="map1" className={styles.map} />
        <div id="map2" className={styles.map} />
        <div id="map3" className={styles.map} />
      </div>
    );
  }
}

export default Map11;
