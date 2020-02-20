import React, { Component } from 'react';

import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { OSM, TileDebug } from 'ol/source';

class Map1 extends Component {
  constructor(props) {
    super(props);
    console.log('Map1.constructor');
    this.mapRef = React.createRef();
  }

  render() {
    console.log('Map1.render');
    return <div ref={this.mapRef} style={{ width: '100%', height: '400px' }} />;
  }

  componentDidMount() {
    console.log('Map1.componentDidMount');
    this.map = new Map({
      target: this.mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new TileLayer({
          source: new TileDebug(),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 1,
      }),
    });

    this.map.on('click', this.handleMapClick.bind(this));
  }

  componentWillUnmount() {
    console.log('Map1.componentWillUnmount');
    this.map.setTarget(undefined);
  }

  handleMapClick(event) {
    console.log(event);
  }
}

export default Map1;
