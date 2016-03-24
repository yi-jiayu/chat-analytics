"use strict";

const extend = require('extend');

let chatAnalytics = {visualisation: {}};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayTicks = [
    {v: 6, f: 'Sunday'},
    {v: 5, f: 'Monday'},
    {v: 4, f: 'Tuesday'},
    {v: 3, f: 'Wednesday'},
    {v: 2, f: 'Thursday'},
    {v: 1, f: 'Friday'},
    {v: 0, f: 'Saturday'}
];
const hourTicks = initialiseHourTicks();

function initialiseHourTicks() {
    let hourTicks = [];
    hourTicks.push({v: 0, f: '12a'});
    for (let i = 1; i < 12; i++) hourTicks.push({v: i, f: '' + i + 'a'});
    hourTicks.push({v: 12, f: '12p'});
    for (let i = 1; i < 12; i++) hourTicks.push({v: i + 12, f: '' + i + 'p'});
    return hourTicks;
}

/**
 * Wrapper around a google.visualization.BubbleChart to generate a punch card visualisation
 * @param container
 * @constructor
 */
chatAnalytics.visualisation.PunchCard = function (container) {
    this.containerElement = container;
    this.wrapper = new google.visualization.ChartWrapper({
        chartType: 'BubbleChart',
        containerId: this.containerElement.id
    });
};

/**
 * Transforms a google.visualization.DataTable with 3 columns, timestamp (datetime), sender (string) and text (string)
 * into one with 5 columns, ID (string), X (number), Y (number), series (string) and messages (number) for a punch card
 * visualisation.
 * @param data {google.visualization.DataTable}
 * @param options - currently just takes one property, title
 */
chatAnalytics.visualisation.PunchCard.prototype.draw = function (data, options) {
    // create new DataTable
    let newDataTable = [[
        {label: 'ID', type: 'string'},
        {label: 'X', type: 'number'},
        {label: 'Y', type: 'number'},
        {label: 'series', type: 'string'},
        {label: 'messages', type: 'number'}
    ]];

    if (data.getNumberOfRows() === 1) {
        newDataTable.push(['0', 0, 0, 'no', 0]);
    } else {
        let daysHoursArray = [];

        // initialise daysHoursArray
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 24; j++) {
                daysHoursArray.push([i, j, 0]);
            }
        }

        // populate daysHoursArray
        for (let i = 0; i < data.getNumberOfRows(); i++) {
            let timestamp = new Date(data.getValue(i, 0));
            let day = timestamp.getDay();
            let hour = timestamp.getHours();
            daysHoursArray[day * 24 + hour][2]++;
        }

        for (let elem of daysHoursArray) {
            if (elem[2] > 0) newDataTable.push([`${DAYS[elem[0]]}`, elem[1], 6 - elem[0], '', elem[2]]);
        }
        newDataTable = google.visualization.arrayToDataTable(newDataTable);
    }

    let defaultOptions = {
        hAxis: {
            gridlines: {color: 'transparent'},
            maxValue: 24,
            minValue: -1,
            ticks: hourTicks,
            textStyle: {color: '#666'},
            baseline: -1
        },
        vAxis: {gridlines: {color: 'transparent'}, maxValue: 7, minValue: 0, ticks: dayTicks, baseline: -1},
        bubble: {textStyle: {fontSize: 11, color: 'none', auraColor: 'none'}, stroke: 'transparent'},
        series: {
            '': {color: 'black', visibleInLegend: false},
            'no': {color: 'transparent', visibleInLegend: false}
        },
        sizeAxis: {minSize: 0},
        legend: {position: 'none'},
        axisTitlesPosition: 'none',
        chartArea: {left: '10%', top: '10%', height: '80%', width: '80%'}
    };

    options = extend(true, defaultOptions, options);

    this.wrapper.setDataTable(newDataTable);
    this.wrapper.setOptions(options);

    this.wrapper.draw();

    google.visualization.events.trigger(this, 'ready');
};

/**
 * Alias for method in wrapped chart
 */
chatAnalytics.visualisation.PunchCard.prototype.getImageURI = function () {
    return this.wrapper.getChart().getImageURI();
};

/**
 * Wrapper around a google.visualisation.Histogram to generate a message frequency histogram
 * @param container
 * @constructor
 */
chatAnalytics.visualisation.Histogram = function (container) {
    this.containerElement = container;
    this.wrapper = new google.visualization.ChartWrapper({
        chartType: 'Histogram',
        containerId: this.containerElement.id
    });
};

chatAnalytics.visualisation.Histogram.prototype.draw = function (data, options) {
    data = new google.visualization.DataView(data);
    data.hideColumns([1, 2]);
};

module.exports = chatAnalytics.visualisation;

// temporary assignment to global scope for testing
window.chatAnalytics = chatAnalytics;
