import React, { PureComponent } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource, OSM } from 'ol/source';
import { Draw } from 'ol/interaction';

import smooth from 'chaikin-smooth';

import styles from './Map14.less';

function makeSmooth(path, numIterations) {
  let ni = Math.min(Math.max(numIterations, 1), 10);
  let p = path;
  while (ni > 0) {
    p = smooth(p);
    ni -= 1;
  }
  return p;
}

export default class Map14 extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      shallSmoothen: false,
    };
    this.changeShallSmoothen = this.changeShallSmoothen.bind(this);
  }

  componentDidMount() {
    const vectorSource = new VectorSource();

    this.map = new Map({
      target: 'map',
      view: new View({
        center: [1078373.595, 6871994.591],
        zoom: 5,
      }),
      layers: [
        new TileLayer({
          source: new OSM(),
          opacity: 0.5,
        }),
        new VectorLayer({
          source: vectorSource,
        }),
      ],
    });

    const draw = new Draw({
      source: vectorSource,
      type: 'LineString',
    });
    draw.on('drawend', event => {
      const { shallSmoothen } = this.state;
      if (!shallSmoothen) return;

      const { feature } = event;
      const geometry = feature.getGeometry();
      const coordinates = geometry.getCoordinates();
      const smoothened = makeSmooth(coordinates, 5);
      geometry.setCoordinates(smoothened);
    });

    this.map.addInteraction(draw);
  }

  changeShallSmoothen() {
    const { shallSmoothen } = this.state;
    this.setState({
      shallSmoothen: !shallSmoothen,
    });
  }

  render() {
    const { shallSmoothen } = this.state;

    return (
      <div>
        <div id="map" className={styles.map} />
        <label htmlFor="shall-smoothen">
          Smooth drawn geometry?
          <input
            id="shall-smoothen"
            type="checkbox"
            checked={shallSmoothen}
            onChange={this.changeShallSmoothen}
          />
        </label>
      </div>
    );
  }
}
