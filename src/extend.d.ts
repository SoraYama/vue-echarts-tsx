declare namespace echarts {

  interface graphic {
    clipPointsByRect(points: number[][], rect: ERectangle): number[][];
    clipRectByRect(targetRect: ERectangle, rect: ERectangle): ERectangle;
    LinearGradient: { new(x: number, y: number, x2: number, y2: number, colorStops: Array<Object>, globalCoord?: boolean): LinearGradient }
  }

  type ConvertFinder =
    {
      seriesIndex?: number,
      seriesId?: string,
      seriesName?: string,
      geoIndex?: number,
      geoId?: string,
      geoName?: string,
      xAxisIndex?: number,
      xAxisId?: string,
      xAxisName?: string,
      yAxisIndex?: number,
      yAxisId?: string,
      yAxisName?: string,
      gridIndex?: number,
      gridId?: string
      gridName?: string
    } | string;

  interface ECharts {
    containPixel(finder: ConvertFinder | string,
      // 要被判断的点，为像素坐标值，以 echarts 实例的 dom 节点的左上角为坐标 [0, 0] 点。
      value: any[]): boolean
  }
}

