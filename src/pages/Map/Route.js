import React, { Component } from 'react';

import { connect } from 'dva';

import {
  Select,
  DatePicker,
  Button,
  Cascader,
  Form,
  Row,
  Col,
  Card,
  Switch,
} from 'antd';

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

import PageHeaderWrapper from '@/components/PageHeaderWrapper';

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
@Form.create()
class Route extends Component {
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

  updateMap = () => {
    const {
      route: { place, routes, displayTime },
      dispatch,
    } = this.props;
    
    const [ route ] = routes.filter(r => isEqual(r.place, place));

    const routeSource = this.map.getLayers().item(1).getSource();
    
    if (!route) {
      this.url = undefined;
      this.map.getLayers().item(0).setVisible(false);
      routeSource.clear();
      return;
    }

    const {
      map: { url, ratio, extent },
      locations,
    } = route;

    if (this.url !== url) {
      this.url = url;

      const image = new Image();
      image.src = url;
      image.onload = () => {
        const newExtent = [0, 0, image.width, image.height];
        const projection = new Projection({
          code: 'hzw',
          extent: newExtent,
        });

        const view = new View({
          center: getCenter(newExtent),
          zoom: 1,
          projection,
        });
        this.map.setView(view);

        const mapLayer = new ImageLayer({
          source: new ImageStatic({
            url,
            imageExtent: newExtent,
          }),
        });
        this.map.getLayers().removeAt(0);
        this.map.getLayers().insertAt(0, mapLayer);

        dispatch({
          type: 'route/saveMap',
          payload: {
            place,
            map: {url, ratio, extent: newExtent},
          }
        })
      };

      return
    }

    routeSource.clear();
    const coords = [];
    locations.forEach(location => {
      let [x, y] = location.coord;
      x *= ratio;
      y = extent[3] - y * ratio;
      if (displayTime) {
        routeSource.addFeature(
          new Feature({
            geometry: new Point([x, y]),
            text: `${moment.unix(location.datetime).format('YYYY-MM-DD HH:mm:ss')} ${location.duration}`,
          })
        );
      } else {
        routeSource.addFeature(
          new Feature({
            geometry: new Point([x, y]),
          })
        );
      }
      
      coords.push([x, y]);
    });
    routeSource.addFeature(new Feature(new LineString(coords)));
  }

  handleFormSubmit = e => {
    const { form, dispatch } = this.props
    e.preventDefault()
    form.validateFields((errors, formValues) => {
      if (errors) return
      dispatch({
        type: 'route/fetchRoutes',
        payload: formValues,
      })
      dispatch({
        type: 'route/saveFormValues',
        payload: formValues,
      })
    })
  }

  changePlace = place => {
    const { dispatch } = this.props;
    dispatch({
      type: 'route/changePlace',
      payload: place,
    });
  }

  toggleDisplayTime = () => {
    const { dispatch, route: { displayTime } } = this.props
    dispatch({
      type: 'route/saveDisplayTime',
      payload: !displayTime,
    })
  }

  render() {
    const {
      monitor: { people },
      route: { places, place, formValues, displayTime },
      form: { getFieldDecorator },
    } = this.props;

    return (
      <PageHeaderWrapper>
        <Card>
          <div className={styles.form}>
            <Form layout="inline" onSubmit={this.handleFormSubmit} hideRequiredMark>
              <Row gutter={{md: 8}}>
                <Col md={8}>
                  <Form.Item label="姓名">
                    {getFieldDecorator('person', {
                      rules: [{required: true}],
                      initialValue: formValues.person,
                    })(
                      <Select
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
                    )}
                  </Form.Item>  
                </Col>
                <Col md={8}>
                  <Form.Item label="时间">
                    {getFieldDecorator('datetime', {
                      rules: [{required: true}],
                      initialValue: formValues.datetime,
                    })(
                      <DatePicker.RangePicker
                        showTime={{ format: 'HH:mm:ss' }}
                        style={{width: '100%'}}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col md={8}>
                  <div className={styles.submitButtons}>
                    <Button type="primary" htmlType="submit">
                      查询
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
            
            <Form>
              <Row gutter={{md: 8}}>
                <Col md={8}>
                  <Form.Item label="位置">
                    <Cascader
                      options={places}
                      value={place}
                      onChange={this.changePlace}
                    />                  
                  </Form.Item>
                </Col>
                <Col md={8}>
                  <Form.Item label="时间">
                    <Switch checked={displayTime} onChange={this.toggleDisplayTime} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
          
          <div id="map" className={styles.map} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Route;
