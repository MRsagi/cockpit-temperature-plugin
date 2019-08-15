window.onload = function () {
    resize_canvas()

    var chart = new SmoothieChart({, millisPerPixel: 200, maxValueScale: 1.1, minValueScale: 1.1, scaleSmoothing: 0.1, grid: { fillStyle: '#ffffff', millisPerLine: 5000, verticalSections: 8 }, labels: { fillStyle: '#0000ff', fontSize: 18, precision: 1 }, timestampFormatter: SmoothieChart.timeFormatter }),
        canvas = document.getElementById('smoothie-chart'),
        series = new TimeSeries();
        average_array = []

    chart.addTimeSeries(series, { lineWidth: 3.5, strokeStyle: '#ff0000' });
    chart.streamTo(canvas, 500);

    function run_proc(series,average_array) {
        var proc = cockpit.spawn(["vcgencmd","measure_temp"]);
        proc.done(function(data){
            pt = parseFloat(data.match(/([0-9\.]+)/)[1]);
            series.append(new Date().getTime(), pt);
            document.getElementById("cur_temp").innerHTML = pt;
            average_array.push(pt);
            if(average_array.length > 5*60){
                average_array.shift();
            }
            document.getElementById("avg_temp").innerHTML = average(average_array);
            console.log(average_array);
        });
    };

    //run_proc(series)
    setInterval(function () { run_proc(series,average_array) }, 1000);
}

function resize_canvas() {
    document.getElementById("smoothie-chart").width = window.innerWidth - 50;
}

function average(array) {
    var sum = 0;
    var count = array.length;
    for (var i = 0; i < count; i++) {
      sum = sum + array[i];
    }
    return sum / count;
  }