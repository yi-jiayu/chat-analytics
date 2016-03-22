"use strict";

var chatAnalytics = chatAnalytics || {visualisation: {}};

chatAnalytics.visualisation.PunchCard = function (container) {
    this.containerElement = container;
};

// column 0 will be a datetime (message timestamp)
// column 1 will be a string (sender)
// column 2 will be a string (message content)
chatAnalytics.visualisation.PunchCard.prototype.draw = function (data, options) {
    
};