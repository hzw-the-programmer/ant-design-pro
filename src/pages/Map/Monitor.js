import React, { Component } from 'react';

import { connect } from 'dva';
import { Switch, Card, Cascader, Select } from 'antd';

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

import ReactEcharts from 'echarts-for-react';

// import { rtlWS } from '@/services/sh';

import styles from './Monitor.less';

function createView(extent) {
  const projection = new Projection({
    code: 'hzw',
    extent,
  });

  const view = new View({
    center: getCenter(extent),
    zoom: 2,
    projection,
  });

  return view;
}

function createLayer(url, extent) {
  const layer = new ImageLayer({
    source: new ImageStatic({
      url,
      imageExtent: extent,
    }),
  });

  return layer;
}

@connect(({ monitor }) => ({
  monitor,
}))
class Monitor extends Component {
  componentDidMount() {
    const {
      monitor: { heatmap },
    } = this.props;

    const mapLayer = new ImageLayer({
      source: new ImageStatic({
        visible: false,
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
      visible: heatmap,
    });

    const layers = [mapLayer, this.regionLayer, this.peopleLayer, this.heatmapLayer];

    const mousePositionControl = new MousePosition();

    this.map = new Map({
      target: 'map',
      layers,
      controls: defaultControls().extend([mousePositionControl]),
    });
  }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  componentDidUpdate() {
    console.log('componentDidUpdate');
    const {
      monitor: { rtl, map, heatmap },
    } = this.props;

    this.regionLayer.getSource().clear();
    this.peopleSource.clear();
    this.heatmapLayer.setVisible(heatmap);

    if (map.url === '') {
      this.url = map.url;
      this.map
        .getLayers()
        .item(0)
        .setVisible(false);
      return;
    }

    if (map.url !== this.url) {
      this.url = map.url;
      const image = new Image();
      image.src = map.url;
      image.onload = () => {
        const extent = [0, 0, image.width, image.height];
        const view = createView(extent);
        this.map.setView(view);
        const layer = createLayer(map.url, extent);
        this.map.getLayers().removeAt(0);
        this.map.getLayers().insertAt(0, layer);
      };
    }

    rtl.regions.forEach(region => {
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

    rtl.people.forEach(person => {
      if (!person.visible) return;
      const pointFeature = new Feature({
        geometry: new Point([person.pos.x, person.pos.y]),
        type: person.type,
      });
      this.peopleSource.addFeature(pointFeature);
    });
  }

  componentWillUnmount() {
    this.map.setTarget(undefined);
  }

  getOption() {
    const {
      monitor: { rtl },
    } = this.props;

    const options = {
      title: {
        text: '区域占比',
        x: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: [],
      },
      series: [
        {
          name: '区域占比',
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: [],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
    if (!rtl.regions) return options;

    rtl.regions.forEach(region => {
      if (options.legend.data.length !== rtl.regions.length) {
        options.legend.data.push(region.name);
      }
      options.series[0].data.push({
        value: region.total,
        name: region.name,
      });
    });

    return options;
  }

  toggleHeatmap = () => {
    const {
      monitor: { heatmap },
      dispatch,
    } = this.props;

    dispatch({
      type: 'monitor/changeHeatmap',
      payload: !heatmap,
    });
  };

  changePlace = place => {
    const { dispatch } = this.props;

    dispatch({
      type: 'monitor/changePlace',
      payload: place,
    });
  };

  changePerson = person => {
    const { dispatch } = this.props;

    dispatch({
      type: 'monitor/changePerson',
      payload: person,
    });
  };

  render() {
    const {
      monitor: { places, place, rtl, people, person, heatmap },
    } = this.props;

    return (
      <div>
        <Cascader
          options={places}
          value={place}
          onChange={this.changePlace}
          placeholder="请选择地址"
        />
        <br />
        <Select
          style={{ width: '178px' }}
          placeholder="找人"
          allowClear
          onChange={this.changePerson}
          value={person}
        >
          {people.map(p => (
            <Select.Option key={p.id} value={p.id}>
              {p.name}
            </Select.Option>
          ))}
        </Select>
        <div id="map" className={styles.map} />
        <Switch checked={heatmap} onChange={this.toggleHeatmap} />
        <Card>
          <div style={{ textAlign: 'center' }}>总人数</div>
          <div style={{ textAlign: 'center', fontSize: 50 }}>{rtl.people && rtl.people.length}</div>
        </Card>
        <Card>
          <ReactEcharts option={this.getOption()} />
        </Card>
      </div>
    );
  }
}

export default Monitor;
