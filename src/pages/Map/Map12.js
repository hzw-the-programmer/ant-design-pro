import React, { Component } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import Projection from 'ol/proj/Projection';
import { getCenter } from 'ol/extent';

import styles from './Map12.less';

function createMap(target) {
  const map = new Map({
    target,
  });

  return map;
}

function createView(extent) {
  const projection = new Projection({
    code: 'hzw',
    extent,
  });

  const view = new View({
    center: getCenter(extent),
    zoom: 2,
    projection,
  });

  return view;
}

function createLayer(url, extent) {
  const layer = new ImageLayer({
    source: new ImageStatic({
      url,
      imageExtent: extent,
    }),
  });

  return layer;
}

class Map12 extends Component {
  componentDidMount() {}

  onClick() {
    if (this.map) {
      this.map.setTarget(undefined);
    }
    this.map = createMap('map');
    const view = createView([0, 0, 1024, 968]);
    const layer = createLayer('./online_communities.png', [0, 0, 1024, 968]);
    this.map.setView(view);
    this.map.addLayer(layer);
  }

  render() {
    return (
      <div>
        <div id="map" className={styles.map} />
        <button onClick={this.onClick.bind(this)} type="button">
          Create Map
        </button>
      </div>
    );
  }
}

export default Map12;
