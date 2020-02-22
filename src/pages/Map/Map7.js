import React, { Component } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Draw } from 'ol/interaction';
import { toStringXY } from 'ol/coordinate';

class Map7 extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.coordsRef = React.createRef();
    this.handleAddFeature = this.handleAddFeature.bind(this);
    this.state = {};
  }

  componentDidMount() {
    const washingtonLonLat = [-77.036667, 38.895];
    const washingtonWebMercator = fromLonLat(washingtonLonLat);

    const vectorSource = new VectorSource();
    vectorSource.on('addfeature', this.handleAddFeature);

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
        new VectorLayer({
          source: vectorSource,
        }),
      ],
    });

    this.map.addInteraction(
      new Draw({
        type: 'Point',
        source: vectorSource,
      })
    );
  }

  componentWillUnmount() {
    this.map.setTarget(undefined);
  }

  handleAddFeature(event) {
    this.setState({
      coords: event.feature.getGeometry().getCoordinates(),
    });
  }

  render() {
    const { coords } = this.state;
    return (
      <div>
        <div ref={this.mapRef} style={{ width: '100%', height: '400px' }} />
        <span>EPSG:3857 {coords ? toStringXY(coords) : ''}</span>
        <br />
        <span>LonLat {coords ? toStringXY(toLonLat(coords)) : ''}</span>
      </div>
    );
  }
}

export default Map7;
