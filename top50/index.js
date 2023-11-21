let currentIndex = 0;
let auditTimeout;
let saveInterval;
let makingSequence = false;
let sequenceStuff = {}
let chart;
let nextUpdateAudit = false;
function abb(n) {
    return Math.floor(parseFloat(n.toPrecision(3)))
}
const uuidGen = function () {
    let a = function () {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    return a() + a() + '-' + a() + '-' + a() + '-' + a() + '-' + a() + a() + a();
}
function randomGen() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
function avg(a, b) {
    return (a + b) / 2
}
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
let uuid = uuidGen()
let data = {
    "data": [],
    "bgColor": "#FFF",
    "textColor": "#000",
    "boxColor": "#f7f5fe",
    "boxBorder": "#FFF",
    "imageBorder": "0",
    "sort": "",
    "gain_min": -10000,
    "gain_max": 10000,
    "updateInterval": 2000,
    "uuid": uuid,
    "animation": true,
    "abbreviate": false,
    "fastest": true,
    "slowest": true,
    "hideSettings": 'q',
    'offlineGains': false,
    'lastOnline': new Date().getTime(),
    'theme': 'top50',
    'max': 50,
    'autosave': true,
    'pause': false,
    'odometerUp': 'null',
    'odometerDown': 'null',
    'odometerSpeed': 2,
    'visulization': 'default',
    'audits': false,
    'auditStats': [0, 0, 0, 0],
    'apiUpdates': {
        'enabled': false,
        'url': '',
        'interval': 2000,
        'method': 'GET',
        'body': {},
        'headers': {},
        'maxChannelsPerFetch': 'one',
        'response': {
            'loop': 'data',
            'name': {
                'enabled': true,
                'path': 'name',
            },
            'count': {
                'enabled': true,
                'path': 'count',
            },
            'image': {
                'enabled': true,
                'path': 'image',
            },
            'id': {
                'enabled': true,
                'path': 'id',
            }
        },
    }
};
let updateInterval;
let apiInterval;

initLoad()
function initLoad(redo) {
    if (!redo) {
        data = localStorage.getItem("data") ? JSON.parse(localStorage.getItem("data")) : data;
    }
    if (!data.apiUpdates) {
        data.apiUpdates = {
            'enabled': false,
            'url': '',
            'interval': 2000,
            'method': 'GET',
            'body': '',
            'headers': '',
            'maxChannelsPerFetch': 'one',
            'response': {
                'loop': 'data',
                'name': {
                    'enabled': true,
                    'path': 'name',
                },
                'count': {
                    'enabled': true,
                    'path': 'count',
                },
                'image': {
                    'enabled': true,
                    'path': 'image',
                },
                'id': {
                    'enabled': true,
                    'path': 'id',
                }
            },
        }
    }
    if (data.apiUpdates.enabled) {
        apiInterval = setInterval(function () {
            apiUpdate(true);
        }, parseFloat(data.apiUpdates.interval));
    }
    if (!data.auditStats) {
        data.auditStats = [0, 0, 0, 0];
    }
    if ((!data.audits) && (data.audits !== false)) {
        data.audits = false;
    }
    if (!data.theme) {
        data.theme = 'top50';
    }
    if (data.theme == 'top10') {
        data.max = 10;
    } else if (data.theme == 'top25') {
        data.max = 25;
    } else if (data.theme == 'top50') {
        data.max = 50;
    } else if (data.theme == 'top100') {
        data.max = 100;
    } else if (data.theme == 'top150') {
        data.max = 150;
    }
    if (!data.odometerDown || data.odometerDown == 'null') {
        data.odometerDown = '#000';
    }
    if (!data.odometerUp || data.odometerUp == 'null') {
        data.odometerUp = '#000';
    }
    if (!data.odometerSpeed) {
        data.odometerSpeed = 2;
    }
    if ((!data.autosave) && (data.autosave !== false)) {
        data.autosave = false;
    }
    data.pause = false;
    data.visulization = 'default';
    if (data.lastOnline && data.offlineGains == true) {
        const interval = data.updateInterval / 1000;
        const secondsPassed = (new Date().getTime() - data.lastOnline) / 1000;
        for (let i = 0; i < data.data.length; i++) {
            if (parseFloat(data.mean_gain) > 0) {
                const gain = randomGaussian(parseFloat(data.data[i].mean_gain), parseFloat(data.data[i].std_gain));
                const gained = gain * (secondsPassed / interval);
                data.data[i].count += gained;
            } else {
                const gain = random(parseFloat(data.data[i].min_gain), parseFloat(data.data[i].max_gain));
                const gained = gain * (secondsPassed / interval);
                data.data[i].count += gained;
            }
        }
        data.lastOnline = new Date().getTime();
    }
    if (!data.updateInterval) {
        data.updateInterval = 2000;
    }
    let c = 1;
    let columns = data.theme == 'top100' ? 10 : 5;
    columns = data.theme == 'top150' ? 10 : columns;
    for (let l = 1; l <= columns; l++) {
        const htmlcolumn = `<div class="column_${l} column"></div>`;
        $('.main').append(htmlcolumn);
        const maxCards = data.max / columns;
        for (let t = 1; t <= maxCards; t++) {
            const cc = (c < 10) ? "0" + c : c;
            const dataIndex = c - 1;
            let abbTest = `<div class="count odometer" id="count_${data.data[dataIndex] ? data.data[dataIndex].id : ''}">${Math.floor(data.data[dataIndex] ? data.data[dataIndex].count : 0)}</div>`;
            if (data.abbreviate == true) {
                abbTest = `<div class="count odometer" id="count_${data.data[dataIndex] ? data.data[dataIndex].id : ''}">${abb(Math.floor(data.data[dataIndex] ? data.data[dataIndex].count : 0))}</div>`;
            }
            const htmlcard = `<div class="card card_${dataIndex}" id="card_${data.data[dataIndex] ? data.data[dataIndex].id : ''}">
                <div class="num" id="num_${data.data[dataIndex] ? data.data[dataIndex].id : ''}">${cc}</div>
                <img src="${data.data[dataIndex] ? data.data[dataIndex].image : '../default.png'}" alt="" id="image_${data.data[dataIndex] ? data.data[dataIndex].id : ''}" class="image">
                <div class="name" id="name_${data.data[dataIndex] ? data.data[dataIndex].id : ''}">${data.data[dataIndex] ? data.data[dataIndex].name : 'Loading'}</div>
                ${abbTest}
            </div>`;
            $('.column_' + l).append(htmlcard);
            c += 1;
        }
    }
    if (data.theme == 'top100') {
        const style = document.createElement('style');
        style.innerHTML = `.image { height: 2.15vw; width: 2.15vw; }
            .card { height: 2.15vw; }
            .count { font-size: 1vw; }
            .name { font-size: 0.75vw; }`;
        document.getElementById('main').style = "margin-top: 0px; display: grid; grid-template-columns: repeat(10, 1fr);";
        document.getElementsByTagName('head')[0].appendChild(style);
    } else if (data.theme == 'top150') {
        const style = document.createElement('style');
        style.innerHTML = `.image { height: 2.15vw; width: 2.15vw; }
            .card { height: 2.15vw; }
            .count { font-size: 1vw; }
            .name { font-size: 0.75vw; }`;
        document.getElementById('main').style = "margin-top: 0px; display: grid; grid-template-columns: repeat(10, 1fr);";
        document.getElementsByTagName('head')[0].appendChild(style);
    } else {
        const style = document.createElement('style');
        style.innerHTML = `.image { height: 4.3vw; width: 4.3vw; }
            .card { height: 4.3vw; }
            .count { font-size: 2vw; }
            .name { font-size: 1.5vw; }`;
        document.getElementById('main').style = "margin-top: 0px; display: grid; grid-template-columns: repeat(5, 1fr);";
        document.getElementsByTagName('head')[0].appendChild(style);
    }
    if (!data.uuid) {
        data.uuid = uuidGen();
    }
    document.body.style.backgroundColor = data.bgColor;
    document.body.style.color = data.textColor;
    fix();
    if (data.theme !== 'line') {
        updateOdo();
    }
    updateInterval = setInterval(update, data.updateInterval);
}

function initLoad2() {
    let c = 1;
    clearInterval(updateInterval);
    if (data.theme == 'top50') {
        for (var l = 1; l <= 5; l++) {
            var htmlcolumn = `<div class="column_${l} column"></div>`;
            $('.main').append(htmlcolumn);
            for (var t = 1; t <= 10; t++) {
                let cc = c;
                if (c < 10) {
                    cc = "0" + c;
                }
                if (sequenceStuff.data[0].channels[c - 1]) {
                    var abbTest = `<div class="count odometer" id="count_${sequenceStuff.data[0].channels[c - 1].id}">${Math.floor(sequenceStuff.data[0].channels[c - 1].count)}</div>`;
                    if (data.abbreviate == true) {
                        abbTest = `<div class="count odometer" id="count_${sequenceStuff.data[0].channels[c - 1].id}">${abb(Math.floor(sequenceStuff.data[0].channels[c - 1].count))}</div>`;
                    }
                    var htmlcard = `<div class="card card_${c - 1}" id="card_${sequenceStuff.data[c - 1].id}">
            <div class="num" id="num_${sequenceStuff.data[0].channels[c - 1].id}">${cc}</div>
          <img src="${sequenceStuff.data[0].channels[c - 1].image}" alt="" id="image_${sequenceStuff.data[0].channels[c - 1].id}" class="image">
          <div class="name" id="name_${sequenceStuff.data[0].channels[c - 1].id}">${sequenceStuff.data[0].channels[c - 1].name}</div>
          ${abbTest}
          </div>`;
                    $('.column_' + l).append(htmlcard);
                    c += 1;
                } else {
                    var htmlcard = `<div class="card card_${c - 1}" id="card_">
                <div class="num" id="num_">${cc}</div>
                <img src="../default.png" alt="" id="image_" class="image">
                <div class="name" id="name_">Loading</div>
                <div class="count odometer" id="count_">0</div>
                </div>`;
                    $('.column_' + l).append(htmlcard);
                    c += 1;
                }
            }
        }
    } else if (data.theme == 'top10') {
        for (var l = 1; l <= 5; l++) {
            var htmlcolumn = `<div class="column_${l} column"></div>`;
            $('.main').append(htmlcolumn);
            for (var t = 1; t <= 2; t++) {
                let cc = c;
                if (c < 10) {
                    cc = "0" + c;
                }
                if (data.data[c - 1]) {
                    var abbTest = `<div class="count odometer" id="count_${data.data[c - 1].id}">${Math.floor(data.data[c - 1].count)}</div>`;
                    if (data.abbreviate == true) {
                        abbTest = `<div class="count odometer" id="count_${data.data[c - 1].id}">${abb(Math.floor(data.data[c - 1].count))}</div>`;
                    }
                    var htmlcard = `<div class="card card_${c - 1}" id="card_${data.data[c - 1].id}">
            <div class="num" id="num_${data.data[c - 1].id}">${cc}</div>
          <img src="${data.data[c - 1].image}" alt="" id="image_${data.data[c - 1].id}" class="image">
          <div class="name" id="name_${data.data[c - 1].id}">${data.data[c - 1].name}</div>
          ${abbTest}
          </div>`;
                    $('.column_' + l).append(htmlcard);
                    c += 1;
                } else {
                    var htmlcard = `<div class="card card_${c - 1}" id="card_">
                <div class="num" id="num_">${cc}</div>
                <img src="../default.png" alt="" id="image_" class="image">
                <div class="name" id="name_">Loading</div>
                <div class="count odometer" id="count_">0</div>
                </div>`;
                    $('.column_' + l).append(htmlcard);
                    c += 1;
                }
            }
        }
    } else if (data.theme == 'top25') {
        for (var l = 1; l <= 5; l++) {
            var htmlcolumn = `<div class="column_${l} column"></div>`;
            $('.main').append(htmlcolumn);
            for (var t = 1; t <= 5; t++) {
                let cc = c;
                if (c < 10) {
                    cc = "0" + c;
                }
                if (data.data[c - 1]) {
                    var abbTest = `<div class="count odometer" id="count_${data.data[c - 1].id}">${Math.floor(data.data[c - 1].count)}</div>`;
                    if (data.abbreviate == true) {
                        abbTest = `<div class="count odometer" id="count_${data.data[c - 1].id}">${abb(Math.floor(data.data[c - 1].count))}</div>`;
                    }
                    var htmlcard = `<div class="card card_${c - 1}" id="card_${data.data[c - 1].id}">
            <div class="num" id="num_${data.data[c - 1].id}">${cc}</div>
            <img src="${data.data[c - 1].image}" alt="" id="image_${data.data[c - 1].id}" class="image">
            <div class="name" id="name_${data.data[c - 1].id}">${data.data[c - 1].name}</div>
            ${abbTest}
            </div>`;
                    $('.column_' + l).append(htmlcard);
                    c += 1;
                } else {
                    var htmlcard = `<div class="card card_${c - 1}" id="card_">
                <div class="num" id="num_">${cc}</div>
                <img src="../default.png" alt="" id="image_" class="image">
                <div class="name" id="name_">Loading</div>
                <div class="count odometer" id="count_">0</div>
                </div>`;
                    $('.column_' + l).append(htmlcard);
                    c += 1;
                }
            }
        }
    } else if (data.theme == 'top100') {
        document.getElementById('main').style = "margin-top: 0px; display: grid; grid-template-columns: repeat(10, 1fr);";
        var style = document.createElement('style');
        style.innerHTML = `.image { height: 2.15vw; width: 2.15vw; }
        .card { height: 2.15vw; }
        .count { font-size: 1vw; }
        .name { font-size: 0.75vw; }`;
        document.getElementsByTagName('head')[0].appendChild(style);
        for (var l = 1; l <= 10; l++) {
            var htmlcolumn = `<div class="column_${l} column"></div>`;
            $('.main').append(htmlcolumn);
            for (var t = 1; t <= 10; t++) {
                let cc = c;
                if (c < 10) {
                    cc = "0" + c;
                }
                if (data.data[c - 1]) {
                    var abbTest = `<div class="count odometer" id="count_${data.data[c - 1].id}">${Math.floor(data.data[c - 1].count)}</div>`;
                    if (data.abbreviate == true) {
                        abbTest = `<div class="count odometer" id="count_${data.data[c - 1].id}">${abb(Math.floor(data.data[c - 1].count))}</div>`;
                    }
                    var htmlcard = `<div class="card card_${c - 1}" id="card_${data.data[c - 1].id}">
            <div class="num" id="num_${data.data[c - 1].id}">${cc}</div>
            <img src="${data.data[c - 1].image}" alt="" id="image_${data.data[c - 1].id}" class="image">
            <div class="name" id="name_${data.data[c - 1].id}">${data.data[c - 1].name}</div>
            ${abbTest}
            </div>`;
                    $('.column_' + l).append(htmlcard);
                    c += 1;
                } else {
                    var htmlcard = `<div class="card card_${c - 1}" id="card_">
                <div class="num" id="num_">${cc}</div>
                <img src="../default.png" alt="" id="image_" class="image">
                <div class="name" id="name_">Loading</div>
                <div class="count odometer" id="count_">0</div>
                </div>`;
                    $('.column_' + l).append(htmlcard);
                    c += 1;
                }
            }
        }
    } else if (data.theme == 'top150') {
        document.getElementById('main').style = "margin-top: 0px; display: grid; grid-template-columns: repeat(10, 1fr);";
        var style = document.createElement('style');
        style.innerHTML = `.image { height: 2.15vw; width: 2.15vw; }
        .card { height: 2.15vw; }
        .count { font-size: 1vw; }
        .name { font-size: 0.75vw; }`;
        document.getElementsByTagName('head')[0].appendChild(style);
        for (var l = 1; l <= 10; l++) {
            var htmlcolumn = `<div class="column_${l} column"></div>`;
            $('.main').append(htmlcolumn);
            for (var t = 1; t <= 10; t++) {
                let cc = c;
                if (c < 10) {
                    cc = "0" + c;
                }
                if (data.data[c - 1]) {
                    var abbTest = `<div class="count odometer" id="count_${data.data[c - 1].id}">${Math.floor(data.data[c - 1].count)}</div>`;
                    if (data.abbreviate == true) {
                        abbTest = `<div class="count odometer" id="count_${data.data[c - 1].id}">${abb(Math.floor(data.data[c - 1].count))}</div>`;
                    }
                    var htmlcard = `<div class="card card_${c - 1}" id="card_${data.data[c - 1].id}">
            <div class="num" id="num_${data.data[c - 1].id}">${cc}</div>
            <img src="${data.data[c - 1].image}" alt="" id="image_${data.data[c - 1].id}" class="image">
            <div class="name" id="name_${data.data[c - 1].id}">${data.data[c - 1].name}</div>
            ${abbTest}
            </div>`;
                    $('.column_' + l).append(htmlcard);
                    c += 1;
                } else {
                    var htmlcard = `<div class="card card_${c - 1}" id="card_">
                <div class="num" id="num_">${cc}</div>
                <img src="../default.png" alt="" id="image_" class="image">
                <div class="name" id="name_">Loading</div>
                <div class="count odometer" id="count_">0</div>
                </div>`;
                    $('.column_' + l).append(htmlcard);
                    c += 1;
                }
            }
        }
    } else {
        alert('err')
    }
    fix()
    updateOdo();
    updateInterval = setInterval(update, data.updateInterval);
}

function create() {
    const addMinGain = document.getElementById('add_min_gain').value;
    const addMaxGain = document.getElementById('add_max_gain').value;
    const addMeanGain = document.getElementById('add_mean_gain').value;
    const addStdGain = document.getElementById('add_std_gain').value;
    const addCount = document.getElementById('add_count').value;
    const addName = document.getElementById('add_name').value;
    const addImage1 = document.getElementById('add_image1').value;
    const addImage2 = document.getElementById('add_image2');
    if (addMinGain === '' || addMaxGain === '') {
        alert('Please fill the minimum and maximum gain.');
        return;
    }
    const min = parseFloat(addMinGain);
    const max = parseFloat(addMaxGain);
    let mean = parseFloat(addMeanGain);
    let std = parseFloat(addStdGain);
    if (!addCount) {
        alert('Please enter a count value');
        return;
    } else if (!addName) {
        alert('Please enter a name value');
        return;
    }
    let image = '';
    if (!addImage1) {
        if (addImage2.files.length === 0) {
            image = '../default.png';
            bruh();
            return;
        } else {
            const file = addImage2.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                image = reader.result;
                bruh();
            };
        }
    } else {
        image = addImage1;
        bruh();
    }
    function bruh() {
        if (!mean) {
            mean = (min + max) / 2;
        }
        const count = parseFloat(addCount);
        const name = addName;
        let id = randomGen();
        if (document.getElementById('add_id').value.length > 0) {
            id = document.getElementById('add_id').value;
        }
        data.data.push({
            name,
            count,
            image,
            min_gain: min,
            mean_gain: mean,
            std_gain: std,
            max_gain: max,
            id,
        });
        fix();
    }
}

