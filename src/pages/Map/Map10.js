import React, { Component } from 'react';

import { connect } from 'dva';

import Map from 'ol/Map';
import View from 'ol/View';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import Projection from 'ol/proj/Projection';
import { getCenter } from 'ol/extent';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import MousePosition from 'ol/control/MousePosition';
import { defaults as defaultControls } from 'ol/control';
import Polygon from 'ol/geom/Polygon';
import Point from 'ol/geom/Point';
import { Style, Stroke, Fill, Text } from 'ol/style';
import HeatmapLayer from 'ol/layer/Heatmap';

@connect(({ map }) => ({
  map,
}))
class Map10 extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  componentDidMount() {
    const { dispatch } = this.props;

    this.timerId = setInterval(() => {
      dispatch({
        type: 'map/fetchRTI',
      });
    }, 1000);

    const extent = [0, 0, 1024, 968];
    const center = getCenter(extent);
    const projection = new Projection({
      code: 'hzw',
      extent,
    });

    const view = new View({
      center,
      zoom: 2,
      projection,
    });

    const mapLayer = new ImageLayer({
      source: new ImageStatic({
        url: './online_communities.png',
        imageExtent: extent,
      }),
    });

    const regionBgStyle = new Style({
      stroke: new Stroke({
        color: '#3399cc',
        width: 1.25,
      }),
      fill: new Fill({
        color: [255, 255, 255, 0.4],
      }),
    });

    this.regionLayer = new VectorLayer({
      source: new VectorSource(),
      style(feature) {
        const name = feature.get('name');
        if (name) {
          return new Style({
            text: new Text({
              text: `${name}\n共${feature.get('total')}人`,
              textAlign: 'left',
              textBaseline: 'top',
              // padding: [10, 10, 10, 10],
            }),
          });
        }
        return regionBgStyle;
      },
    });

    this.peopleSource = new VectorSource();
    this.peopleLayer = new VectorLayer({
      source: this.peopleSource,
    });

    this.heatmapLayer = new HeatmapLayer({
      source: this.peopleSource,
    });

    const layers = [mapLayer, this.regionLayer, this.peopleLayer, this.heatmapLayer];

    const mousePositionControl = new MousePosition();

    this.map = new Map({
      target: this.mapRef.current,
      view,
      layers,
      controls: defaultControls().extend([mousePositionControl]),
    });
  }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  componentDidUpdate() {
    const {
      map: { rti },
    } = this.props;

    this.regionLayer.getSource().clear();
    rti.regions.forEach(region => {
      const l = region.rect.x;
      const b = region.rect.y - region.rect.h;
      const r = region.rect.x + region.rect.w;
      const t = region.rect.y;
      const polygonFeature = new Feature(new Polygon([[[l, b], [r, b], [r, t], [l, t]]]));
      this.regionLayer.getSource().addFeature(polygonFeature);
      const pointFeature = new Feature({
        geometry: new Point([l, t]),
        name: region.name,
        total: region.total,
      });
      this.regionLayer.getSource().addFeature(pointFeature);
    });

    this.peopleSource.clear();
    rti.people.forEach(person => {
      const pointFeature = new Feature({
        geometry: new Point([person.pos.x, person.pos.y]),
        type: person.type,
      });
      this.peopleSource.addFeature(pointFeature);
    });
  }

  componentWillUnmount() {
    this.map.setTarget(undefined);
    clearInterval(this.timerId);
  }

  render() {
    return <div ref={this.mapRef} style={{ width: '100%', height: '400px' }} />;
  }
}

export default Map10;
