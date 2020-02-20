import React, { Component } from 'react';

import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { OSM, TileDebug } from 'ol/source';

class HMap extends Component {
  constructor(props) {
    super(props);
    console.log('HMap.constructor');
    this.mapRef = React.createRef();
  }

  render() {
    console.log('HMap.render');
    return <div ref={this.mapRef} style={{ width: '100%', height: '400px' }} />;
  }

  componentDidMount() {
    console.log('HMap.componentDidMount');
    this.map = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new TileLayer({
          source: new TileDebug(),
        }),
      ],
      target: this.mapRef.current,
      view: new View({
        center: [0, 0],
        zoom: 1,
      }),
    });
  }

  componentWillUnmount() {
    console.log('hMap.componentWillUnmount');
    this.map.setTarget(undefined);
  }
}

export default HMap;
