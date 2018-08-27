var Tools = /** @class */ (function () {
    function Tools() {
    }
    Tools.addOption = function (elSel, text, value) {
        var elOptNew = document.createElement('option');
        elOptNew.text = text;
        elOptNew.value = value;
        elSel.appendChild(elOptNew);
    };
    Tools.removeOptionSelected = function (selectId) {
        var elSel = document.getElementById(selectId);
        var i;
        var arr = new Array();
        for (i = elSel.length - 1; i >= 0; i--) {
            if (elSel.options[i].selected) {
                arr.push(i);
                //        elSel.remove(i);
            }
        }
        for (var temp = 0; temp < arr.length; temp++)
            elSel.remove(arr[temp]);
    };
    Tools.removeAllOptions = function (selectId) {
        var elSel = document.getElementById(selectId);
        while (elSel.length > 0)
            elSel.remove(elSel.length - 1);
    };
    Tools.selectAllOptions = function (selectId) {
        var sel = document.getElementById(selectId);
        for (var temp = 0; temp < sel.length; temp++)
            sel.options[temp].selected = true;
    };
    Tools.gup = function (name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results == null)
            return "";
        else
            return results[1];
    };
    //  static publishCommand = "/usr/bin/node /var/www/html/nodes/publishphoto/Server.js";
    //  static urlToNode = "https://nabu.usit.uio.no/unifotonode/";
    Tools.urlToNode = "http://itfds-utv01.uio.no/postgres/";
    Tools.publishCommand = "/usr/bin/node /var/www/html/morten/publishphoto/Server.js";
    return Tools;
}());
