import React, { Component } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM as OSMSource, Vector as VectorSource } from 'ol/source';
import Draw from 'ol/interaction/Draw';

class Map5 extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.state = {
      type: 'Point',
    };
    this.handleTypeChange = this.handleTypeChange.bind(this);
  }

  render() {
    const { type } = this.state;
    return (
      <div>
        <div ref={this.mapRef} style={{ width: '100%', height: '400px' }} />
        <label>Geometry type &nbsp;</label>
        <select value={type} onChange={this.handleTypeChange}>
          <option value="Point">Point</option>
          <option value="LineString">LineString</option>
          <option value="Polygon">Polygon</option>
          <option value="Circle">Circle</option>
          <option value="None">None</option>
        </select>
      </div>
    );
  }

  componentDidMount() {
    const raster = new TileLayer({
      source: new OSMSource(),
    });

    this.vectorSource = new VectorSource();

    const vector = new VectorLayer({
      source: this.vectorSource,
    });

    this.map = new Map({
      target: this.mapRef.current,
      view: new View({
        center: [-11000000, 4600000],
        zoom: 4,
      }),
      layers: [raster, vector],
    });

    this.addInteraction(this.state.type);
  }

  componentWillUnmount() {
    this.map.setTarget(undefined);
  }

  handleTypeChange(event) {
    const type = event.target.value;
    this.setState({
      type,
    });
    this.map.removeInteraction(this.draw);
    this.addInteraction(type);
  }

  addInteraction(type) {
    if (type == 'None') return;
    this.draw = new Draw({
      type,
      source: this.vectorSource,
    });
    this.map.addInteraction(this.draw);
  }
}

export default Map5;
