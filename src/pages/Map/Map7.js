import React, { Component } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Draw } from 'ol/interaction';
import { toStringXY, createStringXY } from 'ol/coordinate';
import { defaults as defaultControls } from 'ol/control';
import MousePosition from 'ol/control/MousePosition';

class Map7 extends Component {
  constructor(props) {
    super(props);

    this.mapRef = React.createRef();
    this.posRef = React.createRef();
    this.pos1Ref = React.createRef();

    this.handleAddFeature = this.handleAddFeature.bind(this);

    this.state = {};
  }

  componentDidMount() {
    const washingtonLonLat = [-77.036667, 38.895];
    const washingtonWebMercator = fromLonLat(washingtonLonLat);

    const vectorSource = new VectorSource();
    vectorSource.on('addfeature', this.handleAddFeature);

    const mousePosition = new MousePosition({
      coordinateFormat: createStringXY(4),
      target: this.posRef.current,
      className: 'custom-mouse-position',
    });
    const mousePosition1 = new MousePosition({
      coordinateFormat: createStringXY(4),
      projection: 'EPSG:4326',
      target: this.pos1Ref.current,
      className: 'custom-mouse-position',
    });

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
      controls: defaultControls().extend([mousePosition, mousePosition1]),
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
        EPSG:3857
        <div ref={this.posRef} />
        <br />
        EPSG:4326
        <div ref={this.pos1Ref} />
        <br />
        EPSG:3857
        <div>{coords ? toStringXY(coords, 4) : ''}</div>
        <br />
        EPSG:4326
        <div>{coords ? toStringXY(toLonLat(coords), 4) : ''}</div>
      </div>
    );
  }
}

export default Map7;
