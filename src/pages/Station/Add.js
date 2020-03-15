import React, { PureComponent } from 'react'

import { connect } from 'dva'

import { Cascader, Modal, Form, Input, Row, Col, Select } from 'antd'

import Map from 'ol/Map'
import View from 'ol/View';
import { Image as ImageLayer, Vector as VectorLayer } from 'ol/layer'
import ImageStatic from 'ol/source/ImageStatic';
import VectorSource from 'ol/source/Vector';
import Projection from 'ol/proj/Projection';
import { getCenter } from 'ol/extent'
import Feature from 'ol/Feature'
import Polygon from 'ol/geom/Polygon';
import Point from 'ol/geom/Point';
import { Style, Stroke, Fill, Text, Icon } from 'ol/style';

import styles from './Add.less'

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

const regionNormalStyle = new Style({
    stroke: new Stroke({
      color: '#3399cc',
      width: 1.25,
    }),
    fill: new Fill({
      color: [255, 255, 255, 0.4],
    }),
});

const stationGreen = new Style({
    image: new Icon({
        src: './station_green.png',
        // anchor: [0.5, 1],
        scale: 0.1,
    })
})

const stationBlue = new Style({
    image: new Icon({
        src: './station_blue.png',
        // anchor: [0.5, 1],
        scale: 0.1,
    })
})

@connect(({ station }) => ({
    station,
}))
@Form.create()
class Add extends PureComponent {
    state = {
        modalVisible: false,
    }

    componentDidMount() {
        const mapLayer = new ImageLayer({
            visible: false,
        })
        
        const regionLayer = new VectorLayer({
            source: new VectorSource(),
            style(feature) {
                const name = feature.get('name')
                const type = feature.get('type')
                if (name !== undefined) {
                    return new Style({
                        text: new Text({
                            text: name,
                            textAlign: 'left',
                            textBaseline: 'top',
                        })
                    })
                } else if (type === 1) {
                    return regionNormalStyle
                } else if (type === 2) {
                    return regionNormalStyle
                }
            }
        })

        const stationLayer = new VectorLayer({
            source: new VectorSource(),
            style(feature) {
                const type = feature.get('type')
                if (type === 16) {
                    return stationGreen
                } else if (type === 17) {
                    return stationBlue
                }
            }
        })
        
        const layers = [
            mapLayer,
            regionLayer,
            stationLayer,
        ]
        
        this.map = new Map({
            target: 'map',
            layers,
        })

        this.map.on('click', this.onMapClick)

        this.updateMap()
    }

    componentDidUpdate() {
        this.updateMap()
    }

    componentWillUnmount() {
        this.map.setTarget(undefined)
    }

    changePlace = place => {
        const { dispatch } = this.props
        dispatch({
            type: 'station/changePlace',
            payload: place,
        })
    }

    updateMap() {
        const { station: { map, regions, stations }, dispatch } = this.props

        const regionSource = this.map.getLayers().item(1).getSource()
        const stationSource = this.map.getLayers().item(2).getSource()

        if (map.url === '' || this.url === map.url) {
            this.url = map.url
            return
        }
        this.url = map.url

        const img = new Image()
        img.src = map.url
        img.onload = ev => {
            const extent = [0, 0, img.width, img.height]
            dispatch({
                type: 'station/saveMap',
                payload: {...map, extent}
            })
            this.map.setView(createView(extent));
            this.map.getLayers().item(0).setSource(new ImageStatic({
                url: map.url,
                imageExtent: extent,
            }))
            this.map.getLayers().item(0).setVisible(true)
            // const layer = createLayer(map.url, extent);
            // this.map.getLayers().removeAt(0);
            // this.map.getLayers().insertAt(0, layer);

            regionSource.clear()
            regions.forEach(re => {
                const l = re.extent[0] * map.ratio
                const t = extent[3] - (re.extent[1] * map.ratio)
                const r = (re.extent[0] + re.extent[2]) * map.ratio
                const b = extent[3] - (re.extent[1] + re.extent[3]) * map.ratio

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
                })
                regionSource.addFeature(pointFeature)
            })

            stationSource.clear()
            stations.forEach(st => {
                const pointFeature = new Feature({
                    geometry: new Point([
                        st.extent[0] * map.ratio,
                        extent[3] - st.extent[1] * map.ratio,
                    ]),
                    type: st.type,
                })
                stationSource.addFeature(pointFeature)
            })
        }
    }

    onMapClick = ev => {
        const { form } = this.props
        const { coordinate: [x, y] } = ev
        
        form.setFieldsValue({x, y})
        this.toggleModal()
    }

    toggleModal = () => {
        const { modalVisible } = this.state
        this.setState({
            modalVisible: !modalVisible,
        })
    }

    onModalOk = () => {
        const { form, station: { place }, dispatch } = this.props
        form.validateFields((err, fieldsValue) => {
            if (err) return

            fieldsValue['type'] = parseInt(fieldsValue['type'], 10)
            form.resetFields()
            this.toggleModal()
            dispatch({
                type: "station/addAndQueryStation",
                payload: {...fieldsValue, place},
            })
        })
    }

    onModalCancel = () => {
        const { form } = this.props
        form.resetFields()
        this.toggleModal()
    }

    render() {
        const {
            station: { places, place },
            form: { getFieldDecorator },
        } = this.props
        const { modalVisible } = this.state

        return (
            <div>
                <Cascader
                    options={places}
                    value={place}
                    onChange={this.changePlace}
                    placeholder="请选择地址"
                    allowClear={false}
                />
                <div id="map" className={styles.map} />
                <Modal
                    visible={modalVisible}
                    onOk={this.onModalOk}
                    onCancel={this.onModalCancel}
                    title="添加基站"
                >
                    <div className={styles.form}>
                        <Form layout="inline">
                            <Row>
                                <Col>
                                    <Form.Item label="X">
                                        {getFieldDecorator('x')(
                                            <Input />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col>
                                    <Form.Item label="Y">
                                        {getFieldDecorator('y')(
                                            <Input />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col>
                                    <Form.Item label="SN">
                                        {getFieldDecorator('sn', {
                                            rules: [{ required: true }],
                                        })(
                                            <Input />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col>
                                    <Form.Item label="类型">
                                        {getFieldDecorator('type', {
                                            rules: [{ required: true }],
                                        })(
                                            <Select>
                                                <Select.Option value="16">
                                                    定位基站
                                                </Select.Option>
                                                <Select.Option value="17">
                                                    门禁基站
                                                </Select.Option>
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </Modal>
            </div>
        )
    }
}

export default Add
