import React, { PureComponent } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { GeoJSON } from 'ol/format';
import { Select, Translate, defaults as defaultInteractions } from 'ol/interaction';

import styles from './Map16.less';

export default class Map16 extends PureComponent {
  componentDidMount() {
    const raster = new TileLayer({
      source: new OSM(),
    });

    const vector = new VectorLayer({
      source: new VectorSource({
        url: './countries.geojson',
        format: new GeoJSON(),
      }),
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

    this.map = new Map({
      target: 'map',
      layers,
      view,
      interactions: defaultInteractions().extend([select, translate]),
    });
  }

  componentWillUnmount() {
    this.map.setTarget(undefined);
  }

  render() {
    return <div id="map" className={styles.map} />;
  }
}
