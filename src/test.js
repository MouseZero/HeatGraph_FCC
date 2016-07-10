const URL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json'
const SQUARE_WIDTH = 10
const SQUARE_HEIGHT = 20
const CANVAS_WIDTH = 700
const CANVAS_HEIGHT = 600
const GRAPH_WIDTH = 500
const GRAPH_HEIGHT = 500
const MONTHS_PER_YEAR = 12

function makeGraph(){
    fetch(URL)
        .then( r=>r.json() )
        .then( j=>drawGraph(j) )
}

function drawGraph(data){
    console.log(JSON.stringify(data, null, 2))
    const BASE = data.baseTemperature
    let dataInfo = data.monthlyVariance.reduce( (prev, elem)=>{
        var min = parseFloat( Math.min(prev.min, elem.variance + BASE) )
        var max = parseFloat( Math.max(prev.max, elem.variance + BASE) )
        var newInfo = {
            min: Math.round(min * 100) / 100,
            max: Math.round(max * 100) / 100
        }
        return newInfo
    }, {min: Number.MAX_VALUE, max: Number.MIN_VALUE, yearCount: 0})
    dataInfo.years = data.monthlyVariance.length / MONTHS_PER_YEAR
    dataInfo.blockwidth = GRAPH_WIDTH / dataInfo.years

    let colorTo0Through1 = d3.scaleLinear()
        .domain([ dataInfo.min, dataInfo.max ])
        .range( [ -0.2, 1.2 ] )

    let colorScaleInterpolater = d3.scaleSequential( d3.interpolateViridis );

    let colorScale = function(d){
        return colorScaleInterpolater( colorTo0Through1(d) )
    }

    let canvas = d3.select('#graph').append('svg')
        .attr('width', CANVAS_WIDTH)
        .attr('height', CANVAS_HEIGHT)
        .append('g')

    let heatBoxes = canvas
        .selectAll('rect')
        .data(data.monthlyVariance)
        .enter()
        .append('rect')

    let heatBoxAttr = heatBoxes
        .attr('width', dataInfo.blockwidth)
        .attr('height', SQUARE_HEIGHT)
        .attr('fill', d=>{
            var color = colorScale( d.variance + BASE)
            return color
        })
        .attr('y', d=>d.month * SQUARE_HEIGHT)
        .attr('x', ( d, i )=>{
            let row = i? i/MONTHS_PER_YEAR : 0
            row = Math.floor(row)
            let x = row * dataInfo.blockwidth
            return x
        })

}

window.onload = makeGraph()
