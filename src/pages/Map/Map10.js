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
    dispatch({
      type: 'map/fetchRegions',
    });

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

    const layer = new ImageLayer({
      source: new ImageStatic({
        url: './online_communities.png',
        imageExtent: extent,
      }),
    });

    this.vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: this.vectorSource,
    });

    const layers = [layer, vectorLayer];

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
      map: { regions },
    } = this.props;
    regions.forEach(region => {
      const l = region.rect.x;
      const b = region.rect.y - region.rect.h;
      const r = region.rect.x + region.rect.w;
      const t = region.rect.y;
      const polygonFeature = new Feature(new Polygon([[[l, b], [r, b], [r, t], [l, t]]]));
      this.vectorSource.addFeature(polygonFeature);
    });
  }

  render() {
    return <div ref={this.mapRef} style={{ width: '100%', height: '400px' }} />;
  }
}

export default Map10;
