import React, { Component } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import Projection from 'ol/proj/Projection';
import { getCenter } from 'ol/extent';

import styles from './Map12.less';

function createMap(target, url, extent) {
  const projection = new Projection({
    code: 'hzw',
    extent,
  });

  const view = new View({
    center: getCenter(extent),
    zoom: 2,
    projection,
  });

  const layer = new ImageLayer({
    source: new ImageStatic({
      url,
      imageExtent: extent,
    }),
  });

  const map = new Map({
    target,
    view,
    layers: [layer],
  });

  return map;
}

function onClick() {
  createMap('map', './online_communities.png', [0, 0, 1024, 968]);
}

class Map12 extends Component {
  componentDidMount() {}

  render() {
    return (
      <div>
        <div id="map" className={styles.map} />
        <button onClick={onClick} type="button">
          Create Map
        </button>
      </div>
    );
  }
}

export default Map12;
