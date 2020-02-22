import React, { Component } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import Projection from 'ol/proj/Projection';
import { getCenter } from 'ol/extent';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import MousePosition from 'ol/control/MousePosition';
import { defaults as defaultControls } from 'ol/control';
import Polygon from 'ol/geom/Polygon';

class Map10 extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  componentDidMount() {
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

    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    const pointFeature = new Feature(new Point(center));
    vectorSource.addFeature(pointFeature);

    const polygonFeature = new Feature(
      new Polygon([[[250, 530], [450, 530], [450, 630], [250, 630]]])
    );
    vectorSource.addFeature(polygonFeature);

    const layers = [layer, vectorLayer];

    const mousePositionControl = new MousePosition();

    this.map = new Map({
      target: this.mapRef.current,
      view,
      layers,
      controls: defaultControls().extend([mousePositionControl]),
    });
  }

  render() {
    return <div ref={this.mapRef} style={{ width: '100%', height: '400px' }} />;
  }
}

export default Map10;
