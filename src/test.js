const URL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json'
const GRAPH_WIDTH = 700
const GRAPH_X = 100
const GRAPH_Y = 100
const GRAPH_HEIGHT = 400
const CANVAS_WIDTH = GRAPH_WIDTH + GRAPH_X
const CANVAS_HEIGHT = GRAPH_HEIGHT + GRAPH_Y + 100
const MONTHS_PER_YEAR = 12
const MONTHS = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]

function makeGraph(){
    fetch(URL)
        .then( r=>r.json() )
        .then( j=>drawGraph(j) )
}

function drawGraph(data){
    //console.log(JSON.stringify(data, null, 2))
    const BASE = data.baseTemperature
    const dataInfo = data.monthlyVariance.reduce( (prev, elem)=>{
        const min = parseFloat( Math.min(prev.min, elem.variance + BASE) )
        const max = parseFloat( Math.max(prev.max, elem.variance + BASE) )
        const newInfo = {
            min: Math.round(min * 100) / 100,
            max: Math.round(max * 100) / 100
        }
        return newInfo
    }, {min: Number.MAX_VALUE, max: Number.MIN_VALUE, yearCount: 0})
    dataInfo.years = data.monthlyVariance.length / MONTHS_PER_YEAR
    dataInfo.blockwidth = GRAPH_WIDTH / dataInfo.years
    dataInfo.blockheight = GRAPH_HEIGHT / MONTHS_PER_YEAR

    //------- Scalers -------------

    const colorTo0Through1 = d3.scaleLinear()
        .domain([ dataInfo.min, dataInfo.max ])
        .range( [ -0.2, 1.2 ] )

    const colorScaleInterpolater = d3.scaleSequential( d3.interpolateViridis );

    const colorScale = function(d){
        return colorScaleInterpolater( colorTo0Through1(d) )
    }

    const yScale = d3.scaleLinear()
    .domain( [ 0, 12 ] )
    .range( [ GRAPH_Y, GRAPH_HEIGHT + GRAPH_Y ] )

    const yScaleAxis = d3.scaleBand()
        .range( [GRAPH_Y, GRAPH_HEIGHT + GRAPH_Y] )
        .domain(MONTHS)

    const xScale = d3.scaleLinear()
        .domain( [ data.monthlyVariance[0].year, data.monthlyVariance[data.monthlyVariance.length -1].year ] )
        .range( [GRAPH_X, GRAPH_WIDTH + GRAPH_X] )


    //------- Content -------------
    const canvas = d3.select('#graph').append('svg')
        .attr('width', CANVAS_WIDTH)
        .attr('height', CANVAS_HEIGHT)
        .append('g')

    const heatBoxes = canvas
        .append('g')
        .selectAll('rect')
        .data(data.monthlyVariance)
        .enter()
        .append('rect')

    const heatBoxAttr = heatBoxes
        .attr('width', dataInfo.blockwidth)
        .attr('height', dataInfo.blockheight)
        .attr('fill', d=>{
            var color = colorScale( d.variance + BASE)
            return color
        })
        .attr( 'y', d=> yScale( d.month - 1 )  )
        .attr('x', ( d, i )=>{
            let row = i? i/MONTHS_PER_YEAR : 0
            row = Math.floor(row)
            const x = row * dataInfo.blockwidth + GRAPH_X
            return x
        })

    const toolTip = heatBoxes
        .append("title")
        .text(d=>"Year: " + d.year +
            " Month: " + MONTHS[d.month] +
            " Temp: " +
            ( Math.round( ( d.variance + BASE )*100 )/100) +
            "°C")

    const titleItems = canvas
        .append('g')

    const title = titleItems.append('text')
        .text('Global Land-Surface Temperature')
        .attr('text-anchor', 'middle')
        .attr('y', 30)
        .attr('x', CANVAS_WIDTH/2)
        .attr('font-size', '150%')
        .attr('width', CANVAS_WIDTH)
        .attr('height', 50)

    const years = titleItems.append('text')
        .text('Years: 1753 - 2015')
        .attr('y', 60)
        .attr('text-anchor', 'middle')
        .attr('x', CANVAS_WIDTH/2)
        .attr('font-size', '100%')
        .attr('width', CANVAS_WIDTH)
        .attr('height', 50)

    const desc = titleItems.append('text')
        .text('Temperatures are in Celsius and reported as anomalies relative to the Jan 1951-Dec 1980 average.')
        .attr('y', 90)
        .attr('text-anchor', 'middle')
        .attr('x', CANVAS_WIDTH/2)
        .attr('font-size', '75%')
        .attr('width', CANVAS_WIDTH)
        .attr('height', 50)


    //------- Axes --------------
    const callYAxis = canvas
        .append('g')
        .attr( 'transform', 'translate( '+GRAPH_X+', 0 )' )
        .call(  d3.axisLeft( yScaleAxis )  )

    const yAxis = d3.axisBottom( xScale )
    .ticks(15)
    .tickFormat(d=>d)

    const callXAxis = canvas
        .append('g')
        .attr( 'transform', 'translate(0,'+( GRAPH_HEIGHT+GRAPH_Y )+')' )
        .call( yAxis )


    //const ticks = xScale.ticks( [ 1970, 2000 ] ),
    //    tickFormat = xScale.tickFormat(2, "+%");

    //ticks.map(tickFormat); // ["-100%", "-50%", "+0%", "+50%", "+100%"]

}

window.onload = makeGraph()
