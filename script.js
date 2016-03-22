"use strict";

var matches = [];
var timestamps = [];
var dataArray = [];
var googleDataArray = [['ID', 'Hour', 'Day', 'Series', 'Messages'], ['0', 1, 1, 'no', 0]];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
} else {
    alert('The File APIs are not fully supported in this browser.');
}

document.querySelector('#files').addEventListener('change', handleFileSelect, false);

class WhatsAppTimestamp {

    constructor(datestring) {
        const re = /^(\d+)\/(\d+)\/(\d+) (\d+):(\d+):(\d+) ((?:AM|PM))/;
        let match = re.exec(datestring);
        let day = Number(match[1]);
        let month = Number(match[2]);
        let year = Number(match[3]);
        let hour = Number(match[4]);
        let minutes = Number(match[5]);
        let ampm = match[7];
        if (ampm == 'PM') hour += 12;

        this.date = new Date(year, month, day, hour, minutes);
        this.day = this.date.getDay();
        this.hour = this.date.getHours();
    }
}

function handleFileSelect(evt) {
    var files = evt.target.files;
    var chatHistory = files[0];

    var reader = new FileReader();
    matches = [];
    timestamps = [];
    dataArray = [];
    googleDataArray = [['ID', 'Hour', 'Day', 'Series', 'Messages']];

    reader.readAsText(chatHistory);

    var re = /^(\d+\/\d+\/\d+ \d+:\d+:\d+ (?:AM|PM)): (.*?): ([\s\S]*?)(?=\n^\d+\/\d+\/\d+ \d+:\d+:\d+ (?:AM|PM))/gm;

    reader.onload = function (event) {
        var match = '';
        while (match != null) {
            match = re.exec(event.target.result);
            if (match != null) {
                timestamps.push(new WhatsAppTimestamp(match[1]));
                matches.push(match);
            }
        }

        initialiseDataArray();
        populateDataArray();
        formatDataArray();
        drawSeriesChart();
    };
}

function initialiseDataArray() {
    for (var i = 0; i < 7; i++) {
        for (var j = 0; j < 24; j++) {
            dataArray.push([i, j, 0]);
        }
    }
}

function populateDataArray() {
    for (var i = 0; i < timestamps.length; i++) {
        var obj = timestamps[i];
        dataArray[obj.day * 24 + obj.hour][2]++;
    }
}

function formatDataArray() {
    for (var i = 0; i < dataArray.length; i++) {
        var obj = dataArray[i];
        if (obj[2] != 0) googleDataArray.push(['' + DAYS[obj[0]] + ' ' + timeTicks[obj[1]].f, obj[1] + 1, obj[0] + 1, '', obj[2]])
    }
}