let sequenceNum = 0;
function update() {
    let start = new Date().getTime();
    if (data) {
        let fastest = ""
        let fastestCount = 0;
        let slowest = ""
        let slowestCount = 0;
        let past = document.getElementById('quickSelect').value;
        document.getElementById('quickSelect').innerHTML = "";
        let selections = ['<option value="select">Select</option>'];
        for (let i = 0; i < data.data.length; i++) {
            selections.push('<option value="' + data.data[i].id + '">' + data.data[i].name + '</option>')
            data.data[i].lastCount = data.data[i].count;
            if ((data.data[i].mean_gain && data.data[i].std_gain) && (data.data[i].mean_gain != 0) && (data.data[i].std_gain != 0)) {
                data.data[i].count = parseFloat(data.data[i].count) + randomGaussian(parseFloat(data.data[i].mean_gain), parseFloat(data.data[i].std_gain))
            } else {
                data.data[i].count = parseFloat(data.data[i].count) + random(parseFloat(data.data[i].min_gain), parseFloat(data.data[i].max_gain));
            }
            if ((data.data[i].count - data.data[i].lastCount > fastestCount) || (fastestCount == 0)) {
                fastestCount = data.data[i].count - data.data[i].lastCount;
                fastest = data.data[i].id;
            }
            if ((data.data[i].count - data.data[i].lastCount < slowestCount) || (slowestCount == 0)) {
                slowestCount = data.data[i].count - data.data[i].lastCount;
                slowest = data.data[i].id;
            }
            if (nextUpdateAudit == true) {
                let update = random(data.auditStats[0], data.auditStats[1])
                data.data[i].count = data.data[i].count + update
            }
            if (i == data.data.length - 1) {
                nextUpdateAudit = false
            }
        }
        document.getElementById('quickSelect').innerHTML = selections.join("");
        document.getElementById('quickSelect').value = past;
        let sort = `b.${document.getElementById('sort').value} - a.${document.getElementById('sort').value}`
        if (document.getElementById('sort').value == "fastest") {
            sort = `avg(b.min_gain, b.max_gain) - avg(a.min_gain, a.max_gain)`
        }
        if (document.getElementById('sort').value == "slowest") {
            sort = `avg(a.min_gain, a.max_gain) - avg(b.min_gain, b.max_gain)`
        }
        if (!document.getElementById('sort').value) {
            sort = `b.count - a.count`
        }
        data.data = data.data.sort(function (a, b) {
            return eval(sort)
        });
        if (data.visulization == 'default') {
            for (let i = 0; i < data.max; i++) {
                if ((i + 1) < 10) {
                    num = "0" + (i + 1);
                } else {
                    num = (i + 1);
                }
                if (document.getElementsByClassName("card")[i]) {
                    if (data.data[i]) {
                        if (!data.data[i].image) {
                            data.data[i].image = "../default.png";
                        }
                        document.getElementsByClassName("card")[i].children[1].src = data.data[i].image
                        document.getElementsByClassName("card")[i].children[2].innerHTML = data.data[i].name
                        document.getElementsByClassName("card")[i].children[1].id = "image_" + data.data[i].id
                        document.getElementsByClassName("card")[i].children[2].id = "name_" + data.data[i].id
                        document.getElementsByClassName("card")[i].children[0].id = "num_" + data.data[i].id
                        document.getElementsByClassName("card")[i].id = "card_" + data.data[i].id
                        document.getElementsByClassName("card")[i].children[3].id = "count_" + data.data[i].id
                        if (data.abbreviate == true) {
                            document.getElementsByClassName("card")[i].children[3].innerHTML = abb(data.data[i].count)
                        } else {
                            document.getElementsByClassName("card")[i].children[3].innerHTML = Math.floor(data.data[i].count)
                        }
                        if (selected == data.data[i].id) {
                            document.getElementById("card_" + selected).style.border = "1px solid red";
                        } else {
                            document.getElementById("card_" + data.data[i].id).style.border = "1px solid " + data.boxBorder + "";
                        }
                        if (fastest == data.data[i].id) {
                            if (data.fastest == true) {
                                document.getElementById("card_" + fastest).children[2].innerHTML = "🔥" + data.data[i].name
                            }
                        }
                        if (slowest == data.data[i].id) {
                            if (data.slowest == true) {
                                document.getElementById("card_" + slowest).children[2].innerHTML = "⌛️" + data.data[i].name
                            }
                        }
                    }
                }
            }
        } else if (data.visulization == 'line') {
            data.data.forEach(function (item, index) {
                chart.data.datasets[index].data.push(item.count);

            });
            chart.data.labels.push(new Date().toLocaleTimeString());
            if (chart.data.labels.length > 50) {
                chart.data.labels.shift();
                chart.data.datasets.forEach(function (dataset) {
                    dataset.data.shift();
                });
            }
            chart.update();
        } else if (data.visulization == 'sequence') {
            if (sequenceNum < sequenceStuff.data.length) {
                sequenceStuff.data[sequenceNum].channels.forEach(function (item, i) {
                    if (item.image) {
                        item.image = item.image;
                    } else {
                        item.image = "../default.png";
                    }
                    document.getElementsByClassName("card")[i].children[1].src = item.image
                    document.getElementsByClassName("card")[i].children[2].innerHTML = item.name
                    document.getElementsByClassName("card")[i].children[1].id = "image_" + item.id
                    document.getElementsByClassName("card")[i].children[2].id = "name_" + item.id
                    document.getElementsByClassName("card")[i].children[0].id = "num_" + item.id
                    document.getElementsByClassName("card")[i].id = "card_" + item.id
                    document.getElementsByClassName("card")[i].children[3].id = "count_" + item.id
                    document.getElementsByClassName("card")[i].children[3].innerHTML = Math.floor(item.count)
                })
                sequenceNum++;
            }
        }
    }
    let end = new Date().getTime();
    let time = end - start;
    console.log('Execution timeS: ' + time / 1000);
}

