import React, { PureComponent } from 'react'

import { connect } from 'dva'

import { Cascader } from 'antd'

import Map from 'ol/Map'
import View from 'ol/View';
import { Image as ImageLayer } from 'ol/layer'
import ImageStatic from 'ol/source/ImageStatic';
import Projection from 'ol/proj/Projection';
import { getCenter } from 'ol/extent'

import styles from './Add.less'

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

@connect(({ station }) => ({
    station,
}))
class Add extends PureComponent {
    componentDidMount() {
        const mapLayer = new ImageLayer({
            visible: false,
        })
        const layers = [mapLayer]
        
        this.map = new Map({
            target: 'map',
            layers,
        })
    }

    componentDidUpdate() {
        const { station: { map }, dispatch } = this.props

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
        }
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
