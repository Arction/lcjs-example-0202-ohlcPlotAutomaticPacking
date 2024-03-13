/*
 * LightningChartJS example that showcases real-time OHLC-packing using a variant of OHLC-series.
 */
// Import LightningChartJS
const lcjs = require('@arction/lcjs')

// Import xydata
const xydata = require('@arction/xydata')

// Extract required parts from LightningChartJS.
const { lightningChart, AxisTickStrategies, AxisScrollStrategies, OHLCSeriesTypes, emptyLine, Themes } = lcjs

// Import data-generator from 'xydata'-library.
const { createProgressiveTraceGenerator } = xydata

// Decide on an origin for DateTime axis ( cur time - 5 minutes ).
const fiveMinutesInMs = 5 * 60 * 1000
const dateOrigin = new Date(Date.now() - fiveMinutesInMs)
const dateOriginTime = dateOrigin.getTime()

// Create a XY Chart.
const chart = lightningChart().ChartXY({
    theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined
})
// Use DateTime X-axis using previously defined origin.
chart.getDefaultAxisX().setTickStrategy(AxisTickStrategies.DateTime, (tickStrategy) => tickStrategy.setDateOrigin(dateOrigin))

// Set chart title and modify the padding of the chart.
chart.setTitle('Realtime OHLC and line').setPadding({
    right: 42,
})
// Modify AutoCursor to only show TickMarker and Gridline over X Axis.
chart.setAutoCursor((cursor) => {
    cursor.setTickMarkerYVisible(false)
    cursor.setGridStrokeYStyle(emptyLine)
})

// Configure X-axis to be progressive.
chart
    .getDefaultAxisX()
    .setScrollStrategy(AxisScrollStrategies.progressive)
    // View fits 5 minutes.
    .setDefaultInterval((state) => ({ end: state.dataMax, start: (state.dataMax ?? 0) - fiveMinutesInMs, stopAxisAfter: false }))

// Show title 'USD' on Y axis.
chart.getDefaultAxisY().setTitle('USD')

// Add underlying line series.
const lineSeries = chart
    .addLineSeries()
    .setCursorEnabled(false)
    .setStrokeStyle((strokeStyle) => strokeStyle.setFillStyle((fill) => fill.setA(70)).setThickness(1))

// Add OHLC series with automatic packing (so we can feed it XY-points just like for the line series).
const ohlcSeriesAutoPacking = chart
    .addOHLCSeries(
        // Specify type of OHLC-series for adding points
        { seriesConstructor: OHLCSeriesTypes.AutomaticPacking },
    )
    // Set packing resolution to 100 ms so we can zoom to full resolution.
    .setPackingResolution(100)

const add = (points) => {
    lineSeries.add(points)
    // With automatic packing, the add method accepts data points that use the {x, y} format (for example, {x: time, y: measurement}).
    // OHLC Series can automatically pack these raw measurements into OHLC data.
    ohlcSeriesAutoPacking.add(points)
}

// Generate data using 'xydata'-library.
createProgressiveTraceGenerator()
    .setNumberOfPoints(10000)
    .generate()
    .toPromise()
    // Map random generated data to start from a particular date with the frequency of 100 ms
    .then((data) =>
        data.map((p) => ({
            x: dateOriginTime + p.x * 100,
            y: p.y,
        })),
    )
    // When data origin is used (required for DateTime axis range smaller than 1 day), time coordinate has to be shifted by date origin.
    .then((data) =>
        data.map((p) => ({
            x: p.x - dateOriginTime,
            y: p.y,
        })),
    )
    .then((data) => {
        // Add 5 minutes worth of points immediately ( to simulate previous data ).
        add(data.splice(0, Math.round(5 * 60 * 10)))
        // Then stream some more
        setInterval(() => {
            add(data.splice(0, 1))
        }, 50)
    })
