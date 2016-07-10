const URL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json'
const CANVAS_WIDTH = 1000
const CANVAS_HEIGHT = 600
const GRAPH_WIDTH = 700
const GRAPH_X = 75
const GRAPH_Y = 50
const GRAPH_HEIGHT = 400
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
        .rangeRound( [GRAPH_Y, GRAPH_HEIGHT + GRAPH_Y] )
        .domain(MONTHS)

    //------- Content -------------
    const canvas = d3.select('#graph').append('svg')
        .attr('width', CANVAS_WIDTH)
        .attr('height', CANVAS_HEIGHT)
        .append('g')

    const heatBoxes = canvas
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

    //------- Axes --------------
    const callYAxis = canvas
        .append('g')
        .attr( 'transform', 'translate( '+GRAPH_X+', 0 )' )
        .call(  d3.axisLeft( yScaleAxis )  )

}

window.onload = makeGraph()
