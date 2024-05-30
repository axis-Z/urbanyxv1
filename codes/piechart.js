  // Data source for the pie chart including percentages
  var genderData = [
    { x: 'Men', y: menSum, text: 'Men (' + menPercentage + '%)' },
    { x: 'Women', y: womenSum, text: 'Women (' + womenPercentage + '%)' }
];

var genderPieChart = new ej.charts.AccumulationChart({
    series: [{
        dataSource: genderData,
        xName: 'x',
        yName: 'y',
        type: 'Pie',
        dataLabel: {
            visible: true,
            position: 'Inside',
            name: 'text'
        }
    }],
    title: "Mobile Browser Statistics",
    legendSettings: {
        visible: true
    }
});

genderPieChart.appendTo('#genderPieChart');