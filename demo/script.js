"use strict";

var googleDataArray = [[
    {label: 'timestamp', type: 'datetime'},
    {label: 'sender', type: 'string'},
    {label: 'message', type: 'string'}],
    [new Date(), '', '']
];

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
        {label: 'message', type: 'string'}],
        [new Date(), '', '']
    ];

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

        chatName = evt.target.files[0].name.replace('.txt', '');
        title = `${chatName} (${googleDataArray.length - 1} messages)`;
        drawDashboard();
    };
}
