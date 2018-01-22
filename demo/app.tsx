import Vue, { CreateElement } from 'vue';
import Echarts from '../src/Echarts';
import Component from 'vue-class-component';

const items = ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子'];

@Component({
  components: {
    Echarts,
  }
})
export default class App extends Vue {

  initOptions = {
    renderer: 'canvas',
  }

  barOptions = {
    title: {
      text: 'Demo'
    },
    tooltip: {},
    legend: {
      data: ['销量']
    },
    xAxis: {
      data: items
    },
    yAxis: {
      axisLabel: { show: true }
    },
    series: [{
      type: 'bar',
      name: '销量',
      data: items.map(() => Math.floor(Math.random() * 40 + 10))
    }]
  }

  private intervalIndex: number;

  mounted() {
    this.$nextTick()
      .then(() => {
        this.intervalIndex = window.setInterval(this.updateData, 2000);
      })
  }

  beforeDestroy() {
    window.clearInterval(this.intervalIndex);
  }

  updateData() {
    this.barOptions.series[0].data = items.map(() => Math.floor(Math.random() * 40 + 10));
  }

  render(h: CreateElement) {
    return (
      <Echarts style="width: 600px;height:400px;" options={this.barOptions} initOptions={this.initOptions} theme="oliva-green" autoResize={true} />
    )
  }

}
