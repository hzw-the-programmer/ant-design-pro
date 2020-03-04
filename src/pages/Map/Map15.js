import React, { Component } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Draw, defaults as defaultInteractions, DragRotateAndZoom } from 'ol/interaction';
import { Style, Stroke, Icon, Circle, Fill } from 'ol/style';
import { Point } from 'ol/geom';

import styles from './Map15.less';

function styleFunction(feature) {
  const fstyles = [
    new Style({
      stroke: new Stroke({
        width: 2,
        color: '#ffcc33',
      }),
    }),
  ];

  const geometry = feature.getGeometry();
  geometry.forEachSegment((start, end) => {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const rotation = Math.atan2(dy, dx);

    fstyles.push(
      new Style({
        geometry: new Point([start[0] + dx / 2, start[1] + dy / 2]),
        image: new Icon({
          src: './arrow.png',
          rotation: -rotation,
          rotateWithView: true,
          anchor: [0.5, 0.5],
        }),
      })
    );

    fstyles.push(
      new Style({
        geometry: new Point([start[0] + dx / 2, start[1] + dy / 2]),
        image: new Circle({
          radius: 2,
          fill: new Fill({ color: 'black' }),
          stroke: new Stroke({
            color: 'white',
            width: 2,
          }),
        }),
      })
    );
  });

  return fstyles;
}

export default class Map15 extends Component {
  componentDidMount() {
    const view = new View({
      center: [-11000000, 4600000],
      zoom: 4,
    });

    const raster = new TileLayer({
      source: new OSM(),
    });

    const source = new VectorSource();

    const vector = new VectorLayer({
      source,
      style: styleFunction,
    });

    const layers = [raster, vector];

    this.map = new Map({
      target: 'map',
      view,
      layers,
      interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
    });

    this.map.addInteraction(
      new Draw({
        source,
        type: 'LineString',
      })
    );
  }

  componentWillUnmount() {
    this.map.setTarget(undefined);
  }

  render() {
    return <div id="map" className={styles.map} />;
  }
}
