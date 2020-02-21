import React, { Component } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { XYZ, Vector as VectorSource } from 'ol/source';
import Polyline from 'ol/format/Polyline';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { Style, Stroke, Fill, Icon, Circle as CircleStyle } from 'ol/style';
import { getVectorContext } from 'ol/render';

class Map4 extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.state = {
      speed: 60,
      animating: false,
    };
    this.handleSpeedChange = this.handleSpeedChange.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.moveFeature = this.moveFeature.bind(this);
  }

  render() {
    const { speed, animating } = this.state;
    return (
      <div>
        <div ref={this.mapRef} style={{ width: '100%', height: '400px' }} />
        <label htmlFor="speed">
          speed:&nbsp;
          <input
            id="speed"
            type="range"
            min="10"
            max="999"
            step="10"
            value={speed}
            onChange={this.handleSpeedChange}
          />
        </label>
        <br />
        <button onClick={this.handleButtonClick}>
          {animating ? 'Cancel Animation' : 'Start Animation'}
        </button>
      </div>
    );
  }

  componentDidMount() {
    const center = [-5639523.95, -3501274.52];

    const key = 'get_your_own_D6rA4zTHduk6KOKTXzGB';
    const attributions =
      '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
      '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

    this.initVectorLayer();

    this.map = new Map({
      target: this.mapRef.current,
      view: new View({
        center,
        zoom: 10,
        minZoom: 2,
        maxZoom: 19,
      }),
      layers: [
        new TileLayer({
          source: new XYZ({
            attributions,
            url: 'https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=' + key,
            tileSize: 512,
          }),
        }),
        this.vectorLayer,
      ],
    });
  }

  componentWillUnmount() {
    this.map.setTarget(undefined);
  }

  initVectorLayer() {
    const polyline = [
      'hldhx@lnau`BCG_EaC??cFjAwDjF??uBlKMd@}@z@??aC^yk@z_@se@b[wFdE??wFfE}N',
      'fIoGxB_I\\gG}@eHoCyTmPqGaBaHOoD\\??yVrGotA|N??o[N_STiwAtEmHGeHcAkiA}^',
      'aMyBiHOkFNoI`CcVvM??gG^gF_@iJwC??eCcA]OoL}DwFyCaCgCcCwDcGwHsSoX??wI_E',
      'kUFmq@hBiOqBgTwS??iYse@gYq\\cp@ce@{vA}s@csJqaE}{@iRaqE{lBeRoIwd@_T{]_',
      'Ngn@{PmhEwaA{SeF_u@kQuyAw]wQeEgtAsZ}LiCarAkVwI}D??_}RcjEinPspDwSqCgs@',
      'sPua@_OkXaMeT_Nwk@ob@gV}TiYs[uTwXoNmT{Uyb@wNg]{Nqa@oDgNeJu_@_G}YsFw]k',
      'DuZyDmm@i_@uyIJe~@jCg|@nGiv@zUi_BfNqaAvIow@dEed@dCcf@r@qz@Egs@{Acu@mC',
      'um@yIey@gGig@cK_m@aSku@qRil@we@{mAeTej@}Tkz@cLgr@aHko@qOmcEaJw~C{w@ka',
      'i@qBchBq@kmBS{kDnBscBnFu_Dbc@_~QHeU`IuyDrC_}@bByp@fCyoA?qMbD}{AIkeAgB',
      'k_A_A{UsDke@gFej@qH{o@qGgb@qH{`@mMgm@uQus@kL{_@yOmd@ymBgwE}x@ouBwtA__',
      'DuhEgaKuWct@gp@cnBii@mlBa_@}|Asj@qrCg^eaC}L{dAaJ_aAiOyjByH{nAuYu`GsAw',
      'Xyn@ywMyOyqD{_@cfIcDe}@y@aeBJmwA`CkiAbFkhBlTgdDdPyiB`W}xDnSa}DbJyhCrX',
      'itAhT}x@bE}Z_@qW_Kwv@qKaaAiBgXvIm}A~JovAxCqW~WanB`XewBbK{_A`K}fBvAmi@',
      'xBycBeCauBoF}}@qJioAww@gjHaPopA_NurAyJku@uGmi@cDs[eRaiBkQstAsQkcByNma',
      'CsK_uBcJgbEw@gkB_@ypEqDoqSm@eZcDwjBoGw`BoMegBaU_`Ce_@_uBqb@ytBwkFqiT_',
      'fAqfEwe@mfCka@_eC_UmlB}MmaBeWkkDeHwqAoX}~DcBsZmLcxBqOwqE_DkyAuJmrJ\\o',
      '~CfIewG|YibQxBssB?es@qGciA}RorAoVajA_nAodD{[y`AgPqp@mKwr@ms@umEaW{dAm',
      'b@umAw|@ojBwzDaaJsmBwbEgdCsrFqhAihDquAi`Fux@}_Dui@_eB_u@guCuyAuiHukA_',
      'lKszAu|OmaA{wKm}@clHs_A_rEahCssKo\\sgBsSglAqk@yvDcS_wAyTwpBmPc|BwZknF',
      'oFscB_GsaDiZmyMyLgtHgQonHqT{hKaPg}Dqq@m~Hym@c`EuiBudIabB{hF{pWifx@snA',
      'w`GkFyVqf@y~BkoAi}Lel@wtc@}`@oaXi_C}pZsi@eqGsSuqJ|Lqeb@e]kgPcaAu}SkDw',
      'zGhn@gjYh\\qlNZovJieBqja@ed@siO{[ol\\kCmjMe\\isHorCmec@uLebB}EqiBaCg}',
      '@m@qwHrT_vFps@kkI`uAszIrpHuzYxx@e{Crw@kpDhN{wBtQarDy@knFgP_yCu\\wyCwy',
      'A{kHo~@omEoYmoDaEcPiuAosDagD}rO{{AsyEihCayFilLaiUqm@_bAumFo}DgqA_uByi',
      '@swC~AkzDlhA}xEvcBa}Cxk@ql@`rAo|@~bBq{@``Bye@djDww@z_C_cAtn@ye@nfC_eC',
      '|gGahH~s@w}@``Fi~FpnAooC|u@wlEaEedRlYkrPvKerBfYs}Arg@m}AtrCkzElw@gjBb',
      'h@woBhR{gCwGkgCc[wtCuOapAcFoh@uBy[yBgr@c@iq@o@wvEv@sp@`FajBfCaq@fIipA',
      'dy@ewJlUc`ExGuaBdEmbBpBssArAuqBBg}@s@g{AkB{bBif@_bYmC}r@kDgm@sPq_BuJ_',
      's@{X_{AsK_d@eM{d@wVgx@oWcu@??aDmOkNia@wFoSmDyMyCkPiBePwAob@XcQ|@oNdCo',
      'SfFwXhEmOnLi\\lbAulB`X_d@|k@au@bc@oc@bqC}{BhwDgcD`l@ed@??bL{G|a@eTje@',
      'oS~]cLr~Bgh@|b@}Jv}EieAlv@sPluD{z@nzA_]`|KchCtd@sPvb@wSb{@ko@f`RooQ~e',
      '[upZbuIolI|gFafFzu@iq@nMmJ|OeJn^{Qjh@yQhc@uJ~j@iGdd@kAp~BkBxO{@|QsAfY',
      'gEtYiGd]}Jpd@wRhVoNzNeK`j@ce@vgK}cJnSoSzQkVvUm^rSgc@`Uql@xIq\\vIgg@~k',
      'Dyq[nIir@jNoq@xNwc@fYik@tk@su@neB}uBhqEesFjoGeyHtCoD|D}Ed|@ctAbIuOzqB',
      '_}D~NgY`\\um@v[gm@v{Cw`G`w@o{AdjAwzBh{C}`Gpp@ypAxn@}mAfz@{bBbNia@??jI',
      'ab@`CuOlC}YnAcV`@_^m@aeB}@yk@YuTuBg^uCkZiGk\\yGeY}Lu_@oOsZiTe[uWi[sl@',
      'mo@soAauAsrBgzBqgAglAyd@ig@asAcyAklA}qAwHkGi{@s~@goAmsAyDeEirB_{B}IsJ',
      'uEeFymAssAkdAmhAyTcVkFeEoKiH}l@kp@wg@sj@ku@ey@uh@kj@}EsFmG}Jk^_r@_f@m',
      '~@ym@yjA??a@cFd@kBrCgDbAUnAcBhAyAdk@et@??kF}D??OL',
    ].join('');

    const route = new Polyline({
      factor: 1e6,
    }).readGeometry(polyline, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });

    this.routeCoords = route.getCoordinates();

    const routeFeature = new Feature({
      type: 'route',
      geometry: route,
    });

    this.geoMarker = new Feature({
      type: 'geoMarker',
      geometry: new Point(this.routeCoords[0]),
    });

    const startMarker = new Feature({
      type: 'icon',
      geometry: new Point(this.routeCoords[0]),
    });

    const endMarker = new Feature({
      type: 'icon',
      geometry: new Point(this.routeCoords[this.routeCoords.length - 1]),
    });

    this.styles = {
      route: new Style({
        stroke: new Stroke({
          width: 6,
          color: [237, 212, 0, 0.8],
        }),
      }),
      icon: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: './icon.png',
        }),
      }),
      geoMarker: new Style({
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({ color: 'black' }),
          stroke: new Stroke({
            color: 'white',
            width: 2,
          }),
        }),
      }),
    };

    this.vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [routeFeature, this.geoMarker, startMarker, endMarker],
      }),
      style: feature => {
        const { animating } = this.state;
        const type = feature.get('type');
        if (animating && type == 'geoMarker') return null;
        return this.styles[type];
      },
    });
  }

  handleSpeedChange(event) {
    this.setState({
      speed: event.target.value,
    });
  }

  handleButtonClick(event) {
    const { animating } = this.state;
    if (animating) {
      this.stopAnimation(false);
    } else {
      this.startAnimation();
    }
  }

  startAnimation() {
    this.now = new Date().getTime();
    this.vectorLayer.on('postrender', this.moveFeature);
    this.geoMarker.setStyle(null);
    this.map.render();
    this.setState({
      animating: true,
    });
  }

  stopAnimation(ended) {
    this.vectorLayer.un('postrender', this.moveFeature);
    const coord = ended ? this.routeCoords[this.routeCoords.length - 1] : this.routeCoords[0];
    const geometry = this.geoMarker.getGeometry();
    geometry.setCoordinates(coord);
    this.setState({
      animating: false,
    });
  }

  moveFeature(event) {
    const { speed } = this.state;

    const frameState = event.frameState;
    const elapsed = frameState.time - this.now;
    const index = Math.round((speed * elapsed) / 1000);

    if (index > this.routeCoords.length - 1) {
      this.stopAnimation(true);
      return;
    }

    const vectorContext = getVectorContext(event);
    const point = new Point(this.routeCoords[index]);
    const feature = new Feature(point);
    vectorContext.drawFeature(feature, this.styles.geoMarker);

    this.map.render();
  }
}

export default Map4;
