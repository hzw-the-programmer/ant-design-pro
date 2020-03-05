import React, { PureComponent } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer } from 'ol/layer';
import { TileJSON } from 'ol/source';
import Overlay from 'ol/Overlay';
import { toLonLat } from 'ol/proj';
import { toStringHDMS } from 'ol/coordinate';

import styles from './Map17.less';

const key =
  'pk.eyJ1IjoidHNjaGF1YiIsImEiOiJjaW5zYW5lNHkxMTNmdWttM3JyOHZtMmNtIn0.CDIBD8H-G2Gf-cPkIuWtRg';

export default class Map17 extends PureComponent {
  constructor(props) {
    super(props);
    this.container = React.createRef();
    this.closer = React.createRef();
    this.content = React.createRef();
  }

  componentDidMount() {
    const raster = new TileLayer({
      source: new TileJSON({
        url: `https://api.tiles.mapbox.com/v4/mapbox.natural-earth-hypso-bathy.json?access_token=${key}`,
      }),
    });
    const layers = [raster];

    const overlay = new Overlay({
      element: this.container.current,
    });

    const overlays = [overlay];

    this.map = new Map({
      target: 'map',
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
      layers,
      overlays,
    });

    this.map.on('singleclick', event => {
      const coord = event.coordinate;
      const hdms = toStringHDMS(toLonLat(coord));
      this.content.current.innerHTML = `<p>You clicked here:</p><code>${hdms}</code>`;

      overlay.setPosition(coord);
    });

    this.closer.current.onclick = () => {
      overlay.setPosition(undefined);
      this.closer.current.blur();
      return false;
    };
  }

  render() {
    return (
      <div>
        <div id="map" className={styles.map} />
        <div ref={this.container} className={styles.ol_popup}>
          <a href="#" className={styles.ol_popup_closer} ref={this.closer}>
            ✖
          </a>
          <div ref={this.content} />
        </div>
      </div>
    );
  }
}
