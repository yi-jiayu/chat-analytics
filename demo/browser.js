(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"extend":2}],2:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}]},{},[1]);
