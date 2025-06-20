var current = 0;
class LivecountseditInterface {
    constructor() {
        this.suffixValues = {
            'k': 1e3,
            'm': 1e6,
            'b': 1e9,
            't': 1e12,
            'q': 1e15,
        },
            this.openTab = function (e, f) {
                var a, b, c;
                b = document.getElementsByClassName('tab-content');
                for (a = 0; a < b.length; a++) {
                    b[a].style.display = 'none';
                }
                c = document.getElementsByClassName('tab-link');
                for (a = 0; a < c.length; a++) {
                    c[a].className = c[a].className.replace(' active', '');
                }
                document.getElementById(f).style.display = 'block';
                e.currentTarget.className += ' active'
            },
            this.rickroll = function () {
                window.location.replace('https://youtu.be/dQw4w9WgXcQ')
            },
            this.setAvatar = function () {
                if (!document.getElementById("options.counter.avatar.file").files.length) {
                    if (!document.getElementById("options.counter.avatar.url").value) return;
                    else document.getElementById("userimg").src = document.getElementById("options.counter.avatar.url").value
                } else {
                    document.getElementById("userimg").src = URL.createObjectURL(document.getElementById("options.counter.avatar.file").files[0])
                }
            }
        this.setTitle = function () {
            document.getElementById("userName").innerHTML = document.getElementById("options.counter.title").value
        }
        this.setValue = function () {
            document.getElementById("counter").innerHTML = parseFloat(document.getElementById("options.counter.value").value)
            current = parseFloat(document.getElementById("options.counter.value").value)
            if (chart.series[0].points.length == 1500) chart.series[0].data[0].remove();
            chart.series[0].addPoint([Date.now(), Math.floor(current)])
        }
        var rate1 = 0;
        var rate2 = 0;
        var updatetime;
        this.setMin = function () {
            rate1 = document.getElementById("options.counter.rates.basicMinimum").value
        }
        this.setMax = function () {
            rate2 = document.getElementById("options.counter.rates.basicMaximum").value
        }
        this.setRate = function () {
            clearInterval(updatetime)
            var t = document.getElementById("options.counter.rates.mode.basic.baseUnit").value
            var e = document.getElementById("options.counter.rates.mode.basic.units").value
            if (e == "") { }
            else {
                if (t == "1") {
                    e = e * 1000
                    var a = e / 2
                    updatetime = setInterval(updateManager, e)
                    updatetime2 = setInterval(graphManager, a)
                } else if (t == "60") {
                    e = e * 60000
                    updatetime = setInterval(updateManager, e)
                    updatetime2 = setInterval(graphManager, a)
                } else if (t == "3600") {
                    e = e * 3.6e+6
                    updatetime = setInterval(updateManager, e)
                    updatetime2 = setInterval(graphManager, a)
                } else if (t == "86400") {
                    e = e * 8.64e+7
                    updatetime = setInterval(updateManager, e)
                    updatetime2 = setInterval(graphManager, a)
                }
            }
        }
        function updateManager() {
            var subs = parseFloat(current)
            var rate3 = 0;
            var rate4 = 0;
            if (document.getElementById('options.counter.rates.mode.basic.baseUnit2').value == "1") {
                rate3 = parseFloat(rate1)
                rate4 = parseFloat(rate2)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit2').value == "60") {
                rate3 = parseFloat(rate1 / 60)
                rate4 = parseFloat(rate2 / 60)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit2').value == "3600") {
                rate3 = parseFloat(rate1 / 3600)
                rate4 = parseFloat(rate2 / 3600)
            } else {
                rate3 = parseFloat(rate1 / 86400)
                rate4 = parseFloat(rate2 / 86400)
            }

            rate3 = parseFloat(rate3)
            rate4 = parseFloat(rate4)
            subs += random(rate3, rate4)
            if (subs == NaN) {
            } else {
                current = subs
            }
            document.getElementById("counter").innerHTML = Math.floor(subs)
        }
    }
}

function graphManager() {
    console.log(current)
    if (chart.series[0].points.length == 1500) chart.series[0].data[0].remove();
    chart.series[0].addPoint([Date.now(), Math.floor(current)])
}
const Interface = new LivecountseditInterface()
window.onload = function () {
    if (document.getElementById('tabs.0')) document.getElementById('tabs.0').click();
}
function submit() {
    Interface.setValue()
}

