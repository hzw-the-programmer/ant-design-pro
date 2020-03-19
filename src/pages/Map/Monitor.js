import React, { Component } from 'react';

import { connect } from 'dva';
import { Switch, Card, Cascader, Select } from 'antd';

import { isEqual } from 'lodash'

import 'ol/ol.css';

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

import styles from './Monitor.less';

function createView(extent) {
  const projection = new Projection({
    code: 'hzw',
    extent,
  });

  const view = new View({
    center: getCenter(extent),
    zoom: 1,
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
      monitor: { heatmap, place },
      dispatch,
    } = this.props;

    dispatch({
      type: 'monitor/rtlSub',
      payload: place,
    });

    const mapLayer = new ImageLayer({
      visible: false,
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

    const regionLayer = new VectorLayer({
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

    const peopleSource = new VectorSource()

    const peopleLayer = new VectorLayer({
      source: peopleSource,
    });

    const heatmapLayer = new HeatmapLayer({
      source: peopleSource,
      visible: heatmap,
    });

    const layers = [mapLayer, regionLayer, peopleLayer, heatmapLayer];

    this.map = new Map({
      target: 'map',
      layers,
    });
  }

  componentDidUpdate() {
    const {
      monitor: {
        rtl: { regions, people },
        map: { url, ratio, extent },
        heatmap
      },
      dispatch,
    } = this.props;

    const mapLayer = this.map.getLayers().item(0)
    const regionSource = this.map.getLayers().item(1).getSource()
    const peopleSource = this.map.getLayers().item(2).getSource()
    const heatmapLayer = this.map.getLayers().item(3)

    if (url === '') {
      this.url = url
      mapLayer.setVisible(false)
      regionSource.clear()
      peopleSource.clear()
      heatmapLayer.setVisible(false);
      return;
    }

    if (!isEqual(url, this.url)) {
      this.url = url
      const image = new Image()
      image.src = url
      image.onload = () => {
        const extent = [0, 0, image.width, image.height];
        dispatch({
          type: 'monitor/saveMap',
          payload: { url, ratio, extent },
        });
        const view = createView(extent);
        this.map.setView(view);
        const layer = createLayer(url, extent);
        this.map.getLayers().removeAt(0);
        this.map.getLayers().insertAt(0, layer);
      };

      return
    }

    if (!isEqual(this.regions, regions)) {
      this.regions = regions

      regionSource.clear()
      regions.forEach(re => {
          const l = re.extent[0] * ratio
          const t = extent[3] - (re.extent[1] * ratio)
          const r = (re.extent[0] + re.extent[2]) * ratio
          const b = extent[3] - (re.extent[1] + re.extent[3]) * ratio

          const polygonFeature = new Feature({
              geometry: new Polygon(
                  [[[l, b], [r, b], [r, t], [l, t]]]
              ),
              type: re.type,
          })
          regionSource.addFeature(polygonFeature)

          const pointFeature = new Feature({
              geometry: new Point([l, t]),
              name: re.name,
              total: re.total,
          })
          regionSource.addFeature(pointFeature)
      })
    }

    // rtl.people.forEach(person => {
    //   if (!person.visible) return;
    //   const pointFeature = new Feature({
    //     geometry: new Point([person.pos.x, person.pos.y]),
    //     type: person.type,
    //   });
    //   this.peopleSource.addFeature(pointFeature);
    // });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;

    dispatch({
      type: 'monitor/rtlSub',
      payload: [],
    });

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
          allowClear={false}
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
