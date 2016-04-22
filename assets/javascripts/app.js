import d3 from "d3"


var width = 600;
var height = 900;
var radius = Math.min(width, height) / 2;
var color = d3.scale.category20();
var svg = d3.select("#partitionchart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var json = {
    "name": "analytics",
    "children": [{
        "name": "cluster",
        "children": [{"name": "AgglomerativeCluster", "size": 3938}, {
            "name": "CommunityStructure",
            "size": 3812
        }, {"name": "HierarchicalCluster", "size": 6714}, {"name": "MergeEdge", "size": 743}]
    }, {
        "name": "graph",
        "children": [{"name": "BetweennessCentrality", "size": 3534}, {
            "name": "LinkDistance",
            "size": 5731
        }, {"name": "MaxFlowMinCut", "size": 7840}, {"name": "ShortestPaths", "size": 5914}, {
            "name": "SpanningTree",
            "size": 3416
        }]
    }, {"name": "optimization", "children": [{"name": "AspectRatioBanker", "size": 7074}]}]
};

var partition = d3.layout.partition()
    .value(function (d) {
        return d.size;
    });
var nodes = partition.nodes(json);

function arcTween(transition, newAngle) {

    transition.attrTween("d", function(d) {

        var interpolate = d3.interpolate(d.endAngle, newAngle);

        return function(t) {

            d.endAngle = interpolate(t);
            return arc(d);
        };
    });
}


var setAngels = (function() {
    var rRange = [0, 2 * Math.PI];
    var length;
    var data;

    var setAngel = (item, f,l) => {
        item.angels = [f,l]   
    };
    
    return {
        setData: (_data) => {
            data = _data;
            length = data.length;
        },
        setBy: (range = rRange, key = 'size') => {
            var sum = d3.sum(data.map(item => item[key]));
            var lastPoint = range[0];

            if (sum !== 0) {
                let band = range[1] - range[0];
                data.forEach(function (item) {
                    var per = item[key] / sum;
                    setAngel(item, lastPoint, lastPoint += per * band);
                });
            }
            return data
        },
        setEqual: () => {
            var lastPoint = 0;
            data.forEach(item => {
                setAngel(item, lastPoint, lastPoint += rRange[1]/length)
            });
            return data
        }
    }
})();

var arc = d3.svg.arc()
    .startAngle(function (d) {
        return d.angels[0]
    })
    .endAngle(function (d) {
        return d.angels[1]
    })
    .innerRadius(function (d) {
        return d.depth * 50
    })
    .outerRadius(function (d) {
        return d.depth * 100
    });


var drawRound = function (data, className) {
    var arcs = svg.selectAll(className).data(data);

    var _round =  arcs.enter().append('path')
        .classed(className, true)
        .attr('d', arc)
        .attr('fill', function (d, i) {
            return d.color = color(i)
        })
        .attr('stroke', "#7D7D7D")
        .attr('stroke-width', 1.5);

    arcs.exit().remove();

    return _round

};

let drawSecond = (item) => {
    setAngels.setData(item.children);
    drawRound(setAngels.setBy(item.angels, 'value'), 'second');
};

function getLevel (data, depth) {
    return data.filter(function (item) {
        return item.depth === depth
    });
}

var firstLevel = getLevel(nodes, 1);

//draw first
setAngels.setData(firstLevel);
var firstRound = drawRound(setAngels.setEqual(), 'first');
//draw second
var secondRound = firstLevel.forEach(drawSecond);


//on first click
var click = (d) => {
    firstLevel.forEach(item => {
        item.size = item === d ? 1 : 0;
    });

    setAngels.setData(firstLevel);
    var newData = setAngels.setBy();

    firstRound.transition()
        .duration(750)
        .call(arcTween, newData.filter(item => item.size === 1)[0].angels[1]);

    firstLevel.forEach(drawSecond);
    backBtn.attr('display','show');
};

firstRound.on('click', click);

//draw back button
var backBtn = svg.append('circle')
              .classed('backBtn', true)
              .attr('r', 50)
              .attr('fill', "grey")
              .attr('display','none');

backBtn.on('click', () => {
    setAngels.setData(firstLevel);
    drawRound(setAngels.setEqual(), 'first').on('click', click);
    firstLevel.forEach(drawSecond);
});