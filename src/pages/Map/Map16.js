import React, { PureComponent } from 'react';

import { connect } from 'dva';

import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { GeoJSON } from 'ol/format';
import { Select, Translate, Modify, defaults as defaultInteractions } from 'ol/interaction';
import Draw, { createBox } from 'ol/interaction/Draw';

import styles from './Map16.less';

export const CREATE_REGION = 0;
export const MODIFY_REGION = 1;

@connect(({ map16 }) => ({
  map16,
}))
class Map16 extends PureComponent {
  constructor(props) {
    super(props);
    this.changeOperation = this.changeOperation.bind(this);
  }

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

    this.draw = new Draw({
      source,
      type: 'Circle',
      geometryFunction: createBox(),
    });

    this.update();
  }

  componentDidUpdate() {
    this.update();
  }

  componentWillUnmount() {
    this.map.setTarget(undefined);
  }

  update() {
    const {
      map16: { operation },
    } = this.props;
    if (operation === CREATE_REGION) {
      this.map.addInteraction(this.draw);
    } else {
      this.map.removeInteraction(this.draw);
    }
  }

  changeOperation(event) {
    const { dispatch } = this.props;
    const {
      target: { value },
    } = event;
    dispatch({
      type: 'map16/changeOperation',
      payload: parseInt(value, 10),
    });
  }

  render() {
    const {
      map16: { operation },
    } = this.props;
    return (
      <div>
        <select value={operation} onChange={this.changeOperation}>
          <option value={CREATE_REGION}>创建区域</option>
          <option value={MODIFY_REGION}>编辑区域</option>
        </select>
        <div id="map" className={styles.map} />
      </div>
    );
  }
}

export default Map16;
