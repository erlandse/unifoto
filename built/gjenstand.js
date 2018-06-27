var elastic = null;
//import ElasticClass = require("./ElasticClass");
var id = "2";
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
function initialize() {
    $(document).ready(function () {
        // do jQuery
    });
    var styles = document.styleSheets;
    tools = new Tools();
    var urlId = Tools.gup("id");
    if (urlId != "")
        id = urlId;
    var formData = {};
    var st = sessionStorage.getItem("muvQuery");
    if (st != "null" && !stringEmpty(st)) {
        noSearchList = false;
        importQuery = st;
        formData.elasticdata = importQuery;
        formData.resturl = "muv2/gjenstand/_search";
        sessionStorage.setItem("muvQuery", "");
        st = sessionStorage.getItem("muvLabel");
        sessionStorage.setItem("muvLabel", "");
        document.getElementById('searchLabelId').innerHTML = st;
        document.getElementById('nextId').style.visibility = 'visible';
        document.getElementById('prevId').style.visibility = 'visible';
    }
    else {
        noSearchList = true;
        formData.elasticdata = "";
        formData.resturl = "muv2/gjenstand/_search?q=museumKey:" + id + "&";
        document.getElementById('searchLabelId').innerHTML = "";
        document.getElementById('nextId').style.visibility = 'hidden';
        document.getElementById('prevId').style.visibility = 'hidden';
    }
    placeFooter();
    postPhp(formData, loadContent);
}
function postPhp(formData, callBack) {
    $.ajax({
        url: "passpost.php",
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
    else {
        alert("Ingen dokument med det museumsnummer!");
        return;
    }
    if (importQuery != "") {
        for (var temp = 0; temp < docs.length; temp++) {
            if (elastic.getSingleFieldFromDoc(docs[temp], "museumKey") == id) {
                doc = docs[temp];
                artifactPos = (JSON.parse(importQuery)).from + temp;
                break;
            }
        }
    }
    insertFields();
}
function moveArtifact(stepToMove) {
    var ob = JSON.parse(importQuery);
    artifactPos = artifactPos + stepToMove;
    ob.from = artifactPos;
    ob.size = 1;
    importQuery = JSON.stringify(ob, null, 2);
    var formData = new Object();
    formData.elasticdata = importQuery;
    formData.resturl = "muv2/gjenstand/_search";
    postPhp(formData, prepareAfterMove);
}
function prepareAfterMove(data) {
    elastic = new ElasticClass(data);
    var docs = elastic.getDocs();
    if (elastic.getDocCount() > 0)
        doc = docs[0];
    insertFields();
}
function clearTables() {
    document.getElementById('tableArtPart').innerHTML = "";
    document.getElementById('documentationTable').innerHTML = "";
    document.getElementById('tableRelation').innerHTML = "";
    document.getElementById('eventContentDiv').innerHTML = "";
    /* document.getElementById('tableMiddlebody').innerHTML = "";
     document.getElementById('tableRightbody').innerHTML = "";
     document.getElementById('thumbnailTable').innerHTML = "";*/
}
function insertFields() {
    clearTables();
    var arr = elastic.getArrayFromDoc(doc, "gjenstandsnavn");
    var delim = "";
    var res = "";
    for (var temp = 0; temp < arr.length; temp++) {
        res += delim + arr[temp];
        delim = ", ";
    }
    document.getElementById("tagline").innerHTML = res;
    var fradato = elastic.getSingleFieldFromDoc(doc, "fra_dato");
    var tildato = elastic.getSingleFieldFromDoc(doc, "til_dato");
    res = fradato == "" ? "?" : fradato,
        res += " - ";
    res += tildato == "" ? "?" : tildato;
    insertContentIntoTable("tableArtPart", "DATERING", res, "label_result");
    arr = elastic.getArrayFromDoc(doc, "utviklere");
    res = "";
    delim = "";
    for (var temp = 0; temp < arr.length; temp++) {
        res += delim + arr[temp];
        delim = "<br>";
    }
    insertContentIntoTable("tableArtPart", "UTVIKLER", res, "label_result");
    arr = elastic.getArrayFromDoc(doc, "produsenter");
    res = "";
    delim = "";
    for (var temp = 0; temp < arr.length; temp++) {
        res += delim + arr[temp];
        delim = "<br>";
    }
    insertContentIntoTable("tableArtPart", "PRODUSENT", res, "label_result");
    res = elastic.getSingleFieldFromDoc(doc, "produksjonsstempel");
    insertContentIntoTable("tableArtPart", "PRODUSENTMERKING", res, "label_result");
    res = elastic.getSingleFieldFromDoc(doc, "museumsid") + "." + pad(elastic.getSingleFieldFromDoc(doc, "museumsnummer"), 4, "0");
    if (elastic.getSingleFieldFromDoc(doc, "undernummer") != "")
        res += "." + elastic.getSingleFieldFromDoc(doc, "undernummer");
    insertContentIntoTable("tableArtPart", "MUSEUMSNUMMER", res, "label_result");
    arr = elastic.getArrayFromDoc(doc, "fagmiljøer");
    res = "";
    delim = "";
    for (var temp = 0; temp < arr.length; temp++) {
        res += delim + arr[temp];
        delim = "<br>";
    }
    insertContentIntoTable("tableArtPart", "FAGMILJØ", res, "label_result");
    arr = elastic.getArrayFromDoc(doc, "gjenstandstyper");
    res = "";
    delim = "";
    for (var temp = 0; temp < arr.length; temp++) {
        res += delim + arr[temp];
        delim = "<br>";
    }
    insertContentIntoTable("tableArtPart", "GJENSTANDSTYPE", res, "label_result");
    loadEvents(doc);
    document.getElementById('descript').innerHTML = "<br><b>GJENSTANDSBESKRIVELSE</b><br>" + elastic.getSingleFieldFromDoc(doc, "gjenstandsbeskrivelse");
    res = elastic.getSingleFieldFromDoc(doc, "tillegg_historie");
    if (res != "")
        document.getElementById('descript').innerHTML = document.getElementById('descript').innerHTML + "<br><br><b>TILLEGGSOPPLYSNINGER</b><br>" + res;
    insertPhotos(doc);
    loadDocumentation(doc);
    loadRelations(doc);
    if (importQuery != "")
        setControls();
}
function setControls() {
    //her setter jeg kontroller
    if (artifactPos == 0)
        document.getElementById('prevId').disabled = true;
    else
        document.getElementById('prevId').disabled = false;
    if (artifactPos >= (elastic.getDocCount() - 1))
        document.getElementById('nextId').disabled = true;
    else
        document.getElementById('nextId').disabled = false;
    document.getElementById('positionSpanId').innerHTML = (artifactPos + 1) + " av " + elastic.getDocCount();
}
function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
function loadEvents(doc) {
    eventArray = elastic.getArrayFromDoc(doc, "hendelser");
    if (eventArray.length == 0 || eventArray[0].split("|").length < 3) {
        document.getElementById("eventDivTraverse").style.visibility = "hidden";
        /*  document.getElementById("descript").style.width="100%";
          document.getElementById("event").style.width="0%";*/
        return;
    }
    /*
     document.getElementById("descript").style.width="50%";
     document.getElementById("event").style.width="50%";
   */
    document.getElementById("eventDivTraverse").style.visibility = "visible";
    eventArray.sort();
    eventIndex = 0;
    setEvent();
}
function moveEvent(toAdd) {
    eventIndex = eventIndex + toAdd;
    setEvent();
}
function setEvent() {
    var arr = eventArray[eventIndex].split("|");
    if (arr[0] != "")
        document.getElementById('fromEventSpan').innerHTML = arr[0];
    else
        document.getElementById('fromEventSpan').innerHTML = "?";
    if (arr[1] != "")
        document.getElementById('toEventSpan').innerHTML = arr[1];
    else
        document.getElementById('toEventSpan').innerHTML = "?";
    document.getElementById('eventContentDiv').innerHTML = arr[2];
    if (eventIndex == 0)
        document.getElementById('prevEvent').disabled = true;
    else
        document.getElementById('prevEvent').disabled = false;
    if (eventIndex == eventArray.length - 1)
        document.getElementById('nextEvent').disabled = true;
    else
        document.getElementById('nextEvent').disabled = false;
}
function movePhotoEvent(toAdd) {
    photoEventIndex = photoEventIndex + toAdd;
    setPhotoEvent();
    calculatePhotoSize(document.getElementById("photo").clientHeight, document.getElementById("photo").clientWidth, 'photoId');
}
function setPhotoEvent() {
    document.getElementById('photoCalculate').onload = function () {
        calculatePhotoSize(document.getElementById("photo").clientHeight, document.getElementById("photo").clientWidth, 'photoId');
    };
    if (photoEventIndex == 0)
        document.getElementById('prevPhotoEvent').disabled = true;
    else
        document.getElementById('prevPhotoEvent').disabled = false;
    if (photoEventIndex == photoArray.length - 1)
        document.getElementById('nextPhotoEvent').disabled = true;
    else
        document.getElementById('nextPhotoEvent').disabled = false;
    document.getElementById('photoCalculate').src = "http://www.unimus.no/felles/bilder/web_hent_bilde.php?filename=" + photoArray[photoEventIndex] + "&type=jpeg&";
    document.getElementById('photoId').src = "http://www.unimus.no/felles/bilder/web_hent_bilde.php?filename=" + photoArray[photoEventIndex] + "&type=jpeg&";
    document.getElementById('photoRefId').href = "http://www.unimus.no/felles/bilder/web_hent_bilde.php?filename=" + photoArray[photoEventIndex] + "&type=jpeg&";
    document.getElementById('photoRefId').target = "_blank";
    var st = "http://musit-win-p01.uio.no/api/media/filenames/" + photoArray[photoEventIndex] + ".JPG/photographers";
    var formData = new Object();
    formData.url = st;
    postAndGetPhp(formData, writePhotographer);
}
function writePhotographer(svar) {
    var fotografer = svar.map(function (mg) { return mg.photographers; }).concat();
    document.getElementById('photographer').innerHTML = "<b>Fotograf:</b> " + fotografer.join("; ");
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
function insertPhotos(doc) {
    photoArray = elastic.getArrayFromDoc(doc, "fotos");
    photoEventIndex = 0;
    setPhotoEvent();
}
function insertThumbnails(tableId, filename, nr, id, name, cellsprRow, width, type) {
    //    let cellsprRow:number= 2;
    var table = document.getElementById(tableId);
    var row;
    if ((nr % cellsprRow) == 0)
        row = table.insertRow(-1);
    else
        row = table.rows[table.rows.length - 1];
    var cellSize = row.cells.length;
    var cell1 = row.insertCell(cellSize);
    cell1.setAttribute("class", "cellLabel"); //For Most Browsers
    cell1.setAttribute("className", "cellLabel");
    var img = "<img src='http://www.unimus.no/felles/bilder/web_hent_bilde.php?filename=" + filename + "&type=" + type + "&'/>";
    var aref = "<a target='_blank' href='gjenstand.html?id=" + id + "'>" + img + "</a>";
    //    cell1.innerHTML = "<img src='http://www.unimus.no/felles/bilder/web_hent_bilde.php?filename="+filename+"&type=thumbnail&'/>";
    //    cell1.innerHTML = aref + "<br>" + name;
    cell1.innerHTML = name + "<br>" + aref;
}
function insertRelations(data) {
    elasticLinks = new ElasticClass(data);
    var docs = elasticLinks.getDocs();
    if (docs.length == 0) {
        return;
    }
    else {
    }
    for (var temp = 0; temp < docs.length; temp++) {
        var pA = elasticLinks.getArrayFromDoc(docs[temp], "fotos");
        var gj = elasticLinks.getArrayFromDoc(docs[temp], "gjenstandsnavn");
        if (pA.length == 0)
            insertThumbnails("tableRelation", "xxxxxx", temp, elasticLinks.getSingleFieldFromDoc(docs[temp], "museumKey"), gj[0], 1, "140px", "thumbnail");
        else
            insertThumbnails("tableRelation", pA[0], temp, elasticLinks.getSingleFieldFromDoc(docs[temp], "museumKey"), gj[0], 1, "140px", "thumbnail");
    }
}
function clearTable(tableId) {
    document.getElementById(tableId).innerHTML = "";
}
function loadRelations(doc) {
    var linkArray = elastic.getArrayFromDoc(doc, "koblinger");
    if (linkArray.length == 0)
        return;
    var q = new Object();
    q.query = new Object();
    q.query.bool = JSON.parse("{\"must\":[],\"should\":[],\"must_not\":[]}");
    for (var temp = 0; temp < linkArray.length; temp++) {
        var t = JSON.parse("{ \"term\" : { \"id\" : \"\" } }");
        t.term.id = linkArray[temp];
        q.query.bool.should.push(t);
    }
    var formData = {};
    formData.elasticdata = JSON.stringify(q, null, 2);
    formData.resturl = "muv2/gjenstand/_search";
    postPhp(formData, insertRelations);
}
function insertDocumentation(tableId, filename, nr) {
    var cellsprRow = 1;
    var table = document.getElementById(tableId);
    var row;
    if ((nr % cellsprRow) == 0)
        row = table.insertRow(-1);
    else
        row = table.rows[table.rows.length - 1];
    var cellSize = row.cells.length;
    var cell1 = row.insertCell(cellSize);
    if (filename.endsWith(".pdf")) {
        cell1.innerHTML = "<a target='_blank' href='" + "http://www.unimus.no/felles/bilder/web_hent_pdf.php?filename=" + filename + "&'>se pdf</a>";
    }
    else {
        var img = "<img src='http://www.unimus.no/felles/bilder/web_hent_bilde.php?filename=" + filename + "&type=thumbnail&'/>";
        var aref = "<a target='_blank' href='http://www.unimus.no/felles/bilder/web_hent_bilde.php?filename=" + filename + "&type=jpeg&'>" + img + "</a>";
        cell1.innerHTML = aref;
    }
}
function loadDocumentation(doc) {
    var docu = elastic.getArrayFromDoc(doc, "dokumentasjon");
    var docuArray = new Array();
    for (var temp = 0; temp < docu.length; temp++)
        if (docu[temp].trim().length != 0)
            docuArray.push(docu[temp]);
    if (docuArray.length == 0) {
        document.getElementById('artPart').style.height = "100%";
        document.getElementById('docPart').style.height = "0%";
        document.getElementById('docPartHeader').innerHTML = "";
        document.getElementById('docPartHeader').style.borderBottomWidth = "0px";
        return;
    }
    else {
        document.getElementById('docPartHeader').innerHTML = "<b>DOKUMENTASJON</b>";
        document.getElementById('artPart').style.height = "70%";
        document.getElementById('docPart').style.height = "30%";
        document.getElementById('docPartHeader').style.borderBottomWidth = "1px";
    }
    for (var temp = 0; temp < docuArray.length; temp++) {
        insertDocumentation("documentationTable", docuArray[temp], temp);
    }
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
function expandOrHidePhoto() {
    if (document.getElementById('expandPoto').value == 'Større foto') {
        document.getElementById('descriptionEvent').style.height = "0%";
        document.getElementById('photo').style.height = "100%";
        document.getElementById('expandPoto').value = 'Tilbake til gjenstandsvisning';
    }
    else {
        document.getElementById('expandPoto').value = 'Større foto';
        document.getElementById('descriptionEvent').style.height = "50%";
        document.getElementById('photo').style.height = "50%";
    }
    calculatePhotoSize(document.getElementById("photo").clientHeight, document.getElementById("photo").clientWidth, 'photoId');
}
function placeFooter() {
    var footElement = document.getElementById("app-footer");
    footElement.style.width = window.innerWidth - (50) + "px";
}
function resizeArtifact() {
    placeFooter();
    calculatePhotoSize(document.getElementById("photo").clientHeight, document.getElementById("photo").clientWidth, 'photoId');
}
