import React, { Component } from 'react';

import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Stroke, Fill, Icon, Text } from 'ol/style';

class Map2 extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  componentDidMount() {
    const vectorSource = new VectorSource({
      url: './countries.geojson',
      format: new GeoJSON(),
    });

    this.map = new Map({
      target: this.mapRef.current,
      layers: [
        new VectorLayer({
          source: vectorSource,
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    const bgStyle = new Style({
      stroke: new Stroke({
        color: [255, 0, 0, 0.6],
        width: 2,
      }),
      fill: new Fill({
        color: [255, 0, 0, 0.2],
      }),
      // zIndex: 1,
    });

    const fgStyles = {};

    const featureOverlay = new VectorLayer({
      map: this.map,
      source: new VectorSource(),
      style(feature) {
        const isoCode = feature.get('isoCode');
        if (isoCode) {
          if (!fgStyles[isoCode]) {
            fgStyles[isoCode] = new Style({
              image: new Icon({
                src: `./flags/${isoCode}.png`,
              }),
              text: new Text({
                text: feature.get('text'),
                offsetY: -15,
                stroke: new Stroke({
                  color: [255, 255, 255, 0.5],
                  width: 4,
                }),
                // fill: new Fill({
                //   color: [0, 0, 0, 1],
                // }),
                // font: '12px Calibri,sans-serif',
                // textAlign: 'center',
              }),
              // zIndex: 2,
            });
          }
          return fgStyles[isoCode];
        }
        return bgStyle;
      },
    });

    this.map.on('pointermove', event => {
      const { coordinate, pixel } = event;

      featureOverlay.getSource().clear();

      this.map.forEachFeatureAtPixel(pixel, (feature, layer) => {
        let pointCoordinate;

        if (!layer) return;

        const geometry = feature.getGeometry();

        switch (geometry.getType()) {
          case 'MultiPolygon': {
            const polygon = geometry
              .getPolygons()
              .reduce((left, right) => (left.getArea() > right.getArea() ? left : right));
            pointCoordinate = polygon.getInteriorPoint().getCoordinates();
            break;
          }
          case 'Polygon':
            pointCoordinate = geometry.getInteriorPoint().getCoordinates();
            break;
          default:
            pointCoordinate = geometry.getClosestPoint(coordinate);
            break;
        }

        const textFeature = new Feature({
          geometry: new Point(pointCoordinate),
          text: feature.get('name'),
          isoCode: feature.get('iso_a2').toLowerCase(),
        });

        featureOverlay.getSource().addFeature(textFeature);
        featureOverlay.getSource().addFeature(feature);
      });
    });
  }

  componentWillUnmount() {
    this.map.setTarget(undefined);
  }

  render() {
    return <div ref={this.mapRef} style={{ width: '100%', height: '400px' }} />;
  }
}

export default Map2;
