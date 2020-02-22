import React, { Component } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import { Image as ImageLayer, Vector as VectorLayer } from 'ol/layer';
import Static from 'ol/source/ImageStatic';
import VectorSource from 'ol/source/Vector';
import Projection from 'ol/proj/Projection';
import { getCenter } from 'ol/extent';
import { Draw } from 'ol/interaction';
import { toStringXY } from 'ol/coordinate';

class Map8 extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
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
            url: 'https://imgs.xkcd.com/comics/online_communities.png',
            imageExtent: extent,
            // projection,
          }),
        }),
        new VectorLayer({
          source: vectorSource,
        }),
      ],
    });

    this.map.addInteraction(
      new Draw({
        type: 'Point',
        source: vectorSource,
      })
    );
  }

  handleAddFeature(event) {
    this.setState({
      coordinates: event.feature.getGeometry().getCoordinates(),
    });
  }

  render() {
    const { coordinates } = this.state;
    return (
      <div>
        <div ref={this.mapRef} style={{ width: '100%', height: '400px' }} />
        <span>{coordinates ? toStringXY(coordinates) : ''}</span>
      </div>
    );
  }
}

export default Map8;