document.getElementById('sort').addEventListener('change', function () {
    update();
});

let selected = null;
document.getElementById('main').addEventListener('click', function (e) {
    selecterFunction(e)
})

document.getElementById('quickSelect').addEventListener('change', function (e) {
    if (document.getElementById('quickSelect').value !== 'select') {
        let newForm = {
            target: { id: "image_" + document.getElementById('quickSelect').value }
        }
        selecterFunction(newForm)
    }
})

function selecterFunction(e) {
    if (makingSequence == false) {
        let id = e.target.id.split("_")[1];
        if (e.target.id.split("_").length > 2) {
            for (let i = 2; i < e.target.id.split("_").length; i++) {
                id = id + "_" + e.target.id.split("_")[i];
            }
        }
        if (selected != null) {
            document.getElementById('card_' + selected + '').classList.remove('selected');
            document.getElementById('card_' + selected + '').style.border = "solid 1px " + data.boxBorder + "";
        }
        if (id == selected) {
            if (selected != null) {
                document.getElementById('card_' + id + '').classList.remove('selected');
                document.getElementById('card_' + id + '').style.border = "solid 1px " + data.boxBorder + "";
                selected = null;
                document.getElementById('edit_min_gain').value = "";
                document.getElementById('edit_mean_gain').value = "";
                document.getElementById('edit_std_gain').value = "";
                document.getElementById('edit_max_gain').value = "";
                document.getElementById('edit_name').value = "";
                document.getElementById('edit_count').value = "";
                document.getElementById('edit_image1').value = "";
            }
        } else {
            if (document.getElementById('card_' + id + '')) {
                document.getElementById('card_' + id + '').classList.add('selected');
                document.getElementById('card_' + id + '').style.border = "solid 1px red"
                selected = id;
                for (let q = 0; q < data.data.length; q++) {
                    if (data.data[q].id == id) {
                        if (data.data[q].mean_gain) {
                            document.getElementById('edit_mean_gain').value = data.data[q].mean_gain;
                            document.getElementById('edit_mean_gain_check').checked = true;
                        } else {
                            document.getElementById('edit_mean_gain').value = "";
                            document.getElementById('edit_mean_gain_check').checked = false;
                        }
                        if (data.data[q].std_gain) {
                            document.getElementById('edit_std_gain').value = data.data[q].mean_gain;
                            document.getElementById('edit_std_gain_check').checked = true;
                        } else {
                            document.getElementById('edit_std_gain').value = "";
                            document.getElementById('edit_std_gain_check').checked = false;
                        }
                        document.getElementById('edit_min_gain').value = data.data[q].min_gain;
                        document.getElementById('edit_max_gain').value = data.data[q].max_gain;
                        document.getElementById('edit_name').value = data.data[q].name;
                        document.getElementById('edit_count').value = data.data[q].count;
                        document.getElementById('edit_image1').value = data.data[q].image;
                    }
                }
            }
        }
    } else {
        selecterFunction2(e)
    }
}

