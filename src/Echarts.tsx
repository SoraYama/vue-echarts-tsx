import Vue, { CreateElement } from 'vue';
import Component from 'vue-class-component';
import { debounce, get } from 'lodash';
import echarts from 'echarts';
import { addListener, removeListener } from 'resize-detector';
import { NoCache } from './decorators'

type loadingOption = {
  text: string,
  color: string,
  textColor: string,
  maskColor: string,
  zlevel: number
}

type getUrlOption = {
  /* 导出的格式，可选 png, jpeg */
  type?: string,
  /* 导出的图片分辨率比例，默认为 1。*/
  pixelRatio?: number,
  /* 导出的图片背景色，默认使用 option 里的 backgroundColor */
  backgroundColor?: string,
  /* 忽略组件的列表，例如要忽略 toolbox 就是 ['toolbox'] */
  excludeComponents?: Array<string>
}

const EVENTS = [
  'legendselectchanged',
  'legendselected',
  'legendunselected',
  'datazoom',
  'datarangeselected',
  'timelinechanged',
  'timelineplaychanged',
  'restore',
  'dataviewchanged',
  'magictypechanged',
  'geoselectchanged',
  'geoselected',
  'geounselected',
  'pieselectchanged',
  'pieselected',
  'pieunselected',
  'mapselectchanged',
  'mapselected',
  'mapunselected',
  'axisareaselected',
  'focusnodeadjacency',
  'unfocusnodeadjacency',
  'brush',
  'brushselected',
  'click',
  'dblclick',
  'mouseover',
  'mouseout',
  'mousedown',
  'mouseup',
  'globalout'
]

@Component({
  props: {
    options: Object,
    theme: [String, Object],
    initOptions: Object,
    group: String,
    autoResize: Boolean,
    watchShallow: Boolean
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    group(group) {
      ((this as ECharts).chart as echarts.ECharts).group = group;
    }
  }
})
export default class ECharts extends Vue {

  chart: echarts.ECharts | null;
  theme: string | object;
  group: string;
  initOptions: object;
  autoResize: boolean;
  watchShallow: boolean;
  options: echarts.EChartOption;
  graphic: echarts.graphic;

  __resizeHanlder: Function;

  // computed
  @NoCache
  get width() {
    return this.delegateGet('width', 'getWidth');
  }

  @NoCache
  get height() {
    return this.delegateGet('height', 'getHeight');
  }

  @NoCache
  get isDisposed() {
    return this.delegateGet('isDisposed', 'isDisposed');
  }

  @NoCache
  get computedOptions() {
    return this.delegateGet('computedOptions', 'getOption');
  }

  // provide a explicit merge option method
  mergeOptions(options: echarts.EChartOption, notMerge?: boolean, lazyUpdate?: boolean): void {
    this.delegateMethod('setOption', options, notMerge, lazyUpdate);
  }
  // just delegates ECharts methods to Vue component
  // use explicit params to reduce transpiled size for now
  resize(options: {
    width?: number,
    height?: number,
    silent?: boolean,
  }) {
    this.delegateMethod('resize', options)
  }

  dispatchAction(payload: object) {
    this.delegateMethod('dispatchAction', payload)
  }

  convertToPixel(finder: echarts.ConvertFinder, value: Array<any> | string) {
    return this.delegateMethod('convertToPixel', finder, value)
  }

  convertFromPixel(finder: echarts.ConvertFinder, value: Array<any>) {
    return this.delegateMethod('convertFromPixel', finder, value)
  }

  containPixel(finder: echarts.ConvertFinder, value: Array<any>) {
    return this.delegateMethod('containPixel', finder, value)
  }

  showLoading(type: string, options: loadingOption) {
    this.delegateMethod('showLoading', type, options)
  }

  hideLoading() {
    this.delegateMethod('hideLoading')
  }

  getDataURL(options: getUrlOption) {
    return this.delegateMethod('getDataURL', options)
  }

  getConnectedDataURL(options: getUrlOption): string {
    return this.delegateMethod('getConnectedDataURL', options)
  }

  clear() {
    this.delegateMethod('clear')
  }

  dispose() {
    this.delegateMethod('dispose')
  }

  delegateMethod(name: (keyof echarts.ECharts), ...args: any[]) {
    if (!this.chart) {
      console.warn(`Cannot call [${name}] before the chart is initialized. Set prop [options] first.`, this);
      return;
    }

    if (!get(this.chart, name)) {
      console.error(`Cannot find [${name}] from chart!`);
      return;
    }

    return typeof (this.chart as echarts.ECharts)[name] === 'function' && ((this.chart as echarts.ECharts)[name] as Function)(...args);
  }

  delegateGet(name: (keyof this) | (keyof echarts.ECharts), method: keyof echarts.ECharts) {
    if (!this.chart) {
      console.warn(`Cannot get [${name}] before the chart is initialized. Set prop [options] first.`, this);
    }

    if (!get(this.chart, method)) {
      console.error(`Cannot find [${method}] from chart!`);
      return;
    }

    return typeof (this.chart as echarts.ECharts)[method] === 'function' && ((this.chart as echarts.ECharts)[method] as Function)();
  }

  init() {
    if (this.chart) {
      return;
    }

    let chart = echarts.init(this.$el as HTMLCanvasElement, this.theme, this.initOptions);

    if (this.group) {
      chart.group = this.group;
    }

    chart.setOption(this.options, true);

    // expose ECharts events as custom events
    EVENTS.forEach(event => {
      chart.on(event, (params: any) => {
        this.$emit(event, params);
      })
    })

    if (this.autoResize) {
      this.__resizeHanlder = debounce(() => {
        chart.resize();
      }, 100, { leading: true })
      addListener(this.$el, this.__resizeHanlder);
    }

    this.chart = chart
  }

  destroy() {
    if (this.autoResize) {
      removeListener(this.$el, this.__resizeHanlder);
    }
    this.dispose();
    this.chart = null;
  }

  refresh() {
    this.destroy();
    this.init();
  }

  created() {
    this.$watch('options', options => {
      if (!this.chart && options) {
        this.init();
      } else {
        (this.chart as echarts.ECharts).setOption(this.options, true);
      }
    }, { deep: !this.watchShallow })

    let watched = ['theme', 'initOptions', 'autoResize', 'watchShallow'];
    watched.forEach(prop => {
      this.$watch(prop, () => {
        this.refresh();
      }, { deep: true })
    })
  }

  mounted() {
    // auto init if `options` is already provided
    if (this.options) {
      this.init()
    }
  }

  activated() {
    if (this.autoResize) {
      this.chart && this.chart.resize()
    }
  }

  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.destroy()
  }

  connect(group: string | Array<any>) {
    if (typeof group !== 'string') {
      group = group.map(chart => chart.chart)
    }
    echarts.connect(group)
  }

  disconnect(group: string) {
    echarts.disConnect(group)
  }

  registerMap(mapName: string, geoJSON: object, specialAreas?: object) {
    echarts.registerMap(mapName, geoJSON, specialAreas)
  }

  registerTheme(name: string, theme: object) {
    echarts.registerTheme(name, theme)
  }

  render(h: CreateElement) {
    return <div />
  }

}
