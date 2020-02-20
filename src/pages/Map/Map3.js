import React, { Component } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Heatmap as HeatmapLayer } from 'ol/layer'
import Stamen from 'ol/source/Stamen'
import VectorSource from 'ol/source/Vector'
import KML from 'ol/format/KML';

class Map3 extends Component {
  constructor(props) {
    super(props)
    this.mapRef = React.createRef()
    this.state = {
      radius: 5,
      blur: 15
    }
  }

  render() {
    const { radius, blur } = this.state
    return (
      <div>
        <div ref={this.mapRef} style={{ width: '100%', height: '400px' }} />
        <label>radius size</label><br />
        <input ref={this.radiusRef} type="range" min="1" max="50" step="1" value={radius} onChange={this.handleRadiusChange.bind(this)} /><br />
        <label>blur size</label><br />
        <input ref={this.blurRef} type="range" min="1" max="50" step="1" value={blur} onChange={this.handleBlurChange.bind(this)} />
      </div>
    );
  }

  componentDidMount() {
    const raster = new TileLayer({
      source: new Stamen({
        layer: 'toner'
      })
    })

    const { radius, blur } = this.state
    this.vector = new HeatmapLayer({
      source: new VectorSource({
        url: './2012_Earthquakes_Mag5.kml',
        format: new KML({
          extractStyles: false
        })
      }),
      radius: parseInt(radius, 10),
      blur: parseInt(blur, 10),
      weight: function(feature) {
        const name = feature.get('name')
        // console.log(name, name.substr(2))
        const magnitude = parseFloat(name.substr(2))
        return magnitude - 5
      }
    })

    this.map = new Map({
      target: this.mapRef.current,
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
      layers: [raster, this.vector],
    });
  }

  componentWillUnmount() {
    this.map.setTarget(undefined);
  }

  handleRadiusChange(event) {
    const radius = event.target.value
    this.vector.setRadius(parseInt(radius, 10))
    this.setState({
      radius
    })
  }

  handleBlurChange(event) {
    const blur = event.target.value
    this.vector.setBlur(parseInt(blur, 10))
    this.setState({
      blur
    })
  }
}

export default Map3;