function edit() {
    if (selected !== null) {
        let id = selected;
        let name = document.getElementById('edit_name').value;
        let count = document.getElementById('edit_count').value;
        let image;
        if (document.getElementById('edit_image_check').checked) {
            if (document.getElementById('edit_image1').value !== "") {
                image = document.getElementById('edit_image1').value;
                bruh()
            } else if (document.getElementById('edit_image2').files.length !== 0) {
                let file = document.getElementById('edit_image2').files[0];
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    image = reader.result;
                    bruh()
                }
            }
        } else {
            bruh()
        }
        function bruh() {
            let min = document.getElementById('edit_min_gain').value;
            let max = document.getElementById('edit_max_gain').value;
            document.getElementById('edit_image2').value = "";
            let card = document.getElementById('card_' + id);
            for (let i = 0; i < data.data.length; i++) {
                if (data.data[i].id == id) {
                    if (document.getElementById('edit_min_gain_check').checked) {
                        data.data[i].min_gain = min;
                    }
                    if (document.getElementById('edit_max_gain_check').checked) {
                        data.data[i].max_gain = max;
                    }
                    if (document.getElementById('edit_mean_gain_check').checked) {
                        if (document.getElementById('edit_mean_gain').value !== "") {
                            data.data[i].mean_gain = parseFloat(document.getElementById('edit_mean_gain').value)
                        } else {
                            data.data[i].mean_gain = undefined;
                        }
                    }
                    if (document.getElementById('edit_std_gain_check').checked) {
                        if (document.getElementById('edit_std_gain').value !== "") {
                            data.data[i].std_gain = parseFloat(document.getElementById('edit_std_gain').value)
                        } else {
                            data.data[i].std_gain = undefined;
                        }
                    }
                }
            }
            if (document.getElementById('edit_name_check').checked) {
                if (card.querySelector('.name').innerHTML !== name && name !== "") {
                    card.querySelector('.name').innerHTML = name;
                    for (let i = 0; i < data.data.length; i++) {
                        if (data.data[i].id == id) {
                            data.data[i].name = name;
                        }
                    }
                }
            }
            if (document.getElementById('edit_count_check').checked) {
                if (card.querySelector('.odometer').innerHTML !== count && count !== "") {
                    card.querySelector('.odometer').innerHTML = count;
                    for (let i = 0; i < data.data.length; i++) {
                        if (data.data[i].id == id) {
                            data.data[i].count = count;
                        }
                    }
                }
            }
            if (card.querySelector('.image').src !== image && image !== "") {
                card.querySelector('.image').src = image;
                for (let i = 0; i < data.data.length; i++) {
                    if (data.data[i].id == id) {
                        data.data[i].image = image;
                    }
                }
            }
        }
    } else {
        alert("Please select a card by clicking it.");
    }
}

function save() {
    localStorage.setItem("data", JSON.stringify(data));
    alert("Saved!");
}

function saveData2() {
    localStorage.setItem("data", JSON.stringify(data));
}

function load() {
    data3 = {};
    document.getElementById('main').innerHTML = "";
    if (document.getElementById('loadData').files[0]) {
        document.getElementById('loadData').files[0].text().then(function (data2) {
            data3 = JSON.parse(data2);
            if (data3.data) {
                data = JSON.parse(data2);
                for (let i = 0; i < data.data.length; i++) {
                    let id = data.data[i].id;
                    let image = data.data[i].image;
                    let name = data.data[i].name;
                    let count = data.data[i].count;
                    if (currentIndex < 10) {
                        num = "0" + (currentIndex).toString();
                    } else {
                        num = currentIndex;
                    }
                    let card = document.createElement('div');
                    card.className = "card";
                    card.id = "card_" + currentIndex;
                    card.setAttribute("cid", id);
                    let div = document.createElement('div');
                    div.className = "num";
                    div.id = "num_" + currentIndex;
                    div.innerHTML = num;
                    div.setAttribute("cid", id);
                    let img = document.createElement('img');
                    img.className = "img";
                    img.id = "img_" + currentIndex;
                    img.src = image;
                    img.setAttribute("cid", id);
                    let nameDiv = document.createElement('h1');
                    nameDiv.className = "name";
                    nameDiv.id = "name_" + currentIndex;
                    nameDiv.innerHTML = name;
                    nameDiv.setAttribute("cid", id);
                    let countDiv = document.createElement('h2');
                    countDiv.classList = "odometer";
                    countDiv.id = "count_" + currentIndex;
                    countDiv.innerHTML = count;
                    countDiv.setAttribute("cid", id);
                    odo = new Odometer({
                        el: countDiv
                    });
                    card.appendChild(div);
                    card.appendChild(img);
                    card.appendChild(nameDiv);
                    card.appendChild(countDiv);
                    document.getElementById('main').appendChild(card);
                    currentIndex++;
                }
                document.body.style.backgroundColor = data.bgColor;
                document.body.style.color = data.textColor;
                document.getElementById('sort').value = data.sort;
                if (!data.uuid) {
                    data.uuid = uuidGen();
                }
                localStorage.setItem("data", JSON.stringify(data));
                location.reload();
            }
        });
    }
}
function save2() {
    let data2 = JSON.stringify(data);
    let a = document.createElement('a');
    let file = new Blob([data2], { type: 'text/json' });
    a.href = URL.createObjectURL(file);
    a.download = 'data.json';
    a.click();
}

function reset() {
    if (confirm("Are you sure you want to reset?")) {
        localStorage.clear();
        location.reload();
    }
}

function deleteChannel() {
    if (selected !== null) {
        if (confirm("Are you sure you want to delete this channel?")) {
            let id = selected;
            let image = document.getElementById('image_' + id).src = "../default.png"
            let name = document.getElementById('name_' + id).innerHTML = "Loading";
            let count = document.getElementById('count_' + id).innerHTML = "0";
            name.innerHTML = "";
            count.innerHTML = "";
            image.src = "";
            for (let i = 0; i < data.data.length; i++) {
                if (data.data[i].id == id) {
                    data.data.splice(i, 1);
                }
            }
            selected = null;
        }
    } else {
        alert("Please select a card by clicking it.");
    }
}

document.getElementById('backPicker').addEventListener('change', function () {
    document.body.style.backgroundColor = this.value;
    data.bgColor = this.value;
});

document.getElementById('textPicker').addEventListener('change', function () {
    document.getElementById('main').style.color = this.value;
    data.textColor = this.value;
});

document.getElementById('boxPicker').addEventListener('change', function () {
    let color = this.value;
    data.boxColor = color;
    fix()
});

document.getElementById('borderPicker').addEventListener('change', function () {
    let color = this.value;
    data.boxBorder = color;
    fix()
});

document.getElementById('imageBorder').addEventListener('change', function () {
    let num = this.value;
    data.imageBorder = num;
    fix()
});

