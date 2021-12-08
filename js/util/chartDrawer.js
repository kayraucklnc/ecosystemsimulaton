function drawthechart() {
    google.charts.load('current', {'packages': ['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        // Create the data table.
        data = new google.visualization.DataTable();
        data.addColumn('string', 'Year');
        data.addColumn('number', 'Human');
        data.addColumn('number', 'Squirrel');
        data.addColumn('number', 'Tree');
        data.addColumn('number','Wolf');
        updateData();
        // Set chart options
        var options = {
            'title': ' ',
            'width': chartSettings.chartSize.width,
            'height': chartSettings.chartSize.height,
            curveType: "function",
            legend: {position: 'top', textStyle: {color: 'white', fontSize: 15}, maxLines: 10},
            backgroundColor: "black",
            lineWidth: 6,
            chartArea: {left: 50, top: 100, width: '80%', height: '80%'},
            vAxis: {
                gridlines: {
                    color: "gray",
                },
                minorGridlines: {
                    count: 0,
                },
                textStyle: {color: 'white', fontSize: 16},
                viewWindowMode: 'explicit',
                viewWindow: {
                    max: 200,
                    min: 0
                }
            },
        };

        // Instantiate and draw our chart, passing in some options.
        const graphDiv = document.createElement("div");
        var chart = new google.visualization.LineChart(graphDiv);
        document.getElementById("chartHolder").appendChild(graphDiv);

        setInterval(() => {
            if(isSimActive){
                updateData();
                chart.draw(data, options);
            }
        }, 200);

        function updateData() {
            let dataCount = 50;
            if (data.Wf.length >= dataCount) {
                data.removeRows(0, 1);
            };

            const datamap = new Map();
            world.objects.forEach((o) => {
                //TODO: OPTIMIZE
                const typeName = o.constructor.name;
                if (datamap.has(typeName)) {
                    datamap.set(typeName, datamap.get(typeName) + 1);
                } else {
                    datamap.set(typeName, 1);
                }
            });
            let rows = [[" ", datamap.get("Human"), datamap.get("Squirrel"), datamap.get("Tree"), datamap.get("Wolf")]];
            // let rows = [[" ", perlin.get(2, frameCount/100), perlin.get(3.86, frameCount/150), perlin.get(3.86, frameCount/80)]];
            data.addRows(rows);
        }
    }
}