function drawthechart() {
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart(time) {
        // Create the data table.
        data = new google.visualization.DataTable();
        data.addColumn('string', 'Year');
        data.addColumn('number', 'Human');
        data.addColumn('number', 'Squirrel');
        data.addColumn('number', 'Tree');
        updateData();
        // Set chart options
        var options = {'title':' ',
            'width':700,
            'height':400,
            vAxis: {
                viewWindowMode:'explicit',
                viewWindow: {
                    max:100,
                    min:0
                }
            },};

        // Instantiate and draw our chart, passing in some options.
        const graphDiv = document.createElement("div");
        var chart = new google.visualization.LineChart(graphDiv);
        document.body.appendChild(graphDiv);

        setInterval(() => {
            updateData();
            chart.draw(data, options);
        }, 100);

        function updateData(){
            let dataCount = 50;
            if(data.Wf.length >= dataCount){
                data.removeRows(0, 1);
            };

            const datamap = new Map();
            world.objects.forEach((o) => {
                const typeName = o.constructor.name;
                if (datamap.has(typeName)) {
                    datamap.set(typeName, datamap.get(typeName) + 1);
                } else {
                    datamap.set(typeName, 1);
                }
            })
            let rows = [[" ", datamap.get("Human"), datamap.get("Squirrel"), datamap.get("Tree")]];
            // let rows = [[" ", perlin.get(2, frameCount/100), perlin.get(3.86, frameCount/150), perlin.get(3.86, frameCount/80)]];
            data.addRows(rows);
        }
    }
}