function fix() {
    if (data.audits == true) {
        auditTimeout = setTimeout(audit, (random(data.auditStats[2], data.auditStats[3])) * 1000)
    }
    document.getElementById('auditMin').value = data.auditStats[0]
    document.getElementById('auditMax').value = data.auditStats[1]
    document.getElementById('auditTimeMin').value = data.auditStats[2]
    document.getElementById('auditTimeMax').value = data.auditStats[3]

    if ((!data.fastest) && (data.fastest !== false)) {
        data.fastest = true;
    }
    if ((!data.slowest) && (data.slowest !== false)) {
        data.slowest = true;
    }
    if (!data.hideSettings) {
        data.hideSettings = 'q';
    }
    if (data.animation == true) {
        document.getElementById('animation').checked = true;
    } else {
        document.getElementById('animation').checked = false;
    }
    if (data.fastest == true) {
        document.getElementById('fastest').checked = true;
    } else {
        document.getElementById('fastest').checked = false;
    }
    if (data.slowest == true) {
        document.getElementById('slowest').checked = true;
    } else {
        document.getElementById('slowest').checked = false;
    }
    if (data.abbreviate == true) {
        document.getElementById('abbreviate').checked = true;
    } else {
        document.getElementById('abbreviate').checked = false;
    }
    if (data.offlineGains == true) {
        document.getElementById('offline').checked = true;
    } else {
        document.getElementById('offline').checked = false;
    }
    if (data.autosave == true) {
        document.getElementById('autosave').checked = true;
        saveInterval = setInterval(saveData2, 15000);
    } else {
        document.getElementById('autosave').checked = false;
    }
    document.getElementById('theme').value = data.theme;
    document.getElementById('setting').innerHTML = "Current: " + data.hideSettings + ""
    document.querySelectorAll('.card').forEach(function (card) {
        card.style.backgroundColor = data.boxColor;
        if (card.className.split(' ').includes("selected") == false) {
            card.style.border = "solid 1px " + data.boxBorder;
        }
    });
    document.querySelectorAll('.image').forEach(function (card) {
        card.style.borderRadius = data.imageBorder + "%";
    });
    document.getElementById('backPicker').value = convert3letterhexto6letters(data.bgColor);
    document.getElementById('textPicker').value = convert3letterhexto6letters(data.textColor);
    document.getElementById('boxPicker').value = convert3letterhexto6letters(data.boxColor);
    document.getElementById('borderPicker').value = convert3letterhexto6letters(data.boxBorder);
    document.getElementById('odometerUp').value = data.odometerUp;
    document.getElementById('odometerDown').value = data.odometerDown;
    document.getElementById('odometerSpeed').value = data.odometerSpeed;
    document.getElementById('imageBorder').value = data.imageBorder
    if (data.updateInterval) {
        document.getElementById('updateint').value = (data.updateInterval / 1000).toString()
    }
    document.getElementById('sort').value = data.sort;
    $('style').append(`.odometer.odometer-auto-theme.odometer-animating-up.odometer-animating .odometer-ribbon-inner, .odometer.odometer-theme-default.odometer-animating-up.odometer-animating .odometer-ribbon-inner {
        color: ${data.odometerUp};
        }`)
    $('style').append(`.odometer.odometer-auto-theme.odometer-animating-down.odometer-animating .odometer-ribbon-inner, .odometer.odometer-theme-default.odometer-animating-down.odometer-animating .odometer-ribbon-inner {
        color: ${data.odometerDown};
        }`)

    $('style').append(`.odometer.odometer-auto-theme.odometer-animating-up .odometer-ribbon-inner,
    .odometer.odometer-theme-default.odometer-animating-up .odometer-ribbon-inner {
        -webkit-transition: -webkit-transform ${data.odometerSpeed}s;
        -moz-transition: -moz-transform ${data.odometerSpeed}s;
        -ms-transition: -ms-transform ${data.odometerSpeed}s;
        -o-transition: -o-transform ${data.odometerSpeed}s;
        transition: transform ${data.odometerSpeed}s;
    }

    .odometer.odometer-auto-theme.odometer-animating-down.odometer-animating .odometer-ribbon-inner,
    .odometer.odometer-theme-default.odometer-animating-down.odometer-animating .odometer-ribbon-inner {
        -webkit-transition: -webkit-transform ${data.odometerSpeed}s;
        -moz-transition: -moz-transform ${data.odometerSpeed}s;
        -ms-transition: -ms-transform ${data.odometerSpeed}s;
        -o-transition: -o-transform ${data.odometerSpeed}s;
        transition: transform ${data.odometerSpeed}s;
    }`)
}

window.Odometer
function convert3letterhexto6letters(hex) {
    hex = hex.replace('#', '');
    if (hex.length == 3) {
        hex = "#" + hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    } else {
        hex = "#" + hex;
    }
    return hex;
}
let code = data.uuid
let connected = false;
if (window.location.href.includes('?code=')) {
    code = window.location.href.split('?code=')[1];
    connected = true;
}

function connect() {
    if (window.location.href.includes('?code=')) {
        window.location.href = window.location.href.split('?code=')[0];
    } else {
        saveData2()
        window.location.href = window.location.href + "?code=" + code;
    }
}
let update2Hold;
if (connected == true) {
    update2()
    update2Hold = setInterval(update2, 5000);
    document.getElementById('isconnected').innerHTML = "Yes";
    document.getElementById('toConnect').innerHTML = "Disconnect";
}

function update2() {
    if (!data.gain_min) {
        data.gain_min = -10000;
    }
    if (!data.gain_max) {
        data.gain_max = 10000;
    }
    fetch('https://fake-sub-count.sfmg.repl.co/' + code + '')
        .then(response => response.json())
        .then(json => {
            if (json.users) {
                if (json.users.length > 0) {
                    for (let i = 0; i < json.users.length; i++) {
                        let hasID = false;
                        for (let r = 0; r < data.data.length; r++) {
                            if (data.data[r].id == json.users[i].id) {
                                min = parseInt(json.users[i].min);
                                max = parseInt(json.users[i].max);
                                if (min > data.gain_max) {
                                    min = data.gain_max;
                                } else if (min < data.gain_min) {
                                    min = data.gain_min;
                                }
                                if (max > data.gain_max) {
                                    max = data.gain_max;
                                } else if (max < data.gain_min) {
                                    max = data.gain_min;
                                }
                                data.data[r].min_gain = min;
                                data.data[r].max_gain = max;
                                hasID = true;
                            }
                        }
                        if (hasID == false) {
                            fetch('https://mixerno.space/api/youtube-channel-counter/user/' + json.users[i].id + '')
                                .then(response => response.json())
                                .then(json2 => {
                                    let count = 0;
                                    let name = json2.user[0].count;
                                    let image = json2.user[1].count;
                                    let min = json.users[i].min;
                                    let max = json.users[i].max;
                                    if (min > data.gain_max) {
                                        min = data.gain_max;
                                    } else if (min < data.gain_min) {
                                        min = data.gain_min;
                                    }
                                    if (max > data.gain_max) {
                                        max = data.gain_max;
                                    } else if (max < data.gain_min) {
                                        max = data.gain_min;
                                    }
                                    let id = json.users[i].id
                                    data.data.push({
                                        "name": name,
                                        "count": parseFloat(count),
                                        "image": image,
                                        "min_gain": min,
                                        "max_gain": max,
                                        "id": id,
                                        "lastCount": 0
                                    });
                                    fix()
                                })
                        }
                    }
                }
                if (json.events.length > 0) {
                    for (let i = 0; i < json.events.length; i++) {
                        if (json.events[i].values) {
                            let id = json.events[i].id;
                            let min = parseFloat(json.events[i].values[0])
                            let max = parseFloat(json.events[i].values[1])
                            for (let i = 0; i < data.data.length; i++) {
                                if (data.data[i].id == id) {
                                    let num = Math.floor(Math.random() * (max - min + 1)) + min;
                                    data.data[i].count += num;
                                }
                            }
                        }
                    }
                }
            } else {
                alert("You are no longer connected.");
                clearInterval(update2Hold);
                document.getElementById('isconnected').innerHTML = "No";
                fetch('https://fake-sub-count.sfmg.repl.co/create?code=' + code + '', {
                    method: 'POST'
                })
                    .then(response => response.text())
                    .then(json => {
                        if (json == "done") {
                            saveData2()
                            location.reload();
                        }
                    })
            }
        });
}
document.getElementById('autosave').addEventListener('change', function () {
    if (document.getElementById('autosave').checked == true) {
        saveInterval = setInterval(saveData2, 15000);
        data.autosave = true;
    } else {
        clearInterval(saveInterval);
        data.autosave = false;
    }
})

document.getElementById('updateint').addEventListener('change', function () {
    let int = document.getElementById('updateint').value;
    if (isNaN(int)) {
        alert("Please enter a number.")
        return;
    }
    clearInterval(updateInterval);
    int = int * 1000;
    updateInterval = setInterval(update, int);
    data.updateInterval = int;
})

document.getElementById('min_gain_global').addEventListener('change', function () {
    let min = document.getElementById('min_gain_global').value;
    if (isNaN(min)) {
        alert("Please enter a number.")
        return;
    }
    data.gain_min = min;
});

document.getElementById('max_gain_global').addEventListener('change', function () {
    let max = document.getElementById('max_gain_global').value;
    if (isNaN(max)) {
        alert("Please enter a number.")
        return;
    }
    data.gain_max = max;
});

function custom() {
    let name = prompt("What is the command name?")
    let min = prompt("What is the minimum amount of subscribers the channel can gain?")
    if (isNaN(min)) {
        alert("Please enter a number.")
        return;
    }
    let max = prompt("What is the maximum amount of subscribers the channel can gain?")
    if (isNaN(max)) {
        alert("Please enter a number.")
        return;
    }
    alert('$(urlfetch https://Fake-Sub-Count.sfmg.repl.co/' + code + '/$(userid)?values=' + min + ',' + max + ')')
}

