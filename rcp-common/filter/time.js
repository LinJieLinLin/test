angular.module('RCP').filter('time', function () {
    return function (text) {
        if (typeof text !== 'number') {
            return text;
        }
        var d = new Date(text);
        var year = d.getFullYear();
        var month = d.getMonth() + 1;
        month = month > 9 ? month : '0' + month;
        var day = d.getDate();
        day = day > 9 ? day : '0' + day;
        var hour = d.getHours();
        hour = hour > 9 ? hour : '0' + hour;
        var minute = d.getMinutes();
        minute = minute > 9 ? minute : '0' + minute;

        return [year, month, day].join('-') + ' ' + [hour, minute].join(':');
    };
});