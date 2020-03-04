import React, { PureComponent } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { GeoJSON } from 'ol/format';
import { Select, Translate, Modify, defaults as defaultInteractions } from 'ol/interaction';
import Draw, { createBox } from 'ol/interaction/Draw';

import styles from './Map16.less';

export default class Map16 extends PureComponent {
  componentDidMount() {
    const raster = new TileLayer({
      source: new OSM(),
    });

    const source = new VectorSource({
      url: './countries.geojson',
      format: new GeoJSON(),
      wrapX: false,
    });
    const vector = new VectorLayer({
      source,
    });

    const layers = [raster, vector];

    const view = new View({
      center: [0, 0],
      zoom: 2,
    });

    const select = new Select();
    const translate = new Translate({
      features: select.getFeatures(),
    });
    const modify = new Modify({
      features: select.getFeatures(),
    });

    this.map = new Map({
      target: 'map',
      layers,
      view,
      interactions: defaultInteractions().extend([select, translate, modify]),
    });

    this.map.addInteraction(
      new Draw({
        source,
        type: 'Circle',
        geometryFunction: createBox(),
      })
    );
  }

  componentWillUnmount() {
    this.map.setTarget(undefined);
  }

  render() {
    return <div id="map" className={styles.map} />;
  }
}