document.getElementById('connect').value = '$(urlfetch https://Fake-Sub-Count.sfmg.repl.co/' + code + '/$(userid)/$(query))';
document.getElementById('connect3').value = '$(urlfetch https://Fake-Sub-Count.sfmg.repl.co/' + code + '/$(userid)/$(query)?value=edit)';
document.getElementById('connect2').value = '$(urlfetch https://Fake-Sub-Count.sfmg.repl.co/' + code + '/$(userid)?values=10,20)';

document.getElementById('animation').addEventListener('click', function () {
    updateOdo()
})

function updateOdo() {
    if (document.getElementById('animation').checked == true) {
        data.animation = true;
        for (let i = 0; i < data.max; i++) {
            if (document.getElementsByClassName("card")[i]) {
                document.getElementsByClassName("card")[i].children[3].remove();
                let div = document.createElement("div");
                div.className = "count";
                div.id = "count" + i;
                if (data.data[i]) {
                    if (sequenceStuff.data) {
                        if (sequenceStuff.data[0].channels[i]) {
                            div.innerHTML = sequenceStuff.data[0].channels[i].count.toLocaleString();
                        } else {
                            div.innerHTML = data.data[i].count.toLocaleString();
                        }
                    } else {
                        if (data.data[i]) {
                            div.innerHTML = data.data[i].count.toLocaleString();
                        } else {
                            div.innerHTML = 0;
                        }
                    }
                } else {
                    div.innerHTML = 0;
                }
                document.getElementsByClassName("card")[i].appendChild(div);
                let count = 0;
                if (data.data[i]) {
                    if (sequenceStuff.data) {
                        if (sequenceStuff.data[0].channels[i]) {
                            count = sequenceStuff.data[0].channels[i].count;
                        } else {
                            count = 0;
                        }
                    } else {
                        count = data.data[i].count;
                    }
                } else {
                    count = 0;
                }
                if (data.abbreviate == true) {
                    if (data.data[i]) {
                        count = abb(data.data[i].count);
                    }
                }
                new Odometer({
                    el: document.getElementById("count" + i),
                    value: count,
                    format: '(,ddd)',
                    theme: 'default'
                })
            }
        }
    } else {
        data.animation = false;
        for (let i = 0; i < data.max; i++) {
            if (document.getElementsByClassName("card")[i]) {
                document.getElementsByClassName("card")[i].children[3].remove();
                let div = document.createElement("div");
                div.className = "count";
                div.id = "count" + i;
                if (data.data[i]) {
                    div.innerHTML = data.data[i].count.toLocaleString();
                } else {
                    div.innerHTML = 0;
                }
                document.getElementsByClassName("card")[i].appendChild(div);
                if (sequenceStuff.data) {
                    if (sequenceStuff.data[0].channels[i]) {
                        new Odometer({
                            el: document.getElementById("count" + i),
                            value: sequenceStuff.data[0].channels[i].count,
                            format: '(,ddd)',
                            theme: 'default',
                            animation: 'count'
                        })
                    } else {
                        new Odometer({
                            el: document.getElementById("count" + i),
                            value: 0,
                            format: '(,ddd)',
                            theme: 'default',
                            animation: 'count'
                        })
                    }
                } else {
                    if (data.data[i]) {
                        new Odometer({
                            el: document.getElementById("count" + i),
                            value: data.data[i].count,
                            format: '(,ddd)',
                            theme: 'default',
                            animation: 'count'
                        })
                    } else {
                        new Odometer({
                            el: document.getElementById("count" + i),
                            value: 0,
                            format: '(,ddd)',
                            theme: 'default',
                            animation: 'count'
                        })
                    }
                }
            }
        }
    }
}

document.getElementById('abbreviate').addEventListener('click', function () {
    if (document.getElementById('abbreviate').checked == true) {
        data.abbreviate = true;
    } else {
        data.abbreviate = false;
    }
})

document.getElementById('theme').addEventListener('change', function () {
    let theme = document.getElementById('theme').value;
    data.theme = theme;
    themeChanger();
})

function themeChanger() {
    if (confirm('Are you sure you want to change the theme?') == true) {
        clearInterval(updateInterval);
        clearInterval(auditTimeout);
        document.getElementById('main').innerHTML = "";
        initLoad('redo');
    }
}

document.getElementById('fastest').addEventListener('click', function () {
    if (document.getElementById('fastest').checked == true) {
        data.fastest = true;
    } else {
        data.fastest = false;
    }
})

document.getElementById('slowest').addEventListener('click', function () {
    if (document.getElementById('slowest').checked == true) {
        data.slowest = true;
    } else {
        data.slowest = false;
    }
})

let offlineInterval;

function offlineCheck() {
    data.lastOnline = new Date().getTime();
}

if (data.offlineGains == true) {
    document.getElementById('offline').checked = true;
    offlineInterval = setInterval(offlineCheck, 1000);
} else {
    document.getElementById('offline').checked = false;
}

document.getElementById('offline').addEventListener('click', function () {
    if (document.getElementById('offline').checked == true) {
        data.offlineGains = true;
        offlineInterval = setInterval(offlineCheck, 1000);
    } else {
        data.offlineGains = false;
        clearInterval(offlineInterval);
    }
})

document.getElementById('odometerUp').addEventListener('change', function () {
    let animation = document.getElementById('odometerUp').value;
    data.odometerUp = animation;
    fix()
})

document.getElementById('odometerDown').addEventListener('change', function () {
    let animation = document.getElementById('odometerDown').value;
    data.odometerDown = animation;
    fix()
})

document.getElementById('odometerSpeed').addEventListener('change', function () {
    data.odometerSpeed = document.getElementById('odometerSpeed').value;
    fix()
})

function hideSettings() {
    alert("Click what key you want after this alert.")
    document.addEventListener('keydown', function (e) {
        data.hideSettings = e.key;
        alert("Key set to " + e.key)
        document.getElementById('setting').innerHTML = "Current: " + e.key + ""
        this.removeEventListener('keydown', arguments.callee, false);
    })
}

document.addEventListener('keydown', function (e) {
    if (e.key == data.hideSettings) {
        if (document.getElementById('settings').style.display == "none") {
            document.getElementById('settings').style.display = "block";
        } else {
            document.getElementById('settings').style.display = "none";
        }
    }
})

function pause() {
    if (data.pause == false) {
        data.pause = true;
        document.getElementById('pauseB').innerHTML = "Resume"
        clearInterval(updateInterval);
    } else {
        data.pause = false;
        document.getElementById('pauseB').innerHTML = "Pause"
        updateInterval = setInterval(update, data.updateInterval);
        update()
    }
}

function randomGaussian(mean, stdev) {
    let a = 0, b = 0;
    while (!a) a = Math.random();
    while (!b) b = Math.random();
    return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b) * stdev + mean;
}