document.getElementById("options.counter.avatar.file").addEventListener('input', Interface.setAvatar)
document.getElementById("options.counter.avatar.url").addEventListener('input', Interface.setAvatar)
document.getElementById("options.counter.title").addEventListener('input', Interface.setTitle)
document.getElementById("options.counter.rates.basicMinimum").addEventListener('input', Interface.setMin)
document.getElementById("options.counter.rates.basicMaximum").addEventListener('input', Interface.setMax)
document.getElementById("options.counter.rates.mode.basic.units").addEventListener('input', Interface.setRate)
document.getElementById("options.counter.rates.mode.basic.baseUnit").addEventListener('change', Interface.setRate)
document.getElementById("options.counter.rates.mode.basic.baseUnit2").addEventListener('change', Interface.setRate)
document.getElementById("options-counter-type").addEventListener("change", () => {
    switch (document.getElementById("options-counter-type").value) {
        case "youtube":
            document.querySelector(".platform-icon").style.display = "inline";
            document.querySelector(".platform-icon").src = "youtube-icon.png";
            document.getElementById("SearchInput").placeholder = "Enter YouTube Username";
            document.getElementById("realtime-title").innerText = "Real Time YouTube Subscriber Count";
            document.getElementById("live-count-watermark").innerText = "YouTube Live Subscriber Count";
            document.getElementById("live-count-watermark").style.color = "#d64e33";
            document.getElementById("platform-plus-sign").style.backgroundColor = "#e62117";
            document.getElementById("userimg").style.border = "1px solid #e62117";
            break;
        case "twitch":
            document.querySelector(".platform-icon").style.display = "inline";
            document.querySelector(".platform-icon").src = "twitch-icon.png";
            document.getElementById("SearchInput").placeholder = "Enter Twitch Username";
            document.getElementById("realtime-title").innerText = "Real Time Twitch Follower Count";
            document.getElementById("live-count-watermark").innerText = "Twitch Live Follower Count";
            document.getElementById("live-count-watermark").style.color = "#3a0070";
            document.getElementById("platform-plus-sign").style.backgroundColor = "#7a31b3";
            document.getElementById("userimg").style.border = "1px solid #7a31b3";
            break;
        case "twitter":
            document.querySelector(".platform-icon").style.display = "inline";
            document.querySelector(".platform-icon").src = "twitter-icon.png";
            document.getElementById("SearchInput").placeholder = "Enter Twitter Username";
            document.getElementById("realtime-title").innerText = "Real Time Twitter Follower Count";
            document.getElementById("live-count-watermark").innerText = "Twitter Live Follower Count";
            document.getElementById("live-count-watermark").style.color = "#003a70";
            document.getElementById("platform-plus-sign").style.backgroundColor = "#317db3";
            document.getElementById("userimg").style.border = "1px solid #317db3";
            break;
        case "tiktok":
            document.querySelector(".platform-icon").style.display = "none";
            document.getElementById("SearchInput").placeholder = "Enter TikTok Username";
            document.getElementById("realtime-title").innerText = "Real Time TikTok Follower Count";
            document.getElementById("live-count-watermark").innerText = "TikTok Live Follower Count";
            document.getElementById("live-count-watermark").style.color = "#703d00";
            document.getElementById("platform-plus-sign").style.backgroundColor = "#ff4c74";
            document.getElementById("userimg").style.border = "1px solid #ff4c74";
            break;
        default:
            document.querySelector(".platform-icon").style.display = "none";
            document.getElementById("SearchInput").placeholder = "Enter Username";
            document.getElementById("realtime-title").innerText = "Real Time Count";
            document.getElementById("live-count-watermark").innerText = "Live Count";
            document.getElementById("live-count-watermark").style.color = "#703d00";
            document.getElementById("platform-plus-sign").style.backgroundColor = "#333333";
            document.getElementById("userimg").style.border = "1px solid #333333";
    }
})
document.getElementById("options-chart").addEventListener("change", () => {
    if (document.getElementById("options-chart").checked) {
        document.getElementById("chart").style.display = "block";
    } else {
        document.getElementById("chart").style.display = "none";
    }
})

function resetgraph() {

    chart = new Highcharts.chart({
        chart: {
            renderTo: 'chart',
            type: 'spline',
            zoomType: 'x',
            backgroundColor: 'transparent',
            plotBorderColor: 'transparent'
        },
        title: {
            text: ' '
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 500,
            gridLineColor: textBright,
            labels: {
                style: {
                    color: textBright
                }
            },
            lineColor: lineColor,
            minorGridLineColor: '#bdbdbd',
            tickColor: lineColor,
            title: {
                style: {
                    color: textBright
                }
            }
        },
        yAxis: {
            enabled: false,
        },
        credits: {
            enabled: true,
            text: "Livecountsedit"
        },
        series: [{
            showInLegend: false,
            name: 'Subscribers',
            marker: { enabled: false },
            color: '#000000',
            lineColor: "#b3382c"
        }]
    });

}

function random(min, max) {
    return Math.random() * (max - min) + min
}
var textBright = "#bdbdbd"
var lineColor = "#000000"
var maxPoints = 20000;
var chart = new Highcharts.chart({
    chart: {
        renderTo: 'chart',
        type: 'spline',
        zoomType: 'x',
        backgroundColor: 'transparent',
        plotBorderColor: 'transparent'
    },
    title: {
        text: ' '
    },
    xAxis: {
        type: 'datetime',
        tickPixelInterval: 500,
        gridLineColor: textBright,
        labels: {
            style: {
                color: textBright
            }
        },
        lineColor: lineColor,
        minorGridLineColor: '#bdbdbd',
        tickColor: lineColor,
        title: {
            style: {
                color: textBright
            }
        }
    },
    yAxis: {
        visible: false,
    },
    credits: {
        enabled: true,
        text: "Livecountsedit"
    },

    series: [{
        showInLegend: false,
        name: 'Subscribers',
        marker: { enabled: false },
        color: '#b3382c',
        lineColor: '#b3382c'
    }]
});

function openmenu() {
    if (document.getElementById('settingsMenu').style.visibility == "visible") {
        document.getElementById('settingsMenu').style.visibility = "hidden"
    } else {
        document.getElementById('settingsMenu').style.visibility = "visible"
    }
}
document.getElementById('close').onclick = function () {
    document.getElementById('settingsMenu').style.visibility = "hidden"
}
