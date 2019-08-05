/**
 * LightningChartJS example that showcases real-time OHLC-packing using a variant of OHLC-series.
 */
// Import LightningChartJS
const lcjs = require('@arction/lcjs')

// Extract required parts from LightningChartJS.
const {
    lightningChart,
    AxisTickStrategies,
    AxisScrollStrategies,
    OHLCSeriesTypes,
    emptyLine
} = lcjs

// Import data-generator from 'xydata'-library.
const {
    createProgressiveTraceGenerator
} = require('@arction/xydata')

// Decide on an origin for DateTime axis ( cur time - 5 minutes ).
const fiveMinutesInMs = 5 * 60 * 1000
const dateOrigin = new Date(new Date().getTime() - fiveMinutesInMs)

// Create a XY Chart with DateTime X-axis using previously defined origin.
const chart = lightningChart().ChartXY({
    defaultAxisXTickStrategy: AxisTickStrategies.DateTime(dateOrigin)
})
    .setTitle('Realtime OHLC and line')
    .setAutoCursor(cursor => {
        cursor.disposeTickMarkerY()
        cursor.setGridStrokeYStyle(emptyLine)
    })
    // Preventing x-axis Tick from getting cut at the edge
    .setPadding({
        right: 42
    })

// Configure X-axis to be progressive.
chart.getDefaultAxisX()
    .setScrollStrategy(AxisScrollStrategies.progressive)
    // View fits 5 minutes.
    .setInterval(0, fiveMinutesInMs)

// show title 'USD on Y axis
chart.getDefaultAxisY()
    .setTitle('USD')

// Add underlying line series.
const lineSeries = chart.addLineSeries()
    .setCursorEnabled(false)
    .setStrokeStyle((strokeStyle) => strokeStyle
        .setFillStyle(fill => fill.setA(70))
        .setThickness(1)
    )

// Add OHLC series with automatic packing (so we can feed it XY-points just like for the line series).
const ohlcSeriesAutoPacking = chart.addOHLCSeries(
    // Specify type of OHLC-series for adding points
    { seriesConstructor: OHLCSeriesTypes.AutomaticPacking }
)
    // Set packing resolution to 100 ms so we can zoom to full resolution.
    .setPackingResolution(100)

const add = (points) => {
    lineSeries.add(points)
    ohlcSeriesAutoPacking.add(points)
}

// Generate data using 'xydata'-library.
createProgressiveTraceGenerator()
    .setNumberOfPoints(10000)
    .generate()
    .toPromise()
    .then((data) => data.map((p) => ({
        // Resolution = 100 ms.
        x: p.x * 100, y: p.y
    })))
    .then((data) => {
        // Add 5 minutes worth of points immediately ( to simulate previous data ).
        add(data.splice(0, Math.round(5 * 60 * 10)))
        // Then stream some more
        setInterval(() => {
            add(data.splice(0, 1))
        }, 50)
    })
