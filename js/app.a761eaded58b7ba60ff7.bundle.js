(self.webpackChunk=self.webpackChunk||[]).push([[524],{44:(e,t,s)=>{const a=s(89),i=s(863),{lightningChart:r,AxisTickStrategies:n,AxisScrollStrategies:l,OHLCSeriesTypes:o,emptyLine:c,Themes:d}=a,{createProgressiveTraceGenerator:g}=i,h=3e5,S=new Date(Date.now()-h),u=S.getTime(),k=r().ChartXY({theme:d[new URLSearchParams(window.location.search).get("theme")||"darkGold"]||void 0});k.getDefaultAxisX().setTickStrategy(n.DateTime,(e=>e.setDateOrigin(S))),k.setTitle("Realtime OHLC and line").setPadding({right:42}),k.setAutoCursor((e=>{e.setTickMarkerYVisible(!1),e.setGridStrokeYStyle(c)})),k.getDefaultAxisX().setScrollStrategy(l.progressive).setDefaultInterval((e=>({end:e.dataMax,start:(e.dataMax??0)-h,stopAxisAfter:!1}))),k.getDefaultAxisY().setTitle("USD");const m=k.addLineSeries().setCursorEnabled(!1).setStrokeStyle((e=>e.setFillStyle((e=>e.setA(70))).setThickness(1))),x=k.addOHLCSeries({seriesConstructor:o.AutomaticPacking}).setPackingResolution(100),p=e=>{m.add(e),x.add(e)};g().setNumberOfPoints(1e4).generate().toPromise().then((e=>e.map((e=>({x:u+100*e.x,y:e.y}))))).then((e=>e.map((e=>({x:e.x-u,y:e.y}))))).then((e=>{p(e.splice(0,Math.round(3e3))),setInterval((()=>{p(e.splice(0,1))}),50)}))}},e=>{e.O(0,[502],(()=>(44,e(e.s=44)))),e.O()}]);