function create50dummychannels() {
    for (let i = 0; i < 50; i++) {
        data.data[i] = {
            name: "Channel " + i,
            count: Math.round(randomGaussian(1000, 100)),
            min_gain: 1,
            max_gain: 2,
            image: '../default.png',
            id: uuidGen()
        }
    }
}
let selectedChannels = [];
let sequence = { data: [] }
function newSequence() {
    pause();
    selectedChannels = [];
    sequence.name = prompt("Enter the name of the sequence")
    sequence.length = prompt("Enter the length of the sequence (in seconds)")
    if (!sequence.name) {
        sequence.name = "Untitled"
    }
    if (!sequence.length) {
        sequence.length = 30
    }
    makingSequence = true;
    alert('Select the channels you would like to be added to the sequence.\nPress enter when you are done.')
    document.addEventListener('keydown', function (e) {
        if (e.key == "Enter") {
            localStorage.setItem("data", JSON.stringify(data));
            document.getElementById('main').innerHTML = "";
            for (let q = 0; q < parseFloat(sequence.length); q++) {
                sequence.data[q] = {
                    channels: [],
                    time: q
                }
                for (let i = 0; i < selectedChannels.length; i++) {
                    if (q == 0) {
                        sequence.data[q].channels[i] = {
                            id: selectedChannels[i].split('_')[1],
                            count: getSubs(selectedChannels[i].split('_')[1]),
                            min_gain: getMinGain(selectedChannels[i].split('_')[1]),
                            max_gain: getMaxGain(selectedChannels[i].split('_')[1]),
                            manual: true,
                            name: getName(selectedChannels[i].split('_')[1]),
                            image: getImage(selectedChannels[i].split('_')[1])
                        }
                    } else {
                        sequence.data[q].channels[i] = {
                            id: selectedChannels[i].split('_')[1],
                            count: 0,
                            min_gain: getMinGain(selectedChannels[i].split('_')[1]),
                            max_gain: getMaxGain(selectedChannels[i].split('_')[1]),
                            manual: false,
                            name: getName(selectedChannels[i].split('_')[1]),
                            image: getImage(selectedChannels[i].split('_')[1])
                        }
                    }
                }
            }
            let newChannels = [];
            for (let mm = 0; mm < selectedChannels.length; mm++) {
                if (newChannels.includes("a_" + selectedChannels[mm].split('_')[1]) == false) {
                    newChannels.push("a_" + selectedChannels[mm].split('_')[1])
                }
            }
            selectedChannels = newChannels;
            for (let q = 0; q < data.data.length; q++) {
                for (let i = 0; i < selectedChannels.length; i++) {
                    if (selectedChannels[i].split('_')[1] == data.data[q].id) {
                        document.getElementById('main').innerHTML += `
                <div class="channel" id="channel_${data.data[q].id}" style="border: solid 1px #000; text-align: center;">
                    <div class="channelImage">
                        <img src="${data.data[q].image}" alt="Channel Image">
                    </div>
                    <div class="channelName">
                        <h1>${data.data[q].name}</h1>
                    </div>
                    <div class="channelCount">
                        <h1 id="count"><input id="count_${data.data[q].id}" style="font-size: 1vw;" value="${data.data[q].count}"></h1>
                    </div>
                    <div class="channelGain">
                        <h1 id="gain">Min Gain For Next Count: <input id="min_${data.data[q].id}" style="font-size: 1vw;" value="${data.data[q].min_gain}"></h1>
                        <h1 id="gain">Max Gain For Next Count: <input id="max_${data.data[q].id}" style="font-size: 1vw;" value="${data.data[q].max_gain}"></h1>
                    </div>
                </div>`
                    }
                }
            }
            for (let i = 0; i < selectedChannels.length; i++) {
                let id = selectedChannels[i].split('_')[1]
                document.getElementById(`count_${id}`).addEventListener('change', function () {
                    let time = parseFloat(document.getElementById("demo").innerHTML)
                    sequence.data[time].channels.forEach(item => {
                        if (item.id == id) {
                            item.count = parseFloat(document.getElementById(`count_${id}`).value)
                            return;
                        }
                    })
                })
                document.getElementById(`min_${id}`).addEventListener('change', function () {
                    let time = parseFloat(document.getElementById("demo").innerHTML - 1)
                    sequence.data[time].channels.forEach(item => {
                        if (item.id == id) {
                            item.min_gain = parseFloat(document.getElementById(`min_${id}`).value)
                            reloadSequenceValues(time)
                            return;
                        }
                    })
                })
                document.getElementById(`max_${id}`).addEventListener('change', function () {
                    let time = parseFloat(document.getElementById("demo").innerHTML - 1)
                    sequence.data[time].channels.forEach(item => {
                        if (item) {
                            if (item.id == id) {
                                item.max_gain = parseFloat(document.getElementById(`max_${id}`).value)
                                reloadSequenceValues(time)
                                return;
                            }
                        }
                    })
                })
            }
            document.getElementById('settings').innerHTML = `
                    <div class="slidecontainer">
                        <input type="range" min="1" max="${sequence.length}" value="0" class="slider" id="myRange">
                            <p>Value: <span id="demo"></span></p>
                        </div>
                        <br>
                        <button onclick="reloadSequenceValues2()">Reload counts/rates</button>
                        <button onclick="saveSeqeunce()">Save Seqeunce (will save in file)</button>
                    </div>
                `;
            var slider = document.getElementById("myRange");
            var output = document.getElementById("demo");
            output.innerHTML = slider.value;
            slider.oninput = function () {
                var time = parseFloat(this.value) - 1
                output.innerHTML = this.value;
                for (let i = 0; i < selectedChannels.length; i++) {
                    let id = selectedChannels[i].split('_')[1]
                    if (sequence.data[time]) {
                        if (sequence.data[time].channels[i].manual == false) {
                            if (sequence.data[time - 1].channels[i]) {
                                sequence.data[time - 1].channels[i].min_gain = parseFloat(document.getElementById(`min_${id}`).value)
                                sequence.data[time - 1].channels[i].max_gain = parseFloat(document.getElementById(`max_${id}`).value)
                                let newTotal = sequence.data[0].channels[i].count + mean(sequence.data[time - 1].channels[i].min_gain, sequence.data[time - 1].channels[i].max_gain) * time
                                document.getElementById(`count_${id}`).value = newTotal
                                sequence.data[time].channels[i].count = newTotal
                                sequence.data[time].channels[i].manual = true
                            } else {
                                alert('glitch lol')
                            }
                        } else {
                            document.getElementById(`count_${id}`).value = sequence.data[time].channels[i].count
                        }
                    }
                    document.getElementById(`min_${id}`).value = sequence.data[time].channels[i].min_gain
                    document.getElementById(`max_${id}`).value = sequence.data[time].channels[i].max_gain
                }
            }
        }
    })
}

async function reloadSequenceValues2() {
    let time = parseFloat(document.getElementById("demo").innerHTML)
    return await reloadSequenceValues(time)
}

function reloadSequenceValues(time) {
    console.log('reloaded')
    let max = parseFloat(document.getElementById("myRange").max)
    for (let i = 0; i < max; i++) {
        document.getElementById("myRange").value = i
    }
    document.getElementById("myRange").value = time + 1
    return 'done'
}

function selecterFunction2(e) {
    if (makingSequence == true) {
        if (e.target.id.includes("_")) {
            if (selectedChannels.includes(e.target.id)) {
                selectedChannels.splice(selectedChannels.indexOf(e.target.id), 1)
                document.getElementById('card_' + e.target.id.split("_")[1] + '').style.border = "solid 1px " + data.boxBorder + "";
            } else {
                selectedChannels.push(e.target.id)
                let id = e.target.id.split("_")[1];
                if (e.target.id.split("_").length > 2) {
                    for (let i = 2; i < e.target.id.split("_").length; i++) {
                        id = id + "_" + e.target.id.split("_")[i];
                    }
                }
                document.getElementById('card_' + id + '').style.border = "solid 1px blue";
            }
        }
    }
}

function getSubs(id) {
    for (let i = 0; i < data.data.length; i++) {
        if (data.data[i].id == id) {
            return data.data[i].count;
        }
    }
    return 0;
}

function getMinGain(id) {
    for (let i = 0; i < data.data.length; i++) {
        if (data.data[i].id == id) {
            return data.data[i].min_gain;
        }
    }
    return 0;
}

function getName(id) {
    for (let i = 0; i < data.data.length; i++) {
        if (data.data[i].id == id) {
            return data.data[i].name;
        }
    }
    return '';
}

function getImage(id) {
    for (let i = 0; i < data.data.length; i++) {
        if (data.data[i].id == id) {
            return data.data[i].image;
        }
    }
    return '../default.png';
}

function getMaxGain(id) {
    for (let i = 0; i < data.data.length; i++) {
        if (data.data[i].id == id) {
            return data.data[i].max_gain;
        }
    }
    return 0;
}

async function saveSeqeunce() {
    await reloadSequenceValues2()
    let data2 = JSON.stringify(sequence);
    let a = document.createElement('a');
    let file = new Blob([data2], { type: 'text/json' });
    a.href = URL.createObjectURL(file);
    a.download = 'sequenceData.json';
    a.click();
}

function line() {
    document.getElementById('main').innerHTML = ''
    document.getElementById('chart').style.height = '100vh'
    document.getElementById('chart').style.display = ''
    let names = []
    let datasets = []
    for (let i = 0; i < data.data.length; i++) {
        let color = randomColor()
        names.push(data.data[i].name)
        let dataset = {
            label: data.data[i].name,
            data: [data.data[i].count],
            fill: false,
            borderColor: color,
            tension: 0.1
        }
        datasets.push(dataset)
    }
    const ctx = document.getElementById('chart')
    const add = {
        labels: [new Date().toLocaleTimeString()],
        datasets: datasets
    };
    const config = {
        type: 'line',
        data: add,
    };
    chart = new Chart(ctx, config);
    data.visulization = 'line'
}

function randomColor() {
    let color = '#'
    for (let i = 0; i < 6; i++) {
        color += Math.floor(Math.random() * 16).toString(16)
    }
    return color
}

function loadSequence() {
    let file = document.getElementById('loadSequence').files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function () {
        data.visulization = 'sequence'
        sequenceStuff = JSON.parse(reader.result)
        document.getElementById('main').innerHTML = ''
        initLoad2()
    }
    reader.onerror = function () {
        alert('error')
    }
}

function mean(a, b) {
    return (a + b) / 2
}

function audit() {
    nextUpdateAudit = true;
    auditTimeout = setTimeout(audit, (random(data.auditStats[2], data.auditStats[3])) * 1000)
}

document.getElementById('auditMin').addEventListener('change', function () {
    data.auditStats[0] = parseFloat(document.getElementById('auditMin').value)
})

document.getElementById('auditMax').addEventListener('change', function () {
    data.auditStats[1] = parseFloat(document.getElementById('auditMax').value)
})

document.getElementById('auditTimeMin').addEventListener('change', function () {
    data.auditStats[2] = parseFloat(document.getElementById('auditTimeMin').value)
})

