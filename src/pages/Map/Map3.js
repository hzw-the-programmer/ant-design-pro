import React, { Component } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Heatmap as HeatmapLayer } from 'ol/layer';
import Stamen from 'ol/source/Stamen';
import VectorSource from 'ol/source/Vector';
import KML from 'ol/format/KML';

class Map3 extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.radiusRef = React.createRef();
    this.blurRef = React.createRef();
  }

  render() {
    return <div ref={this.mapRef} style={{ width: '100%', height: '400px' }} />;
  }

  componentDidMount() {
    const raster = new TileLayer({
      source: new Stamen({
        layer: 'toner',
      }),
    });

    const vector = new HeatmapLayer({
      source: new VectorSource({
        url: './2012_Earthquakes_Mag5.kml',
        format: new KML(),
      }),
    });

    this.map = new Map({
      target: this.mapRef.current,
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
      layers: [raster, vector],
    });
  }

  componentWillUnmount() {
    this.map.setTarget(undefined);
  }
}

export default Map3;
