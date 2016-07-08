const URL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json'
const SQUARE_WIDTH = 10
const SQUARE_HEIGHT = 20

function makeGraph(){
    fetch(URL)
        .then( r=>r.json() )
        .then( j=>drawGraph(j) )
}

function drawGraph(data){
    console.log(JSON.stringify(data.monthlyVariance, null, 2))

    let canvas = d3.select('#graph').append('svg')
        .attr('width', 700)
        .attr('height', 500)
        .append('g')

    let heatBoxes = canvas
        .selectAll('rect')
        .data(data.monthlyVariance)
        .enter()
        .append('rect')

    let heatBoxAttr = heatBoxes
        .attr('width', SQUARE_WIDTH)
        .attr('height', SQUARE_HEIGHT)
        .attr('fill', 'blue')
        .attr('y', d=>d.month * SQUARE_HEIGHT)
        .attr('x', d=>( d.year - 1983 ) * SQUARE_WIDTH)

}

window.onload = makeGraph()