document.getElementById('auditTimeMax').addEventListener('change', function () {
    data.auditStats[3] = parseFloat(document.getElementById('auditTimeMax').value)
})

function audit2() {
    if (data.audits == false) {
        data.audits = true
        auditTimeout = setTimeout(audit, (random(data.auditStats[2], data.auditStats[3])) * 1000)
        document.getElementById('audit').innerHTML = "Disable Audits"
    } else {
        data.audits = false
        clearTimeout(auditTimeout)
        document.getElementById('audit').innerHTML = "Enable Audits"
    }
}

function apiUpdate(interval) {
    if (interval) {
        if (data.apiUpdates.enabled == false) {
            clearInterval(apiInterval)
            document.getElementById('enableApiUpdate').innerHTML = "Enable API Updates"
        }
    }
    let url = data.apiUpdates.url
    let groups = []
    let channels = ''
    for (let i = 0; i < data.data.length; i++) {
        channels += data.data[i].id + ','
    }
    channels = channels.slice(0, -1)
    if ((data.apiUpdates.maxChannelsPerFetch == 'one')) {
        groups = channels.split(',').map(function (item) {
            return [item];
        });
    } else if ((data.apiUpdates.maxChannelsPerFetch == 'ten')) {
        groups = channels.split(',').map(function (item, index) {
            return index % 10 === 0 ? channels.slice(index, index + 10) : null;
        }).filter(function (item) {
            return item;
        });
    } else if ((data.apiUpdates.maxChannelsPerFetch == 'twentyfive')) {
        groups = channels.split(',').map(function (item, index) {
            return index % 25 === 0 ? channels.slice(index, index + 25) : null;
        }).filter(function (item) {
            return item;
        });
    } else if ((data.apiUpdates.maxChannelsPerFetch == 'fifty')) {
        groups = channels.split(',').map(function (item, index) {
            return index % 50 === 0 ? channels.slice(index, index + 50) : null;
        }).filter(function (item) {
            return item;
        });
    } else if ((data.apiUpdates.maxChannelsPerFetch == 'onehundred')) {
        groups = channels.split(',').map(function (item, index) {
            return index % 100 === 0 ? channels.slice(index, index + 100) : null;
        }).filter(function (item) {
            return item;
        });
    }
    if (url.includes('{{channels}}')) {
        for (let i = 0; i < groups.length; i++) {
            let newUrl = url.replace('{{channels}}', groups[i])
            fetchNext(newUrl)
        }
    } else {
        for (let i = 0; i < groups.length; i++) {
            let newUrl = url + groups[i]
            fetchNext(newUrl)
        }
    }
    function fetchNext(url) {
        if (data.apiUpdates.method == 'GET') {
            fetch(url, {
                method: data.apiUpdates.method,
                headers: data.apiUpdates.headers
            }).then(response => response.json())
                .then(json => {
                    doStuff(json)
                })
        } else {
            fetch(url, {
                method: data.apiUpdates.method,
                headers: data.apiUpdates.headers,
                body: JSON.stringify(data.apiUpdates.body)
            }).then(response => response.json())
                .then(json => {
                    doStuff(json)
                })
        }
    }
    function doStuff(json) {
        let channels = json;
        if (data.apiUpdates.response.loop != 'data') {
            channels = channels[data.apiUpdates.response['loop'].split('data.')[1]]
        }
        for (let i = 0; i < channels.length; i++) {
            let nameUpdate = undefined
            let countUpdate = undefined
            let imageUpdate = undefined
            let idUpdate = undefined
            if (data.apiUpdates.response.name.enabled == true) {
                const propertyNames = data.apiUpdates.response.name.path.split('.')
                let result = channels[i];
                for (const propName of propertyNames) {
                    result = result[propName];
                }
                nameUpdate = result
            }
            if (data.apiUpdates.response.count.enabled == true) {
                const propertyNames = data.apiUpdates.response.count.path.split('.')
                let result = channels[i];
                for (const propName of propertyNames) {
                    result = result[propName];
                }
                countUpdate = result
            }
            if (data.apiUpdates.response.image.enabled == true) {
                const propertyNames = data.apiUpdates.response.image.path.split('.')
                let result = channels[i];
                for (const propName of propertyNames) {
                    result = result[propName];
                }
                imageUpdate = result
            }
            if (data.apiUpdates.response.id.enabled == true) {
                const propertyNames = data.apiUpdates.response.id.path.split('.')
                let result = channels[i];
                for (const propName of propertyNames) {
                    result = result[propName];
                }
                idUpdate = result
            }
            for (let r = 0; r < data.data.length; r++) {
                if (data.data[r].id == idUpdate) {
                    if (nameUpdate != undefined) {
                        data.data[r].name = nameUpdate
                    }
                    if (imageUpdate != undefined) {
                        data.data[r].image = imageUpdate
                    }
                    if (countUpdate != undefined) {
                        if (abb(countUpdate) != abb(data.data[r].count)) {
                            data.data[r].count = countUpdate
                        }
                    }
                }
            }
        }
    }
}

function enableApiUpdate() {
    clearInterval(apiInterval)
    if (data.apiUpdates.enabled == false) {
        data.apiUpdates.enabled = true
        document.getElementById('enableApiUpdate').innerHTML = "Disable API Updates"
        apiInterval = setInterval(function () {
            apiUpdate(true)
        }, data.apiUpdates.interval)
        apiUpdate(true)
    } else {
        data.apiUpdates.enabled = false
        document.getElementById('enableApiUpdate').innerHTML = "Enable API Updates"
    }
}

function saveAPIUpdates() {
    data.apiUpdates.url = document.getElementById('apiLink').value
    data.apiUpdates.maxChannelsPerFetch = (document.getElementById('apiType').value == 'none') ? 'one' : document.getElementById('apiType').value
    data.apiUpdates.method = document.getElementById('apiMethod').value
    let headers = document.getElementById('extraCred').value.toString().split(';&#10;').join(';\n').split(';\n')
    let newHeaders = {}
    for (let i = 0; i < headers.length; i++) {
        let header = headers[i].split(': ')
        newHeaders[header[0]] = header[1]
    }
    data.apiUpdates.headers = newHeaders
    let body = document.getElementById('body').value.toString().split(';&#10;').join(';\n').split(';\n')
    let newBody = {}
    for (let i = 0; i < body.length; i++) {
        let header = body[i].split(':')
        newBody[header[0]] = header[1]
    }
    data.apiUpdates.body = newBody
    data.apiUpdates.response = {
        'loop': document.getElementById('apiLoop').value,
        'name': {
            'enabled': document.getElementById('updateName').checked,
            'path': document.getElementById('pathName').value
        },
        'count': {
            'enabled': document.getElementById('updateCount').checked,
            'path': document.getElementById('pathCount').value
        },
        'image': {
            'enabled': document.getElementById('updateImage').checked,
            'path': document.getElementById('pathImage').value
        },
        'id': {
            'enabled': document.getElementById('updateID').checked,
            'path': document.getElementById('pathID').value
        }
    }
    data.apiUpdates.interval = parseFloat(document.getElementById('apiUpdateInt').value) * 1000
    data.apiUpdates.enabled = document.getElementById('enableApiUpdate').innerHTML == 'Disable API Updates' ? true : false
    alert('Saved!')
}

function loadAPIUpdates() {
    document.getElementById('apiLink').value = data.apiUpdates.url
    document.getElementById('apiType').value = data.apiUpdates.maxChannelsPerFetch
    document.getElementById('apiMethod').value = data.apiUpdates.method
    let headers = ''
    for (let i = 0; i < Object.keys(data.apiUpdates.headers).length; i++) {
        headers += Object.keys(data.apiUpdates.headers)[i] + ': ' + Object.values(data.apiUpdates.headers)[i] + ';\n'
    }
    document.getElementById('extraCred').value = headers
    let body = ''
    for (let i = 0; i < Object.keys(data.apiUpdates.body).length; i++) {
        body += Object.keys(data.apiUpdates.body)[i] + ': ' + Object.values(data.apiUpdates.body)[i] + ';\n'
    }
    document.getElementById('body').value = body
    document.getElementById('apiLoop').value = data.apiUpdates.response.loop
    document.getElementById('updateName').checked = data.apiUpdates.response.name.enabled
    document.getElementById('pathName').value = data.apiUpdates.response.name.path
    document.getElementById('updateCount').checked = data.apiUpdates.response.count.enabled
    document.getElementById('pathCount').value = data.apiUpdates.response.count.path
    document.getElementById('updateImage').checked = data.apiUpdates.response.image.enabled
    document.getElementById('pathImage').value = data.apiUpdates.response.image.path
    document.getElementById('updateID').checked = data.apiUpdates.response.id.enabled
    document.getElementById('pathID').value = data.apiUpdates.response.id.path
    document.getElementById('apiUpdateInt').value = data.apiUpdates.interval
    document.getElementById('enableApiUpdate').innerHTML = data.apiUpdates.enabled == true ? 'Disable API Updates' : 'Enable API Updates'
}
loadAPIUpdates()
