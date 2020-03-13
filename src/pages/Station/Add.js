import React, { PureComponent } from 'react'

import { connect } from 'dva'

import { Cascader } from 'antd'

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
import { Style, Stroke, Fill, Text } from 'ol/style';

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

@connect(({ station }) => ({
    station,
}))
class Add extends PureComponent {
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
        
        const layers = [mapLayer, regionLayer]
        
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
            type: 'station/changePlace',
            payload: place,
        })
    }

    updateMap() {
        const { station: { map, regions }, dispatch } = this.props

        if (map.url === '' || this.url === map.url) {
            this.url = map.url
            return
        }
        this.url = map.url

        const img = new Image()
        img.src = map.url
        img.onload = ev => {
            const extent = [0, 0, img.width, img.height]
            console.log(extent)
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

            const regionSource = this.map.getLayers().item(1).getSource()
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
        }
    }

    render() {
        const { station: { places, place } } = this.props

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
            </div>
        )
    }
}

export default Add
