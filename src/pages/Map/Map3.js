import React, { Component } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer, Heatmap as HeatmapLayer } from 'ol/layer';
import Stamen from 'ol/source/Stamen';
import VectorSource from 'ol/source/Vector';
import KML from 'ol/format/KML';

import styles from './Map3.less';

class Map3 extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.state = {
      radius: 5,
      blur: 15,
      showHeatmap: false,
    };
    this.toggleHeatmap = this.toggleHeatmap.bind(this);
  }

  componentDidMount() {
    const { radius, blur, showHeatmap } = this.state;

    const raster = new TileLayer({
      source: new Stamen({
        layer: 'toner',
      }),
    });

    const location = new VectorLayer({
      source: new VectorSource({
        url: './2012_Earthquakes_Mag5.kml',
        format: new KML({
          extractStyles: false,
        }),
      }),
    });

    this.heatmap = new HeatmapLayer({
      source: new VectorSource({
        url: './2012_Earthquakes_Mag5.kml',
        format: new KML({
          extractStyles: false,
        }),
      }),
      radius: parseInt(radius, 10),
      blur: parseInt(blur, 10),
      weight(feature) {
        const name = feature.get('name');
        const magnitude = parseFloat(name.substr(2));
        return magnitude - 5;
      },
      visible: showHeatmap,
    });

    this.map = new Map({
      target: this.mapRef.current,
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
      layers: [raster, location, this.heatmap],
    });
  }

  componentWillUnmount() {
    this.map.setTarget(undefined);
  }

  handleRadiusChange(event) {
    const radius = event.target.value;
    this.heatmap.setRadius(parseInt(radius, 10));
    this.setState({
      radius,
    });
  }

  handleBlurChange(event) {
    const blur = event.target.value;
    this.heatmap.setBlur(parseInt(blur, 10));
    this.setState({
      blur,
    });
  }

  toggleHeatmap() {
    const { showHeatmap } = this.state;
    this.setState({
      showHeatmap: !showHeatmap,
    });
    this.heatmap.setVisible(!showHeatmap);
  }

  render() {
    const { radius, blur, showHeatmap } = this.state;

    return (
      <div>
        <div ref={this.mapRef} className={styles.map} />
        <input type="checkbox" onChange={this.toggleHeatmap} checked={showHeatmap} /> 热力图
        <br />
        <label htmlFor="radius">
          radius size
          <br />
          <input
            id="radius"
            type="range"
            min="1"
            max="50"
            step="1"
            value={radius}
            onChange={this.handleRadiusChange.bind(this)}
          />
        </label>
        <br />
        <label htmlFor="blur">
          blur size
          <br />
          <input
            id="blur"
            type="range"
            min="1"
            max="50"
            step="1"
            value={blur}
            onChange={this.handleBlurChange.bind(this)}
          />
        </label>
      </div>
    );
  }
}

export default Map3;
