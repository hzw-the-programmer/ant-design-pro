import React, { Component } from 'react';

import { connect } from 'dva';
import {
  Switch,
  Card,
  Cascader,
  Select,
  Modal,
  Table,
  Form,
  Row,
  Col,
} from 'antd';

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
import { Style, Stroke, Fill, Text, Icon } from 'ol/style';
import HeatmapLayer from 'ol/layer/Heatmap';
import SelectOl from 'ol/interaction/Select'

import ReactEcharts from 'echarts-for-react';

import PageHeaderWrapper from '@/components/PageHeaderWrapper'

import styles from './Monitor.less';

const peopleStyles = [
  null,
  new Style({
    image: new Icon({
        src: './doctor.png',
        // anchor: [0.5, 1],
        scale: 0.01,
    })
  }),
  new Style({
    image: new Icon({
        src: './nurse.png',
        // anchor: [0.5, 1],
        scale: 0.01,
    })
  }),
  new Style({
    image: new Icon({
        src: './patient.png',
        // anchor: [0.5, 1],
        scale: 0.01,
    })
  }),
  new Style({
    image: new Icon({
        src: './severe_patient.png',
        // anchor: [0.5, 1],
        scale: 0.01,
    })
  }),
  new Style({
    image: new Icon({
        src: './guard.png',
        // anchor: [0.5, 1],
        scale: 0.01,
    })
  }),
]

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

const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
  },
  {
    title: '工号',
    dataIndex: 'workid',
  },
  {
    title: '时间',
    dataIndex: 'time',
  },
  {
    title: '区域',
    dataIndex: 'region_name',
  },
  {
    title: '班组',
    dataIndex: 'team',
  },
  {
    title: '状态',
    dataIndex: 'status',
    render(value) {
      return value === 1 ? '在线' : '离线'
    }
  },
]

@connect(({ monitor }) => ({
  monitor,
}))
class Monitor extends Component {
  componentDidMount() {
    const {
      monitor: { heatmap },
      dispatch,
    } = this.props;

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
      style(feature) {
        const type = feature.get('type')
        if (type < peopleStyles.length) {
          return peopleStyles[type]
        }
    }
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

    const select = new SelectOl()
    select.on('select', e => {
      const { dispatch } = this.props
      
      const features = e.target.getFeatures()
      
      const feature = features.item(0)
      if (!feature) {
        dispatch({
          type: 'monitor/saveSelection',
          payload: { rid: -1, pid: -1},
        })
        return
      }

      const id = feature.get('id')
      const geometry = feature.getGeometry()
      const type = geometry.getType()
      if (type === 'Point') {
        dispatch({
          type: 'monitor/saveSelection',
          payload: { rid: -1, pid: id},
        })
      } else if (type === 'Polygon') {
        dispatch({
          type: 'monitor/saveSelection',
          payload: { rid: id, pid: -1},
        })
      }

      features.clear()
    })
    this.map.addInteraction(select)

    this.update()
  }

  componentDidUpdate() {
    this.update()
  }

  componentWillUnmount() {
    this.map.setTarget(undefined);
  }

  update = () => {
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

    heatmapLayer.setVisible(heatmap)

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
              id: re.id,
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

    if (!isEqual(this.people, people)) {
      this.people = people

      peopleSource.clear()
      people.forEach(p => {
          const pointFeature = new Feature({
              geometry: new Point([
                  p.extent[0] * ratio,
                  extent[3] - p.extent[1] * ratio,
              ]),
              id: p.id,
              type: p.type,
          })
          peopleSource.addFeature(pointFeature)
      })
    }
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

  clearSelection = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'monitor/saveSelection',
      payload: { rid: -1, pid: -1},
    })
  }

  render() {
    const {
      monitor: { places, place, rtl, people, person, heatmap, selection },
    } = this.props;

    return (
      <PageHeaderWrapper>
        <Card>
          <div className={styles.form}>
            <Form layout="inline">
              <Row gutter={{md: 8}}>
                <Col md={8}>
                  <Form.Item label="位置">
                    <Cascader
                      options={places}
                      value={place}
                      onChange={this.changePlace}
                      allowClear={false}
                    />
                  </Form.Item>
                </Col>
                <Col md={8}>
                  <Form.Item label="姓名">
                    <Select
                      value={person}
                      onChange={this.changePerson}
                      allowClear
                      showSearch={true}
                      filterOption={(input, option) => {
                          const re = new RegExp(`.*${input}.*`)
                          return re.exec(option.props.children) !== null
                      }}
                    >
                      {people.map(p => (
                        <Select.Option key={p.id} value={p.id}>
                          {p.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col md={8}>
                  <Form.Item label="热力图">
                    <Switch checked={heatmap} onChange={this.toggleHeatmap} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>

          <div id="map" className={styles.map} />

          <Card>
            <div style={{ textAlign: 'center' }}>总人数</div>
            <div style={{ textAlign: 'center', fontSize: 50 }}>{rtl.total}</div>
          </Card>
          <Card>
            <ReactEcharts option={this.getOption()} />
          </Card>
          <Modal
            title="区域详情"
            visible={selection.rid !== -1}
            onOk={this.clearSelection}
            onCancel={this.clearSelection}
          >
            {selection.region ? (
              <div>
                {`${selection.region.name} | 共${selection.region.total}人`}
                <Table
                  columns={columns}
                  dataSource={selection.region.people}
                  rowKey="id"
                />
              </div>
            ): ''}
          </Modal>
          <Modal
            title="人员详情"
            visible={selection.pid !== -1}
            onOk={this.clearSelection}
            onCancel={this.clearSelection}
          >
            {selection.person ? (
              <div>
                <Table
                  columns={columns}
                  dataSource={[selection.person]}
                  rowKey="id"
                />
              </div>
            ): ''}
          </Modal>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Monitor;
