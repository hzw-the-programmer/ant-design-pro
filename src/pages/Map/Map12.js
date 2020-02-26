import React, { Component } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import Projection from 'ol/proj/Projection';
import { getCenter } from 'ol/extent';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import styles from './Map12.less';

function createMap(target) {
  const mapLayer = new ImageLayer({
    visible: false,
  });
  const regionLayer = new VectorLayer({
    source: new VectorSource(),
  });
  const peopleLayer = new VectorLayer({
    source: new VectorSource(),
  });
  const heatmapLayer = new VectorLayer({
    source: new VectorSource(),
  });
  const map = new Map({
    target,
    layers: [mapLayer, regionLayer, peopleLayer, heatmapLayer],
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
  componentDidMount() {
    this.map = createMap('map');
    this.count = 0;
  }

  onClick() {
    this.map.getLayers().removeAt(0);
    if (this.count % 2 === 0) {
      const extent = [0, 0, 668, 550];
      const view = createView(extent);
      const layer = createLayer('./hospitalMap2.png', extent);
      this.map.setView(view);
      this.map.getLayers().insertAt(0, layer);
    } else {
      const extent = [0, 0, 1650, 1275];
      const view = createView(extent);
      const layer = createLayer('./PRMC-2nd-floor-map-8-2013.png', extent);
      this.map.setView(view);
      this.map.getLayers().insertAt(0, layer);
    }
    this.count += 1;
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
