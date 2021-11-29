function drawthechart() {
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart(time) {
        // Create the data table.
        data = new google.visualization.DataTable();
        data.addColumn('string', 'Year');
        data.addColumn('number', 'CountA');
        data.addColumn('number', 'CountB');
        data.addColumn('number', 'CountC');
        updateData();
        // Set chart options
        var options = {'title':' ',
            'width':700,
            'height':400,
            vAxis: {
                viewWindowMode:'explicit',
                viewWindow: {
                    max:0.7,
                    min:-0.7
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
            let rows = [[" ", perlin.get(2, frameCount/100), perlin.get(3.86, frameCount/150), perlin.get(3.86, frameCount/80)]];
            data.addRows(rows);
        }
    }
}