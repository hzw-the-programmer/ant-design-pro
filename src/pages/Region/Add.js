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
import Draw, { createBox } from 'ol/interaction/Draw';

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

@connect(({ region }) => ({
    region,
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

        const drawSource = new VectorSource()
        drawSource.on('addfeature', this.handleAddFeature)
        const drawLayer = new VectorLayer({
            source: drawSource,
        })
        
        const layers = [
            mapLayer,
            regionLayer,
            stationLayer,
            drawLayer,
        ]
        
        this.map = new Map({
            target: 'map',
            layers,
        })

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
            type: 'region/changePlace',
            payload: place,
        })
    }

    updateMap() {
        const { region: { map, regions, stations }, dispatch } = this.props

        const regionSource = this.map.getLayers().item(1).getSource()
        const stationSource = this.map.getLayers().item(2).getSource()
        const drawSource = this.map.getLayers().item(3).getSource()

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
                type: 'region/saveMap',
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

            this.map.getInteractions().clear()
            this.map.addInteraction(new Draw({
                source: drawSource,
                type: 'Circle',
                geometryFunction: createBox(),
            }))

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

    toggleModal = () => {
        const { modalVisible } = this.state
        this.setState({
            modalVisible: !modalVisible,
        })
    }

    onModalOk = () => {
        const { form, region: { place, map }, dispatch } = this.props
        form.validateFields((err, fieldsValue) => {
            if (err) return

            fieldsValue.x = (fieldsValue.x / map.ratio)
            fieldsValue.y = (fieldsValue.y / map.ratio)
            fieldsValue.w = (fieldsValue.w / map.ratio)
            fieldsValue.h = (fieldsValue.h / map.ratio)

            form.resetFields()
            this.toggleModal()
            dispatch({
                type: "region/addAndQueryRegions",
                payload: {...fieldsValue, place},
            })
        })
    }

    onModalCancel = () => {
        const { form } = this.props
        form.resetFields()
        this.toggleModal()
    }

    handleAddFeature = ev => {
        const { form } = this.props
        const drawSource = this.map.getLayers().item(3).getSource()
        
        const extent = ev.feature.get('geometry').getExtent()
        
        const x = (extent[0]).toFixed(2)
        const y = (extent[3] - extent[1]).toFixed(2)
        const w = (extent[2] - extent[0]).toFixed(2)
        const h = (extent[3] - extent[1]).toFixed(2)
        
        form.setFieldsValue({x, y, w, h})
        this.toggleModal()
        drawSource.clear()
    }

    render() {
        const {
            region: { places, place },
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
                                    <Form.Item label="长">
                                        {getFieldDecorator('w')(
                                            <Input />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col>
                                    <Form.Item label="高">
                                        {getFieldDecorator('h')(
                                            <Input />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col>
                                    <Form.Item label="名称">
                                        {getFieldDecorator('name', {
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
                                                <Select.Option value="1">
                                                    工作区
                                                </Select.Option>
                                                <Select.Option value="2">
                                                    非工作区
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
