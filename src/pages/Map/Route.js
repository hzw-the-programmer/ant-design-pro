import React, { Component } from 'react';

import { connect } from 'dva';

import { Select, DatePicker, Button, Cascader } from 'antd';

import { isEqual } from 'lodash';

import Map from 'ol/Map';
import View from 'ol/View';
import { Image as ImageLayer, Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource, ImageStatic } from 'ol/source';
import Projection from 'ol/proj/Projection';
import { getCenter } from 'ol/extent';
import Feature from 'ol/Feature';
import { Point, LineString } from 'ol/geom';

import styles from './Route.less';

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
    });

    const layers = [mapLayer, routeLayer];

    this.map = new Map({
      target: 'map',
      layers,
    });
  }

  componentDidUpdate() {
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
      map: { url, extent },
      locations,
    } = route;

    if (this.url !== url) {
      this.url = url;

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
    }

    routeSource.clear();
    const coords = [];
    locations.forEach(location => {
      routeSource.addFeature(new Feature(new Point(location.coord)));
      coords.push(location.coord);
    });
    routeSource.addFeature(new Feature(new LineString(coords)));
  }

  componentWillUnmount() {
    this.map.setTarget(undefined);
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
