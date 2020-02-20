import React, { Component } from 'react';

import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';

class Map2 extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  render() {
    return <div ref={this.mapRef} style={{ width: '100%', height: '400px' }} />;
  }

  componentDidMount() {
    this.map = new Map({
      target: this.mapRef.current,
      layers: [
        new VectorLayer({
          source: new VectorSource({
            format: new GeoJSON(),
            url: './countries.json',
          }),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });
  }

  componentWillUnmount() {
    this.map.setTarget(undefined);
  }
}

export default Map2;
