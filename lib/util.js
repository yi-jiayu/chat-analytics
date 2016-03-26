"use strict";

var chatAnalytics = {util: {}};

chatAnalytics.util.binTimestampsIntoHours = function () {

};


/**
 * Converts a DataTable with 3 columns: timestamp (datetime), sender (string), message (string)
 * to a new DataTable with n columns: timestamp (datetime), total message count (number),
 * participant1 message count (number) ... participantN message count (number)
 * @param data {google.visualization.DataTable}
 */
chatAnalytics.util.createMessageFreqTable = function (data) {
    let participants = data.getDistinctValues(1);
    let numRows = data.getNumberOfRows();

    let msgFreqTable = [[
        {label: 'timestamp', type: 'datetime'},
        {label: 'total message count', type: 'number'}
    ]];

    for (let participant of participants) {
        msgFreqTable[0].push({label: participant, type: 'number'});
    }

    let Row = function () {
        this.timestamp = null;
        this.totalMsgCount = 0;
        for (let participant of participants) this[participant] = 0;
    };

    Row.prototype.toArray = function () {
        let arr = [];
        arr.push(this.timestamp, this.totalMsgCount);
        for (let participant of participants) arr.push(this[participant]);
        return arr;
    };

    let minute = null;
    let currRow;

    for (var i = 0; i < numRows; i++) {
        let timestamp = new Date(data.getValue(i, 0));
        let sender = data.getValue(i, 1);
        if (timestamp.getMinutes() != minute) {
            minute = timestamp.getMinutes();
            if (currRow) msgFreqTable.push(currRow.toArray());
            currRow = new Row();
            currRow.timestamp = timestamp;
            currRow.totalMsgCount = 1;
            currRow[sender] = 1;
        } else {
            currRow.totalMsgCount++;
            currRow[sender]++;
        }
    }
    
    msgFreqTable.push(currRow.toArray());

    return msgFreqTable;
};