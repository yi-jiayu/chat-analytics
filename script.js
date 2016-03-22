"use strict";

var messages = [];
var timestamps = [];
var dataArray = [];
var googleDataArray = [['ID', 'Hour', 'Day', 'Series', 'Messages'], ['0', 0, 0, 'no', 0]];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
} else {
    alert('The File APIs are not fully supported in this browser.');
}

document.querySelector('#files').addEventListener('change', handleFileSelect, false);

class WhatsAppTimestamp {
    constructor(datestring) {
        const re = /^(\d+)\/(\d+)\/(\d+),? (\d+):(\d+)(?::\d+)? (AM|PM|am|pm)?/;
        let match = re.exec(datestring);
        let day = Number(match[1]);
        let month = Number(match[2]);
        let year = Number(match[3]);
        let hour = Number(match[4]);
        let minutes = Number(match[5]);
        let ampm = match[6];
        if (ampm && /PM|pm/.test(match[6])) hour += 12;

        this.date = new Date(year, month, day, hour, minutes);
        this.day = this.date.getDay();
        this.hour = this.date.getHours();
    }
}

class WhatsAppMessage {
    constructor(match) {
        this.date = new WhatsAppTimestamp(match[1]).date;
        this.sender = match[2];
        this.text = match[3];
    }
}

function handleFileSelect(evt) {
    var files = evt.target.files;
    var chatHistory = files[0];

    var reader = new FileReader();
    messages = [];
    timestamps = [];
    dataArray = [];
    googleDataArray = [['ID', 'Hour', 'Day', 'Series', 'Messages']];

    reader.readAsText(chatHistory);

    var re = /^(\d+\/\d+\/\d+,? \d+:\d+(?::\d+)?(?: (?:AM|PM|am|pm)?:| -)) (.*?): ([\s\S]*?)(?=^\d+\/\d+\/\d+,? \d+:\d+(?::\d+)?(?: (?:AM|PM|am|pm)?:| -) (.*?):)/gm;

    reader.onload = function (event) {
        var match = '';
        while (match != null) {
            match = re.exec(event.target.result);
            if (match != null) {
                messages.push(new WhatsAppMessage(match));
                timestamps.push(new WhatsAppTimestamp(match[1]));
            }
        }

        if (messages.length == 0) {
            alert('Oops, it looks like this file is probably not a whatsapp conversation.');
            return;
        }

        initialiseDataArray();
        populateDataArray();
        formatDataArray();
        drawSeriesChart(`${evt.target.files[0].name.replace('.txt', '')} (${messages.length + 1} messages)`);
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
        googleDataArray.push(['' + DAYS[obj[0]] + ' ' + timeTicks[obj[1]].f, obj[1], 6 - obj[0], '', obj[2]]);
    }
}