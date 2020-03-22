import React, { PureComponent } from 'react'

import {
    Form,
    Select,
    DatePicker,
    Row,
    Col,
    Button,
    Card,
    Cascader,
} from 'antd'

import { connect } from 'dva'

import { isEqual } from 'lodash'

import Map from 'ol/Map'
import ImageLayer from 'ol/layer/Image'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import View from 'ol/View';
import Projection from 'ol/proj/Projection';
import { getCenter } from 'ol/extent'
import ImageStatic from 'ol/source/ImageStatic'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Style, Stroke, Fill, Text, Icon, Circle } from 'ol/style';

import PageHeaderWrapper from '@/components/PageHeaderWrapper'

import styles from './Map.less'

const patrolNormalStyle = new Style({
    image: new Circle({
        radius: 7,
        stroke: new Stroke({
            color: '#3399cc',
            width: 1.25,
        }),
        fill: new Fill({
            color: [35, 186, 35, 1],
        }),
    }),
});

const patrolNotNormalStyle = new Style({
    image: new Circle({
        radius: 7,
        stroke: new Stroke({
            color: '#3399cc',
            width: 1.25,
        }),
        fill: new Fill({
            color: [194, 29, 24, 1],
        }),
    }),
});

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

@connect(({ map }) => ({
    map,
}))
@Form.create()
class PatrolMap extends PureComponent {
    componentDidMount() {
        const mapLayer = new ImageLayer({
            visible: false,
        })
        const patrolLayer = new VectorLayer({
            source: new VectorSource(),
            style(feature) {
                const normal = feature.get('normal')
                if (normal) {
                    return patrolNormalStyle
                } else {
                    return patrolNotNormalStyle
                }
            }
        })
        this.map = new Map({
            target: 'map',
            layers: [mapLayer, patrolLayer],
        })
        this.update()
    }

    componentDidUpdate() {
        this.update()
    }

    componentWillUnmount() {
        this.map.setTarget(undefined)
    }

    handleSubmit = e => {
        const { form, dispatch } = this.props
        e.preventDefault()
        form.validateFields((errors, formFields) => {
            if (errors) return
            dispatch({
                type: 'map/saveFormFields',
                payload: formFields,
            })
            dispatch({
                type: 'map/queryPatrolTimeRanges',
                payload: formFields,
            })
        })
    }

    handleTimeRangeChange = timeRange => {
        const { dispatch } = this.props
        dispatch({
            type: 'map/changeTimeRange',
            payload: timeRange,
        })
    }

    handleChangePlace = place => {
        const { dispatch } = this.props
        dispatch({
            type: 'map/changePlace',
            payload: place,
        })
    }

    update = () => {
        const {
            map: {
                map: {
                    url, ratio, extent
                },
                patrolLog,
            },
            dispatch,
        } = this.props

        const mapLayer = this.map.getLayers().item(0)
        const patrolSource = this.map.getLayers().item(1).getSource()

        if (url === '') {
            this.url = url
            return
        }

        if (!isEqual(this.url, url)) {
            this.url = url
            
            const img = new Image()
            img.src = url
            img.onload = () => {
                const newExtent = [0, 0, img.width, img.height]

                this.map.setView(createView(newExtent));
                
                const source = new ImageStatic({
                    url,
                    imageExtent: newExtent,
                })
                mapLayer.setSource(source)
                
                mapLayer.setVisible(true)

                dispatch({
                    type: 'region/saveMap',
                    payload: {url, ratio, extent: newExtent}
                })
            }
        
            return
        }

        if (!isEqual(this.patrolLog, patrolLog)) {
            this.patrolLog = patrolLog
            
            patrolSource.clear()
            patrolLog.forEach(pl => {
                const x = parseFloat(pl.x) * ratio
                // const y = extent[3] - parseFloat(pl.y) * ratio
                const y = parseFloat(pl.y) * ratio
                console.log(x, y)
                const pointFeature = new Feature({
                    geometry: new Point([x, y]),
                    normal: pl.normal,
                })
                patrolSource.addFeature(pointFeature)
            })
        }
    }

    render() {
        const {
            form: { getFieldDecorator },
            map: { people, formFields, timeRanges, timeRange, pls, place },
        } = this.props
        
        return (
            <PageHeaderWrapper>
                <Card>
                    <div className={styles.form}>
                        <Form layout="inline" onSubmit={this.handleSubmit} hideRequiredMark>
                            <Row gutter={{md: 8}}>
                                <Col md={8}>
                                    <Form.Item label="姓名">
                                        {getFieldDecorator('name', {
                                            rules: [{required: true}],
                                            initialValue: formFields.name,
                                        })(
                                            <Select>
                                                {people.map(p => (
                                                    <Select.Option value={p.id} key={p.id}>
                                                        {p.name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col md={8}>
                                    <Form.Item label="日期">
                                        {getFieldDecorator('date', {
                                            rules: [{required: true}],
                                            initialValue: formFields.date,
                                        })(
                                            <DatePicker style={{ width: '100%' }} />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col md={8}>
                                    <Button htmlType="submit" type="primary">查询</Button>
                                </Col>
                            </Row>
                        </Form>
                        <Form>
                            <Row gutter={{md: 8}}>
                                <Col md={8}>
                                    <Form.Item label="时间">
                                        <Select value={timeRange} onChange={this.handleTimeRangeChange}>
                                            {timeRanges.map(tr => (
                                                <Select.Option key={tr.id} value={tr.id}>
                                                    {tr.timeRange}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col md={8}>
                                    <Form.Item label="楼层">
                                        <Cascader
                                            options={pls}
                                            allowClear={false}
                                            value={place}
                                            onChange={this.handleChangePlace}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                    <div id="map" className={styles.map} />
                </Card>
            </PageHeaderWrapper>
        )
    }
}

export default PatrolMap
