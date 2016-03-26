"use strict";

var googleDataArray = [[
    {label: 'timestamp', type: 'datetime'},
    {label: 'sender', type: 'string'},
    {label: 'message', type: 'string'}]];

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
    }
}

function handleFileSelect(evt) {
    // reset data
    googleDataArray = [[
        {label: 'timestamp', type: 'datetime'},
        {label: 'sender', type: 'string'},
        {label: 'message', type: 'string'}]];

    var files = evt.target.files;
    var chatHistory = files[0];

    var reader = new FileReader();

    reader.readAsText(chatHistory);

    var re = /^(\d+\/\d+\/\d+,? \d+:\d+(?::\d+)?(?: (?:AM|PM|am|pm)?:| -)) (.*?): ([\s\S]*?)(?=^\d+\/\d+\/\d+,? \d+:\d+(?::\d+)?(?: (?:AM|PM|am|pm)?:| -) (.*?):)/gm;

    reader.onload = function (event) {
        var match = '';
        while (match != null) {
            match = re.exec(event.target.result);
            if (match != null) {
                googleDataArray.push([new WhatsAppTimestamp(match[1]).date, match[2], match[3]]);
            }
        }

        if (googleDataArray.length == 2) {
            alert('Oops, it looks like this file is probably not a whatsapp conversation.');
            return;
        }

        binned = chatAnalytics.util.createMessageFreqTable(google.visualization.arrayToDataTable(googleDataArray));
        console.log(binned);
    };
}

var chatAnalytics = {util: {}};

chatAnalytics.util.createMessageFreqTable = function (data) {
    let participants = data.getDistinctValues(1);
    let numRows = data.getNumberOfRows();

    let msgFreqTable = [[
        {label: 'timestamp', type: 'datetime'}
        // , {label: 'total message count', type: 'number'}
    ]];

    data.sort(0);

    for (let participant of participants) {
        msgFreqTable[0].push({label: participant, type: 'number'});
    }

    let Row = function () {
        this.timestamp = null;
        // this.totalMsgCount = 0;
        for (let participant of participants) this[participant] = 0;
    };

    Row.prototype.toArray = function () {
        let arr = [];
        arr.push(this.timestamp
            // , this.totalMsgCount
        );
        for (let participant of participants) arr.push(this[participant]);
        return arr;
    };

    let minute = null;
    let currRow;

    for (var i = 0; i < numRows; i++) {
        let timestamp = new Date(data.getValue(i, 0));
        let sender = data.getValue(i, 1);
        if (timestamp.getDate() != minute) {
            minute = timestamp.getDate();
            if (currRow) {
                msgFreqTable.push(currRow.toArray());
                console.log(currRow);
            }
            currRow = new Row();
            let day = new Date(timestamp.getFullYear(), timestamp.getMonth() + 1, timestamp.getDate());
            currRow.timestamp = day;
            // currRow.totalMsgCount = 1;
            currRow[sender] = 1;
        } else {
            // currRow.totalMsgCount++;
            currRow[sender]++;
        }
    }

    msgFreqTable.push(currRow.toArray());

    let retVar = google.visualization.arrayToDataTable(msgFreqTable);
    retVar.sort(0);
    return retVar;
};
