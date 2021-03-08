window.onload = function () {
    resize_canvas();
    i18n();

    var chart = new SmoothieChart({ 
        millisPerPixel: 200, 
        maxValueScale: 1.1, 
        minValueScale: 1.1, 
        scaleSmoothing: 0.1, 
        grid: { 
            fillStyle: '#ffffff', 
            millisPerLine: 30000, 
            verticalSections: 5
        }, 
        labels: { 
            fillStyle: '#0000ff', 
            fontSize: 18, 
            precision: 1 
        }, 
        timestampFormatter: SmoothieChart.timeFormatter 
    });
    var canvas = document.getElementById('smoothie-chart');
    var series = new TimeSeries();
    var average_array = [];

    chart.addTimeSeries(series, { lineWidth: 3.5, strokeStyle: '#ff0000' });
    chart.streamTo(canvas, 500);

    function run_proc(series, average_array) {
        cockpit.spawn(['sh', '-c', 'sensors|grep °C']).then(function (data) {
            pt = parseFloat(("" + data).trim().split(/[\r\n]+/)[0].split(/:\s*/)[1].trim());
            series.append(new Date().getTime(), pt);
            document.getElementById("cur_temp").innerHTML = pt;
            average_array.push(pt);
            if (average_array.length > 5 * 60) {
                average_array.shift();
            }
            document.getElementById("avg_temp").innerHTML = average(average_array);
        });
    };
    setInterval(function () { run_proc(series, average_array) }, 2000);
    run_proc(series, average_array);
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
    return Math.round(sum * 10 / count) / 10;
}


function i18n() {
    var init = function () {
        var C_ = cockpit.gettext;
        var po_file = './i18n/' + cockpit.language + '.json';
        console.debug('i18n:', po_file);
        fetch(po_file)
            .then(response => response.json())
            .then(data => {
                cockpit.locale(data);
                document.getElementById("title").innerHTML = C_('CPU Temperature');
                document.getElementById("key_cur_temp").innerHTML = C_('Current Temperature:');
                document.getElementById("key_avg_temp").innerHTML = C_('Average Temperature (5m):');
            });    
    };
    check_language_timer = setInterval(() => {
        if (cockpit.language) {
            clearInterval(check_language_timer);
            init();
            return;
        }
    }, 1000);
}
