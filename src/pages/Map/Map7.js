import React, { Component } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';

class Map7 extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  render() {
    return <div ref={this.mapRef} style={{ width: '100%', height: '400px' }} />;
  }

  componentDidMount() {
    const washingtonLonLat = [-77.036667, 38.895];
    const washingtonWebMercator = fromLonLat(washingtonLonLat);
    console.log(washingtonWebMercator);

    this.map = new Map({
      target: this.mapRef.current,
      view: new View({
        center: washingtonWebMercator,
        zoom: 12,
      }),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
    });
  }

  componentWillUnmount() {
    this.map.setTarget(undefined);
  }
}

export default Map7;
