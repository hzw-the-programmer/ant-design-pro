import React, { PureComponent } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { TileJSON, Vector as VectorSource } from 'ol/source';
import Feature from 'ol/Feature';
import { Point, LineString, Polygon } from 'ol/geom';
import { Style, Icon, Stroke, Fill } from 'ol/style';

import styles from './Map13.less';

export default class Map13 extends PureComponent {
  componentDidMount() {
    const key =
      'pk.eyJ1IjoiYWhvY2V2YXIiLCJhIjoiY2pzbmg0Nmk5MGF5NzQzbzRnbDNoeHJrbiJ9.7_-_gL8ur7ZtEiNwRfCy7Q';

    const pointFeature = new Feature(new Point([0, 0]));
    const lineFeature = new Feature(new LineString([[-1e7, 1e6], [-1e6, 3e6]]));
    const polygonFeature = new Feature(
      new Polygon([[[-3e6, -1e6], [-3e6, 1e6], [-1e6, 1e6], [-1e6, -1e6], [-3e6, -1e6]]])
    );

    this.map = new Map({
      target: 'map',
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
      layers: [
        new TileLayer({
          source: new TileJSON({
            url: `https://a.tiles.mapbox.com/v4/aj.1x1-degrees.json?access_token=${key}`,
          }),
        }),
        new VectorLayer({
          source: new VectorSource({
            features: [pointFeature, lineFeature, polygonFeature],
          }),
          style: new Style({
            image: new Icon({
              src: 'icon.png',
              // opacity: 0.95,
              anchor: [0.5, 46],
              // anchor: [0.5, 0.5],
              // anchor: [0.5, 0],
              // anchor: [0.5, 1],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              // anchorYUnits: 'fraction',
            }),
            stroke: new Stroke({
              width: 3,
              color: [255, 0, 0, 1],
            }),
            fill: new Fill({
              color: [0, 0, 255, 0.6],
            }),
          }),
        }),
      ],
    });
  }

  render() {
    return (
      <div>
        <div id="map" className={styles.map} />
      </div>
    );
  }
}
