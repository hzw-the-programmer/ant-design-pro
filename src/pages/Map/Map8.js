import React, { Component } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import { Image as ImageLayer, Vector as VectorLayer } from 'ol/layer';
import Static from 'ol/source/ImageStatic';
import VectorSource from 'ol/source/Vector';
import Projection from 'ol/proj/Projection';
import { getCenter, getTopLeft, getWidth, getHeight } from 'ol/extent';
import Draw, { createBox } from 'ol/interaction/Draw';
import { createStringXY } from 'ol/coordinate';
import { defaults as defaultControls } from 'ol/control';
import MousePosition from 'ol/control/MousePosition';

class Map8 extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.posRef = React.createRef();
    this.handleAddFeature = this.handleAddFeature.bind(this);
    this.state = {};
  }

  componentDidMount() {
    const extent = [0, 0, 1024, 968];
    const center = getCenter(extent);
    const projection = new Projection({
      code: 'xkcd-image',
      extent,
      // units: 'pixels',
    });

    const vectorSource = new VectorSource();
    vectorSource.on('addfeature', this.handleAddFeature);

    const mousePosition = new MousePosition({
      coordinateFormat: createStringXY(4),
      target: this.posRef.current,
      className: 'custom-mouse-position',
    });

    this.map = new Map({
      target: this.mapRef.current,
      view: new View({
        center,
        zoom: 2,
        projection,
      }),
      layers: [
        new ImageLayer({
          source: new Static({
            // attributions: '© <a href="http://xkcd.com/license.html">xkcd</a>',
            url: './online_communities.png',
            imageExtent: extent,
            // projection,
          }),
        }),
        new VectorLayer({
          source: vectorSource,
        }),
      ],
      controls: defaultControls().extend([mousePosition]),
    });

    this.map.addInteraction(
      new Draw({
        type: 'Circle',
        source: vectorSource,
        geometryFunction: createBox(),
      })
    );
  }

  handleAddFeature(event) {
    const extent = event.feature.getGeometry().getExtent();
    this.setState({
      rect: {
        x: getTopLeft(extent)[0],
        y: getTopLeft(extent)[1],
        w: getWidth(extent),
        h: getHeight(extent),
      },
    });
  }

  render() {
    const { rect } = this.state;
    return (
      <div>
        <div ref={this.mapRef} style={{ width: '100%', height: '400px' }} />
        <div ref={this.posRef} />
        {rect ? (
          <div>
            x: <span>{rect.x}</span>
            <br />
            y: <span>{rect.y}</span>
            <br />
            w: <span>{rect.w}</span>
            <br />
            h: <span>{rect.h}</span>
            <br />
          </div>
        ) : null}
      </div>
    );
  }
}

export default Map8;
