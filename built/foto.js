var wheelInstance2 = null;
var wheelInstance3 = null;
var wheelInstance4 = null;
var wheelInstance5 = null;
var elastic = null;
//import ElasticClass = require("./ElasticClass");
var id = 2;
var doc;
var eventIndex = -1;
var eventArray = null;
var photoArray = null;
var photoEventIndex = 0;
var tools;
var elasticLinks = null;
var importQuery = "";
var artifactPos = 0;
var noSearchList = false;
var spaceSplitter = new RegExp("([\\s]+)", "g");
var user = "";
var docArray = null;
var docIndex = -1;
var changed = false;
//var defaultTerm = JSON.parse
//og her er den samme funktion i gjenstand.ts
var nameListQuery = {
    "tags": {
        "terms": {
            "field": "persondata",
            "include": ""
        }
    }
};
var fotoListQuery = {
    "tags": {
        "terms": {
            "field": "fotograf",
            "include": ""
        }
    }
};
var placeListQuery = {
    "tags": {
        "terms": {
            "field": "stedListe",
            "include": ""
        }
    }
};
var wordListQuery = {
    "tags": {
        "terms": {
            "field": "tema",
            "include": ""
        }
    }
};
var objectKeys = {
    "dokId": {
        "type": "integer"
    },
    "alledata": {
        "type": "text",
        "fielddata": true,
        "analyzer": "standard"
    },
    "persondata": {
        "type": "keyword",
        "store": true
    },
    "foto_kort_id": {
        "type": "integer",
        "store": true
    },
    "fra_År": {
        "type": "integer"
    },
    "til_År": {
        "type": "integer"
    },
    "datering_fra": {
        "type": "keyword",
        "store": true
    },
    "datering_til": {
        "type": "keyword",
        "store": true
    },
    "sted": {
        "type": "text",
        "analyzer": "norwegian"
    },
    "motiv": {
        "type": "text",
        "analyzer": "norwegian"
    },
    "stedkommentar": {
        "type": "text",
        "analyzer": "norwegian"
    },
    "tema": {
        "type": "keyword",
        "store": true
    },
    "mediagruppe_enhets_id": {
        "type": "integer"
    },
    "datering_dato": {
        "type": "date",
        "format": "dd.MM.yyyy",
        "store": true
    },
    "fotograf": {
        "type": "text",
        "analyzer": "norwegian"
    },
    "annen_info": {
        "type": "text",
        "analyzer": "norwegian"
    },
    "kan_webpubliseres": {
        "type": "keyword",
        "store": true
    },
    /* "filnavn": {
       "type": "keyword",
       "store": true
     },*/
    "sjanger": {
        "type": "keyword",
        "store": true
    }
};
function getRemote(remote_url) {
    return $.ajax({
        type: "GET",
        url: remote_url,
        async: false,
    }).responseText;
}
String.prototype.endsWith = function (pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
};
function stringEmpty(str) {
    return (!str || 0 === str.length);
}
function currentDate() {
    var d = new Date();
    var st = d.toISOString();
    var pos = st.indexOf("T");
    return (st.substring(0, pos));
}
function getUser() {
    user = getRemote("getUser.php");
    return user;
}
function createFotokortQuery() {
    var d = JSON.parse("{\"must\":[]}");
    var defaultObj = JsonTool.createJsonPath("query");
    defaultObj.query.bool = d;
    var query = JsonTool.cloneJSON(defaultObj);
    var ob;
    var f = new Object();
    ob = new Object();
    var urlId = Tools.gup("id");
    if (urlId != "")
        id = parseInt(urlId);
    f.foto_kort_id = id;
    ob.match = f;
    query.query.bool.must.push(ob);
    return query;
}
function initialize() {
    $(document).ready(function () {
        // do jQuery
    });
    currentDate();
    var query = JSON.parse(sessionStorage.getItem("query"));
    if (query == null || query == "")
        query = createFotokortQuery();
    var source = JSON.parse("[\"foto_kort_id\"]");
    query._source = source;
    query.size = 50000;
    query.from = 0;
    var formData = {};
    formData.resturl = "unifotobase/billede/_search";
    //  formData.elasticdata = JSON.stringify(query);
    formData.elasticdata = query;
    document.getElementById('tagline').innerHTML = "Loading.....";
    postPhp(formData, continueUpload);
}
function continueUpload(data) {
    sessionStorage.setItem("query", null);
    docArray = new Array();
    for (var temp = 0; temp < data.hits.hits.length; temp++)
        docArray.push(data.hits.hits[temp]._source.foto_kort_id);
    tools = new Tools();
    var urlId = Tools.gup("id");
    if (urlId != "")
        id = parseInt(urlId);
    for (var temp = 0; temp < docArray.length; temp++) {
        if (docArray[temp] == id) {
            docIndex = temp;
            break;
        }
    }
    var formData = {};
    formData.elasticdata = new Object();
    formData.resturl = "unifotobase/billede/_search?q=foto_kort_id:" + id + "&";
    placeFooter();
    postPhp(formData, loadContent);
    wheelInstance2 = new Wheel('wheelInstance2', 'wordwheel_div', 'ul', 'lookupIndex2', 'topicId');
    wheelInstance3 = new Wheel('wheelInstance3', 'wheel2', 'ul2', 'lookupIndex3', 'namesId');
    wheelInstance4 = new Wheel('wheelInstance4', 'wheel4', 'ul4', 'lookupIndex4', 'stedListeId');
    document.getElementById('tagline').innerHTML = "";
    resize2();
}
function lookupIndex2(string) {
    document.getElementById('topicId').value = string;
    wheelInstance2.hideOverlay();
    // addTopic();
}
function lookupIndex3(string) {
    document.getElementById('namesId').value = string;
    wheelInstance3.hideOverlay();
    //  addName();
}
function lookupIndex4(string) {
    document.getElementById('stedListeId').value = string;
    wheelInstance4.hideOverlay();
    //  addName();
}
function addName() {
    var str = document.getElementById('namesId').value;
    var sel = document.getElementById("nameSelect");
    for (var temp = 0; temp < sel.length; temp++)
        if (sel.options[temp].value == str) {
            document.getElementById('namesId').value = "";
            return;
        }
    Tools.addOption(sel, str, str);
    document.getElementById('namesId').value = "";
    changed = true;
}
function deleteName() {
    Tools.removeOptionSelected("nameSelect");
    changed = true;
}
function addTopic() {
    var str = document.getElementById('topicId').value;
    var sel = document.getElementById("topicSelect");
    for (var temp = 0; temp < sel.length; temp++)
        if (sel.options[temp].value == str) {
            document.getElementById('topicId').value = "";
            return;
        }
    Tools.addOption(sel, str, str);
    document.getElementById('topicId').value = "";
    changed = true;
}
function deleteTopic() {
    Tools.removeOptionSelected("topicSelect");
    changed = true;
}
function postPhp(formData, callBack) {
    $.ajax({
        url: Tools.urlToNode + "PassPost",
        type: 'post',
        data: formData,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
        },
        success: function (data) {
            callBack(data);
        },
        dataType: "json"
    });
}
/*function postPhp(formData, callBack) {
  $.ajax({
    url: "http://itfds-prod03.uio.no/elasticapi/"+formData.resturl,
    type: 'post',
    data: formData.elasticdata,
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
    },
    success: function (data) {
      callBack(data);
    },
    dataType: "json"
  });
}
*/
function postAndGetPhp(formData, callBack) {
    $.ajax({
        url: "postandget.php",
        type: 'post',
        data: formData,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
        },
        success: function (data) {
            callBack(data);
        },
        dataType: "json"
    });
}
function insertContentIntoTable(tableId, label, content, label_result) {
    if (content == "")
        return;
    var table = document.getElementById(tableId);
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    cell1.setAttribute("class", "label"); //For Most Browsers
    cell1.setAttribute("className", "label");
    cell1.innerHTML = label;
    var row2 = table.insertRow(-1);
    var cell2 = row2.insertCell(0);
    cell2.setAttribute("class", label_result); //For Most Browsers
    cell2.setAttribute("className", label_result);
    cell2.innerHTML = content;
    var row3 = table.insertRow(-1);
    var cell3 = row3.insertCell(0);
    cell3.innerHTML = "<td>&nbsp;</td>";
}
function insertDescriptionInTable(tableId, label, content, label_result) {
    if (content == "")
        return;
    var table = document.getElementById(tableId);
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    cell1.setAttribute("class", "label"); //For Most Browsers
    cell1.setAttribute("className", "label");
    cell1.innerHTML = label;
    var row2 = table.insertRow(-1);
    var cell2 = row2.insertCell(0);
    cell2.innerHTML = "<div id='descriptionDiv' style='height:280px;overflow:auto;text-align:left;'>" + content + "</div>";
    var row3 = table.insertRow(-1);
    var cell3 = row3.insertCell(0);
    cell3.innerHTML = "<td>&nbsp;</td>";
}
function loadContent(data) {
    elastic = new ElasticClass(data);
    var docs = elastic.getDocs();
    if (elastic.getDocCount() > 0)
        doc = docs[0];
    insertFields();
    changed = false;
}
function clearFields() {
    document.getElementById('stedListeId').value = "";
    document.getElementById('stedkommentar').value = "";
    document.getElementById('motivId').value = "";
    document.getElementById('infoId').value = "";
    document.getElementById('internKommentar').value = "";
    Tools.removeAllOptions("topicSelect");
    Tools.removeAllOptions("nameSelect");
    Tools.removeAllOptions("koblingSelect");
    document.getElementById('fromYearId').value = "";
    document.getElementById('toYearId').value = "";
    document.getElementById('registeredYearId').value = "";
    document.getElementById('foto_kort_id').value = "";
    document.getElementById('mediagruppe_enhets_id').value = "";
    document.getElementById('filnavn').value = "";
    document.getElementById('sjangerSelect').value = "";
    document.getElementById('registrert_dato').value = "";
    document.getElementById('brukerId').value = "";
}
function insertFields() {
    clearFields();
    document.getElementById('stedListeId').value = elastic.getSingleFieldFromDoc(doc, "stedListe");
    document.getElementById('stedkommentar').value = elastic.getSingleFieldFromDoc(doc, "stedkommentar");
    document.getElementById('motivId').value = elastic.getSingleFieldFromDoc(doc, "motiv");
    document.getElementById('infoId').value = elastic.getSingleFieldFromDoc(doc, "annen_info");
    //  (<any>document.getElementById('eksternKommentar')).value = elastic.getSingleFieldFromDoc(doc, "eksternKommentar");
    document.getElementById('internKommentar').value = elastic.getSingleFieldFromDoc(doc, "internKommentar");
    var arr = elastic.getArrayFromDoc(doc, "tema");
    var elSel = document.getElementById('topicSelect');
    for (var temp = 0; temp < arr.length; temp++) {
        Tools.addOption(elSel, arr[temp], arr[temp]);
    }
    arr = elastic.getArrayFromDoc(doc, "koblinger");
    elSel = document.getElementById('koblingSelect');
    for (var temp = 0; temp < arr.length; temp++) {
        Tools.addOption(elSel, arr[temp], arr[temp]);
    }
    64;
    arr = elastic.getArrayFromDoc(doc, "persondata");
    elSel = document.getElementById('nameSelect');
    for (var temp = 0; temp < arr.length; temp++) {
        Tools.addOption(elSel, arr[temp], arr[temp]);
    }
    document.getElementById('fromYearId').value = elastic.getSingleFieldFromDoc(doc, "datering_fra");
    document.getElementById('toYearId').value = elastic.getSingleFieldFromDoc(doc, "datering_til");
    document.getElementById('registeredYearId').value = elastic.getSingleFieldFromDoc(doc, "datering_dato");
    if (elastic.getSingleFieldFromDoc(doc, "old_foto_kort_id") == 0)
        document.getElementById('foto_kort_id').value = elastic.getSingleFieldFromDoc(doc, "foto_kort_id");
    else
        document.getElementById('foto_kort_id').value = elastic.getSingleFieldFromDoc(doc, "foto_kort_id") + " (" + elastic.getSingleFieldFromDoc(doc, "old_foto_kort_id") + ")";
    document.getElementById('mediagruppe_enhets_id').value = elastic.getSingleFieldFromDoc(doc, "mediagruppe_enhets_id");
    document.getElementById('filnavn').value = elastic.getSingleFieldFromDoc(doc, "filnavn");
    document.getElementById('kan_webpubliseres').value = elastic.getSingleFieldFromDoc(doc, "kan_webpubliseres");
    document.getElementById('sjangerSelect').value = elastic.getSingleFieldFromDoc(doc, "sjanger");
    document.getElementById('registrert_dato').value = elastic.getSingleFieldFromDoc(doc, "registrert_dato");
    document.getElementById('brukerId').value = elastic.getSingleFieldFromDoc(doc, "bruker");
    /*if (elastic.getSingleFieldFromDoc(doc, "analog") == 1)
    (<HTMLInputElement>document.getElementById('analogt')).value = "Ja";
    else
    (<HTMLInputElement>document.getElementById('analogt')).value = "Nei";
    if (elastic.getSingleFieldFromDoc(doc, "positiv") == 1)
    (<HTMLInputElement>document.getElementById('positivt')).value = "Ja";
    else
    (<HTMLInputElement>document.getElementById('positivt')).value = "Nei";
    (<HTMLInputElement>document.getElementById('materiale')).value = elastic.getSingleFieldFromDoc(doc, "materiale");*/
    changed = false;
    setPhoto();
    hasMotherChildren(doc._source);
    //http://musit-win-p01.uio.no/api/media/mediagroups/14267691/persons
    //mediagruppe_enhets_id
    var st = "http://musit-win-p01.uio.no/api/media/mediagroups/" + elastic.getSingleFieldFromDoc(doc, "mediagruppe_enhets_id") + "/persons";
    var formData = new Object();
    formData.url = st;
    postAndGetPhp(formData, appendPhotograph);
}
function appendPhotograph(data) {
    Tools.removeAllOptions("fotografList");
    var sel = document.getElementById("fotografList");
    for (var temp = 0; temp < data.length; temp++)
        Tools.addOption(sel, data[temp].name + ": " + data[temp].role, data[temp].role);
    var formData = new Object();
    var st = "http://musit-win-p01.uio.no/api/media/mediagroups/" + elastic.getSingleFieldFromDoc(doc, "mediagruppe_enhets_id") + "/analogInfo";
    formData.url = st;
    postAndGetPhp(formData, appendAnalogInfo);
    //    getURL(st);
    //xxx
}
function appendAnalogInfo(data) {
    document.getElementById('analogt').value = "";
    document.getElementById('positivt').value = "";
    document.getElementById('materiale').value = "";
    if (data.length == 0)
        return;
    document.getElementById('analogt').value = "ja";
    document.getElementById('positivt').value = data[0].positive;
    document.getElementById('materiale').value = data[0].baseMaterial;
}
function setPhoto() {
    document.getElementById('photoCalculate').onload = function () {
        calculatePhotoSize(document.getElementById("photo").clientHeight, document.getElementById("photo").clientWidth, 'photoId');
    };
    if (elastic == null)
        return;
    var filename = encodeURIComponent(elastic.getSingleFieldFromDoc(doc, "filnavn"));
    document.getElementById('photoCalculate').src = "http://www.unimus.no/felles/bilder/web_hent_bilde.php?filename=" + filename + "&type=jpeg&";
    document.getElementById('photoId').src = "http://www.unimus.no/felles/bilder/web_hent_bilde.php?filename=" + filename + "&type=jpeg&";
    document.getElementById('photoRefId').href = "http://www.unimus.no/felles/bilder/web_hent_bilde.php?filename=" + filename + "&type=jpeg&";
    document.getElementById('photoRefId').target = "_blank";
}
function isISODate() {
    var st = document.getElementById('registeredYearId').value;
    if (st.length == 0)
        return true;
    var arr = st.split("-");
    for (var temp = 0; temp < arr.length; temp++)
        if (areDigits(arr[temp]) == false)
            return false;
    if (arr.length == 1) {
        if (arr[0].length != 4)
            return false;
    }
    if (arr.length == 3 && arr[0].length == 4 && arr[1].length == 2 && arr[2].length == 2) {
        var timeStamp = Date.parse(st);
        if (isNaN(timeStamp) == false)
            return true;
        return false;
    }
    else
        return false;
}
function savePostOldFashion(toContinue) {
    var ob = JsonTool.cloneJSON(doc._source);
    ob.stedListe = document.getElementById('stedListeId').value;
    ob.stedkommentar = document.getElementById('stedkommentar').value;
    ob.motiv = document.getElementById('motivId').value;
    ob.annen_info = document.getElementById('infoId').value;
    var arr = new Array();
    var el = document.getElementById('topicSelect');
    for (var temp = 0; temp < el.options.length; temp++)
        arr.push(el.options[temp].value);
    ob.tema = arr;
    el = document.getElementById('koblingSelect');
    arr = new Array();
    for (var temp = 0; temp < el.options.length; temp++)
        arr.push(el.options[temp].value);
    ob.koblinger = arr;
    arr = new Array();
    el = document.getElementById('nameSelect');
    for (var temp = 0; temp < el.options.length; temp++)
        arr.push(el.options[temp].value);
    ob.persondata = arr;
    ob.datering_fra = document.getElementById('fromYearId').value;
    ob.datering_til = document.getElementById('toYearId').value;
    if (isISODate() == false) {
        alert("Dateringsdato i feil format");
        return;
    }
    if (document.getElementById('registeredYearId').value != "")
        ob.datering_dato = document.getElementById('registeredYearId').value;
    else
        delete (ob.datering_dato);
    ob.sjanger = document.getElementById('sjangerSelect').value;
    ob.kan_webpubliseres = document.getElementById('kan_webpubliseres').value;
    ob.internKommentar = document.getElementById('internKommentar').value;
    //  ob.eksternKommentar = (<any>document.getElementById('eksternKommentar')).value;
    ob.alledata = buildAlleData(ob);
    ob.bruker = getUser();
    ob.registrert_dato = currentDate();
    var formData = new Object();
    formData.foto_kort_id = elastic.getSingleFieldFromDoc(doc, "foto_kort_id");
    formData.content = ob;
    $.ajax({
        url: Tools.urlToNode + "savePost",
        type: 'post',
        data: formData,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
        },
        success: function (data) {
            if (isPostSaved(data) == false)
                return;
            changed = false;
            if (toContinue == 0) {
                //        window.close();
                load();
            }
            else {
                changed = false;
                if (toContinue == 1)
                    nextPost(false);
                else if (toContinue == -1)
                    previousPost(false);
            }
        },
        dataType: "json"
    });
}
function isPostSaved(data) {
    var succeed = true;
    try {
        if (data.postgres.rowCount != 1)
            succeed = false;
        if (data.elastic._shards.successful != 1 && data.elastic.created == false)
            succeed = false;
    }
    catch (err) {
        alert("Lagring feilede - kopier neste melding og send til DS");
        alert(JSON.stringify(data, null, 2));
        return false;
    }
    if (succeed == false) {
        alert("Lagring feilede - kopier neste melding og send til DS");
        alert(JSON.stringify(data, null, 2));
        return false;
    }
    return true;
}
function isPostDeleted(data) {
    var succeed = true;
    try {
        if (data.postgres.rowCount != 1)
            succeed = false;
        if (data.elastic.found != true || data.elastic._shards.successful != 1)
            succeed = false;
    }
    catch (err) {
        alert("Sletning feilede - kopier neste melding og send til DS");
        alert(JSON.stringify(data, null, 2));
        return false;
    }
    if (succeed == false) {
        alert("Sletning feilede - kopier neste melding og send til DS");
        alert(JSON.stringify(data, null, 2));
        return false;
    }
    return true;
}
function areDigits(str) {
    for (var temp = 0; temp < str.length; temp++)
        if (str.substring(temp, temp + 1) >= '0' && str.substring(temp, temp + 1) <= '9')
            continue;
        else
            return false;
    return true;
}
function buildAlleData(ob) {
    var arr = Object.keys(objectKeys);
    var result = "";
    ob.alledata = null;
    for (var temp = 0; temp < arr.length; temp++) {
        if (objectKeys[arr[temp]].type == "text" || objectKeys[arr[temp]].type == "keyword") {
            var b = ob[arr[temp]];
            if (Array.isArray(b)) {
                for (var i = 0; i < b.length; i++)
                    result += " " + b[i];
            }
            else
                result += " " + b;
        }
    }
    return result;
}
function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
function calculatePhotoSize(height, width, photoId) {
    height -= 10;
    width -= 10;
    var oldHeight = document.getElementById('photoCalculate').height;
    var oldWidth = document.getElementById('photoCalculate').width;
    if (oldHeight < height && oldWidth < width) {
        document.getElementById(photoId).height = oldHeight;
        document.getElementById(photoId).width = oldWidth;
        return;
    }
    if (oldHeight > height) {
        var reduce = void 0;
        reduce = (height * 100) / oldHeight;
        var newWidth = (oldWidth * reduce) / 100;
        if (newWidth > width) {
            reduce = (width * 100) / oldWidth;
            document.getElementById(photoId).width = width;
            var newHeight = (oldHeight * reduce) / 100;
            document.getElementById(photoId).height = newHeight;
        }
        else {
            document.getElementById(photoId).height = height;
            document.getElementById(photoId).width = newWidth;
        }
    }
    else {
        var reduce = (width * 100) / oldWidth;
        var newHeight = (oldHeight * reduce) / 100;
        document.getElementById(photoId).height = newHeight;
        document.getElementById(photoId).width = width;
    }
}
function clearTable(tableId) {
    document.getElementById(tableId).innerHTML = "";
}
function getObjectOffset(element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while (element);
    return {
        top: top,
        left: left
    };
}
;
function placeFooter() {
    var footElement = document.getElementById("app-footer");
    footElement.style.width = window.innerWidth - (50) + "px";
}
function changeSubjectWordwheel(event) {
    if (wheelInstance2.handleWheel(event) == true)
        return;
    var str = document.getElementById('topicId').value;
    if (str.length > 0) {
        wordListQuery.tags.terms.include = str + ".*";
        var query = new Object();
        query.aggs = wordListQuery;
        query.size = 0;
        var formData = new Object();
        formData.elasticdata = query;
        formData.resturl = "unifotobase/billede/_search";
        $.ajax({
            url: Tools.urlToNode + "PassPost",
            type: 'post',
            data: formData,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
            },
            success: function (data) {
                var el = new ElasticClass(data);
                var ar = el.getFacetFieldWithFacetName("tags");
                //                alert(JSON.stringify(ar,null,2));
                wheelInstance2.fillFacets(ar);
            },
            dataType: "json"
        });
    }
    else {
        wheelInstance2.clearUl();
        wheelInstance2.hideOverlay();
    }
}
function resize2() {
    if (wheelInstance2 != null) {
        wheelInstance2.followObject(document.getElementById('topicId'), 0, 24);
    }
    if (wheelInstance3 != null) {
        wheelInstance3.followObject(document.getElementById('namesId'), 0, 24);
    }
    if (wheelInstance4 != null) {
        wheelInstance4.followObject(document.getElementById('stedListeId'), 0, 24);
    }
    setPhoto();
}
;
function changeNameWordwheel(event) {
    if (wheelInstance3.handleWheel(event) == true)
        return;
    wheelInstance3.followObject(document.getElementById('namesId'), 0, 24);
    var str = document.getElementById('namesId').value;
    if (str.length > 0) {
        nameListQuery.tags.terms.include = str + ".*";
        var query = new Object();
        query.aggs = nameListQuery;
        query.size = 0;
        var formData = new Object();
        formData.elasticdata = query;
        formData.resturl = "unifotobase/billede/_search";
        $.ajax({
            url: Tools.urlToNode + "PassPost",
            type: 'post',
            data: formData,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
            },
            success: function (data) {
                var el = new ElasticClass(data);
                var ar = el.getFacetFieldWithFacetName("tags");
                wheelInstance3.fillFacets(ar);
            },
            dataType: "json"
        });
    }
    else {
        wheelInstance3.clearUl();
        wheelInstance3.hideOverlay();
    }
}
function setUpPlaceWords(str) {
    var q = str.replace(spaceSplitter, "####");
    var lemmaList = q.split("####");
    if (lemmaList.length == 0)
        return;
    placeListQuery.tags.terms.include = lemmaList[lemmaList.length - 1] + ".*";
}
function changePlaceWordwheel(event) {
    if (wheelInstance4.handleWheel(event) == true)
        return;
    wheelInstance4.followObject(document.getElementById('stedListeId'), 0, 24);
    var str = document.getElementById('stedListeId').value;
    if (str.length > -1) {
        var query = new Object();
        if (document.getElementById('delSted').value.length > 0) {
            var wildCard = new Object();
            wildCard.wildcard = new Object();
            wildCard.wildcard.sted = document.getElementById('delSted').value.toLowerCase() + "*";
            query.query = wildCard;
            placeListQuery.tags.terms.include = ".*";
        }
        else
            placeListQuery.tags.terms.include = str + ".*";
        query.aggs = placeListQuery;
        query.size = 0;
        var formData = new Object();
        formData.elasticdata = query;
        formData.resturl = "unifotobase/billede/_search";
        $.ajax({
            url: Tools.urlToNode + "PassPost",
            type: 'post',
            data: formData,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
            },
            success: function (data) {
                var el = new ElasticClass(data);
                var ar = el.getFacetFieldWithFacetName("tags");
                wheelInstance4.fillFacets(ar);
            },
            dataType: "json"
        });
    }
    else {
        wheelInstance4.clearUl();
        wheelInstance4.hideOverlay();
    }
}
function capitalizeWords(str) {
    var q = str.replace(spaceSplitter, "####");
    var lemmaList = q.split("####");
    var arr1 = new Array();
    for (var temp = 0; temp < lemmaList.length; temp++)
        if (lemmaList[temp].length > 0)
            arr1.push(lemmaList[temp]);
    if (arr1.length == 0)
        return "";
    var arr2 = new Array();
    for (var temp = 0; temp < arr1.length; temp++)
        arr2.push(arr1[temp][0].toUpperCase() + arr1[temp].slice(1));
    return arr2.join(" ");
}
function load() {
    var formData = new Object();
    formData.elasticdata = new Object();
    formData.resturl = "unifotobase/billede/_search?q=foto_kort_id:" + docArray[docIndex] + "&";
    postPhp(formData, loadContent);
}
function hasChanged() {
    if (document.getElementById('stedListeId').value != elastic.getSingleFieldFromDoc(doc, "stedListe"))
        changed = true;
    if (document.getElementById('stedkommentar').value != elastic.getSingleFieldFromDoc(doc, "stedkommentar"))
        changed = true;
    if (document.getElementById('motivId').value != elastic.getSingleFieldFromDoc(doc, "motiv"))
        changed = true;
    if (document.getElementById('infoId').value != elastic.getSingleFieldFromDoc(doc, "annen_info"))
        changed = true;
    if (document.getElementById('internKommentar').value != elastic.getSingleFieldFromDoc(doc, "internKommentar"))
        changed = true;
    if (document.getElementById('fromYearId').value != elastic.getSingleFieldFromDoc(doc, "datering_fra"))
        changed = true;
    if (document.getElementById('toYearId').value != elastic.getSingleFieldFromDoc(doc, "datering_til"))
        changed = true;
    if (document.getElementById('registeredYearId').value != elastic.getSingleFieldFromDoc(doc, "datering_dato"))
        changed = true;
    if (document.getElementById('kan_webpubliseres').value != elastic.getSingleFieldFromDoc(doc, "kan_webpubliseres"))
        changed = true;
    if (document.getElementById('sjangerSelect').value != elastic.getSingleFieldFromDoc(doc, "sjanger"))
        changed = true;
}
function clearWheels() {
    wheelInstance2.clearUl();
    wheelInstance2.hideOverlay();
    wheelInstance3.clearUl();
    wheelInstance3.hideOverlay();
    wheelInstance4.clearUl();
    wheelInstance4.hideOverlay();
    document.getElementById('delSted').value = "";
}
/*
function hideWheels(){
  wheelInstance2.hideOverlay();
  wheelInstance3.hideOverlay();
  wheelInstance4.hideOverlay();
  wheelInstance5.hideOverlay();
  (<any>document.getElementById('stedId')).value="";
  
}
*/
function nextPost(checkForChanges) {
    clearWheels();
    if (docIndex == docArray.length)
        return;
    if (checkForChanges == true)
        hasChanged();
    if (changed == true) {
        if (confirm("Ønsker du at lagre endringer?") == true) {
            savePostOldFashion(1);
            return;
        }
    }
    docIndex++;
    load();
}
function previousPost(checkForChanges) {
    clearWheels();
    if (docIndex == 0)
        return;
    if (checkForChanges == true)
        hasChanged();
    if (changed == true) {
        if (confirm("Ønsker du at lagre endringer?") == true) {
            savePostOldFashion(-1);
            return;
        }
    }
    docIndex--;
    load();
}
function deletePost() {
    if (confirm("Ønsker du at slette posten " + doc._source.foto_kort_id + " ?") == false)
        return;
    var formData = new Object();
    formData.foto_kort_id = doc._source.foto_kort_id;
    formData.resturl = "unifotobase/billede/" + doc._source.foto_kort_id;
    $.ajax({
        url: Tools.urlToNode + "DeletePost",
        type: 'post',
        data: formData,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
        },
        success: function (data) {
            if (isPostSaved(data) == false)
                return;
            if (docArray.length == 1) {
                window.location.href = "index.html";
            }
            else {
                docArray.splice(docIndex, 1);
                if (docIndex == docArray.length)
                    docIndex--;
                load();
            }
        },
        dataType: "json"
    });
}
function deleteKobling() {
    Tools.removeOptionSelected('koblingSelect');
    changed = true;
}
function addKobling() {
    var formData = {};
    var addFotoKort = document.getElementById('koblingText').value;
    var el = document.getElementById("koblingSelect");
    for (var temp = 0; temp < el.options.length; temp++)
        if (el.options[temp].value == addFotoKort) {
            alert("Fotokort allerede tilkoblet");
            return;
        }
    if (addFotoKort.length == 0)
        return;
    formData.resturl = "unifotobase/billede/_search?q=_id:" + addFotoKort;
    formData.elasticdata = new Object();
    postPhp(formData, addKoblingIfExist);
}
function addKoblingIfExist(data) {
    if (data.hits.hits.length != 1) {
        alert("Foto kort Id eksisterer ikke");
        return;
    }
    Tools.addOption(document.getElementById('koblingSelect'), document.getElementById('koblingText').value, document.getElementById('koblingText').value);
    changed = true;
}
function isMother(source) {
    if (source.hasOwnProperty("tema") == false)
        return false;
    var arr = source.tema;
    if (arr == null)
        return false;
    for (var temp = 0; temp < arr.length; temp++)
        if (arr[temp] == "moderkort")
            return true;
    return false;
}
function hasMotherChildren(source) {
    var formData = new Object();
    if (isMother(source) == false) {
        document.getElementById('harKoblingerId').innerHTML = "";
        return;
    }
    var d = JSON.parse("{\"must\":[]}");
    var defaultObj = JsonTool.createJsonPath("query");
    defaultObj.query.bool = d;
    var ob = new Object();
    var f = new Object();
    ob = new Object();
    f.koblinger = source.foto_kort_id;
    ob.match = f;
    defaultObj.query.bool.must.push(ob);
    formData.resturl = "unifotobase/billede/_search";
    formData.elasticdata = defaultObj;
    postPhp(formData, hasChildrenResult);
}
function hasChildrenResult(data) {
    if (data.hits.hits.length == 0)
        document.getElementById('harKoblingerId').innerHTML = "";
    else
        document.getElementById('harKoblingerId').innerHTML = "**";
}
function getURL(url) {
    $.ajax({
        url: url,
        type: 'get',
        dataType: "jsonp",
        //        crossDomain: true,
        complete: function (data) {
            alert("complete " + JSON.stringify(data, null, 2));
        },
        //        error: function (XMLHttpRequest, textStatus, errorThrown) {
        error: function (data) {
            //            alert("error "+JSON.stringify(data,null,2));
        },
        success: function (data) {
            //          alert("hallo" +JSON.stringify(data, null, 2));
        },
    });
}
function test(data) {
    alert("hest");
}
