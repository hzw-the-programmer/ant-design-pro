import React, { Component } from 'react';

import { connect } from 'dva';

import { Select, DatePicker, Button, Cascader } from 'antd';

import { isEqual } from 'lodash';

import moment from 'moment';

import Map from 'ol/Map';
import View from 'ol/View';
import { Image as ImageLayer, Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource, ImageStatic } from 'ol/source';
import Projection from 'ol/proj/Projection';
import { getCenter } from 'ol/extent';
import Feature from 'ol/Feature';
import { Point, LineString } from 'ol/geom';
import { Style, Stroke, Icon, Circle, Fill, Text } from 'ol/style';

import styles from './Route.less';

function styleFunction(feature) {
  const geometry = feature.getGeometry();
  if (geometry.getType() === 'Point') {
    return new Style({
      image: new Circle({
        radius: 7,
        fill: new Fill({ color: '#ffcc33' }),
        stroke: new Stroke({
          color: 'white',
          width: 2,
        }),
      }),
      text: new Text({
        text: feature.get('text'),
        stroke: new Stroke({
          color: [255, 255, 255, 0.5],
          width: 4,
        }),
        textBaseline: 'bottom',
      }),
    });
  }

  const fstyles = [
    new Style({
      stroke: new Stroke({
        width: 2,
        color: '#ffcc33',
      }),
    }),
  ];

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
  });

  return fstyles;
}

@connect(({ monitor, route }) => ({
  monitor,
  route,
}))
class Route extends Component {
  constructor(props) {
    super(props);
    this.changePerson = this.changePerson.bind(this);
    this.changeDatetime = this.changeDatetime.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.changePlace = this.changePlace.bind(this);
  }

  componentDidMount() {
    const mapLayer = new ImageLayer({
      visible: false,
    });

    this.routeSource = new VectorSource();

    const routeLayer = new VectorLayer({
      source: this.routeSource,
      style: styleFunction,
    });

    const layers = [mapLayer, routeLayer];

    this.map = new Map({
      target: 'map',
      layers,
    });

    this.updateMap();
  }

  componentDidUpdate() {
    this.updateMap();
  }

  componentWillUnmount() {
    this.map.setTarget(undefined);
  }

  updateMap() {
    const {
      route: { place, routes },
    } = this.props;
    const fr = routes.filter(r => isEqual(r.place, place));
    const [route] = fr;

    const routeSource = this.map
      .getLayers()
      .item(1)
      .getSource();
    if (!route) {
      this.url = undefined;
      this.map
        .getLayers()
        .item(0)
        .setVisible(false);
      routeSource.clear();
      return;
    }

    const {
      map: { url, ratio },
      locations,
    } = route;

    if (this.url !== url) {
      this.url = url;

      const image = new Image();
      image.src = url;
      image.onload = () => {
        const extent = [0, 0, image.width, image.height];
        const projection = new Projection({
          code: 'hzw',
          extent,
        });

        const view = new View({
          center: getCenter(extent),
          zoom: 2,
          projection,
        });
        this.map.setView(view);

        const mapLayer = new ImageLayer({
          source: new ImageStatic({
            url,
            imageExtent: extent,
          }),
        });
        this.map.getLayers().removeAt(0);
        this.map.getLayers().insertAt(0, mapLayer);

        routeSource.clear();
        const coords = [];
        locations.forEach(location => {
          let [x, y] = location.coord;
          x *= ratio;
          y = extent[3] - y * ratio;
          routeSource.addFeature(
            new Feature({
              geometry: new Point([x, y]),
              text: `${moment.unix(location.datetime).format()} ${location.duration}`,
            })
          );
          coords.push([x, y]);
        });
        routeSource.addFeature(new Feature(new LineString(coords)));
      };
    }
  }

  changePerson(person) {
    const { dispatch } = this.props;
    dispatch({
      type: 'route/changePerson',
      payload: person,
    });
  }

  changeDatetime(datetime) {
    const { dispatch } = this.props;
    dispatch({
      type: 'route/changeDatetime',
      payload: datetime,
    });
  }

  handleSearch() {
    const {
      dispatch,
      route: { person, datetime },
    } = this.props;

    dispatch({
      type: 'route/fetchRoutes',
      payload: {
        person,
        datetime,
      },
    });
  }

  changePlace(place) {
    const { dispatch } = this.props;
    dispatch({
      type: 'route/changePlace',
      payload: place,
    });
  }

  render() {
    const {
      monitor: { people },
      route: { person, datetime, places, place },
    } = this.props;

    return (
      <div>
        <Select
          style={{ width: '178px' }}
          placeholder="请选择人员"
          allowClear
          onChange={this.changePerson}
          value={person}
        >
          {people.map(p => (
            <Select.Option key={p.id} id={p.id}>
              {p.name}
            </Select.Option>
          ))}
        </Select>
        <br />
        <DatePicker.RangePicker
          showTime={{ format: 'HH:mm:ss' }}
          onChange={this.changeDatetime}
          value={datetime}
        />
        <br />
        <Button type="primary" onClick={this.handleSearch}>
          查询
        </Button>
        <br />
        <Cascader
          options={places}
          value={place}
          onChange={this.changePlace}
          placeholder="请选择地址"
        />
        <div id="map" className={styles.map} />
      </div>
    );
  }
}

export default Route;
