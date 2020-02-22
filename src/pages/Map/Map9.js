import React, { Component } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';

class Map9 extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  componentDidMount() {
    const layers = [
      new TileLayer({
        source: new TileWMS({
          url: 'https://ahocevar.com/geoserver/wms',
          params: {
            LAYERS: 'ne:NE1_HR_LC_SR_W_DR',
            TILED: true,
          },
        }),
      }),
    ];

    this.map = new Map({
      controls: defaultControls().extend([
        new ScaleLine({
          units: 'degrees',
        }),
      ]),
      layers,
      target: this.mapRef.current,
      view: new View({
        // projection: 'EPSG:4326',
        center: [0, 0],
        zoom: 2,
      }),
    });
  }

  render() {
    return <div ref={this.mapRef} style={{ width: '100%', height: '400px' }} />;
  }
}

export default Map9;
