var defaultObj = null;
var runQuery = null;
//var spaceSplitter = new RegExp("([\\s]+)", "g");
var pagePos = 0;
var pageSize = 12;
var resultElastic;
var wheelInstance = null;
var rowsInResult = 0;
var columnsInResult = 0;
var spaceSplitter = new RegExp("([\\s]+)", "g");
String.prototype.endsWith = function (pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
};
function continueInitialize() {
    wheelInstance = new Wheel('wheelInstance', 'wordwheel_div', 'ul', 'lookupIndex', 'inputField');
    document.getElementById('inputField').value = "";
    var d = JSON.parse("{\"must\":[]}");
    defaultObj = JsonTool.createJsonPath("query");
    defaultObj.query.bool = d;
    defaultObj.size = pageSize;
    defaultObj.sort = sortPhoto;
    var formData = {};
    // formData.elasticdata = JSON.stringify(aggObject, null, 2);
    formData.resturl = "unifotobase/billede/_search";
    formData.elasticdata = aggObject;
    postPhpMain(formData, insertNavigationLinks);
    resize();
}
function mainInitialize() {
    $(document).ready(function () {
        // do jQuery
    });
    continueInitialize();
}
function insertKeyword() {
    //    (<HTMLInputElement> document.getElementById('inputField')).value = (<HTMLInputElement> document.getElementById('inputField')).value + " " + (<HTMLSelectElement> document.getElementById('keywordList')).value.trim();
    search();
}
function insertNavigationLinks(data) {
    var es = new ElasticClass(data);
    var keywordSelect = document.getElementById('keywordList');
    var arr = es.getFacetFieldWithFacetName("tema");
    Tools.addOption(keywordSelect, "Emne ikke valgt", "");
    for (var temp = 0; temp < arr.length; temp++) {
        if (arr[temp].key != "")
            Tools.addOption(keywordSelect, arr[temp].key, arr[temp].key);
    }
    /*  checkboxArray = new Array();
      let table: HTMLTableElement = <HTMLTableElement>document.getElementById('navigationTable');
      displayNavigationList();*/
    setToZero();
}
function insertWordSearch(query) {
    var ob;
    var b = document.getElementById('inputField').value; //.trim().toLowerCase();
    b = b.trim().toLocaleLowerCase();
    if (b.length == 0)
        return;
    var qu;
    qu = b.replace(this.spaceSplitter, "####");
    var words = qu.split("####");
    for (var temp = 0; temp < words.length; temp++) {
        var pos = void 0;
        var f = new Object();
        ob = new Object();
        if (words[temp].indexOf("*") != -1 || words[temp].indexOf("?") != -1) {
            f.alledata = words[temp];
            ob.wildcard = f;
        }
        else {
            f.alledata = words[temp];
            ob.match = f;
        }
        query.query.bool.must.push(ob);
    }
}
function searchField(event) {
    if (event.keyCode == 13) {
        search();
        return;
    }
}
function createQuery(includeTextField) {
    var query = JsonTool.cloneJSON(defaultObj);
    var ob;
    var boolOr = JSON.parse("{\"bool\":{\"should\":[]}}");
    pagePos = 0;
    var fotokortRange = JSON.parse("{\"range\": {\"foto_kort_id\":{}}}");
    var oldFotokortRange = JSON.parse("{\"range\": {\"old_foto_kort_id\":{}}}");
    if (includeTextField && document.getElementById("fieldSearch").value != "" && document.getElementById("fieldSearchSelect").value == 'foto_kort_id') {
        var st = document.getElementById("fieldSearch").value;
        var pos = st.indexOf(".");
        if (pos == -1) {
            var f_1 = new Object();
            ob = new Object();
            f_1.foto_kort_id = document.getElementById('fieldSearch').value;
            ob.match = f_1;
            query.query.bool.must.push(ob);
            return query;
        }
        var t = st.substring(0, pos);
        fotokortRange.range.foto_kort_id.gte = t.trim();
        t = st.substring(pos + 1).trim();
        if (t.length > 0)
            fotokortRange.range.foto_kort_id.lte = t.trim();
        query.query.bool.must.push(fotokortRange);
    }
    if (includeTextField && document.getElementById("fieldSearch").value != "" && document.getElementById("fieldSearchSelect").value == 'old_foto_kort_id') {
        var st = document.getElementById("fieldSearch").value;
        var pos = st.indexOf(".");
        if (pos == -1) {
            var f_2 = new Object();
            ob = new Object();
            f_2.old_foto_kort_id = document.getElementById('fieldSearch').value;
            ob.match = f_2;
            query.query.bool.must.push(ob);
            return query;
        }
        var t = st.substring(0, pos);
        oldFotokortRange.range.old_foto_kort_id.gte = t.trim();
        t = st.substring(pos + 1).trim();
        if (t.length > 0)
            oldFotokortRange.range.old_foto_kort_id.lte = t.trim();
        query.query.bool.must.push(oldFotokortRange);
    }
    if (includeTextField && document.getElementById("fieldSearch").value != "" && document.getElementById("fieldSearchSelect").value == 'koblinger') {
        var st = document.getElementById("fieldSearch").value;
        var f_3 = new Object();
        ob = new Object();
        f_3.koblinger = document.getElementById('fieldSearch').value;
        ob.match = f_3;
        query.query.bool.should = new Array();
        query.query.bool.should.push(ob);
        ob = new Object();
        f_3 = new Object();
        f_3.foto_kort_id = document.getElementById("fieldSearch").value;
        ob.match = f_3;
        query.query.bool.should.push(ob);
        //     query.query.bool.must.push(ob);
        return query;
    }
    if (includeTextField && document.getElementById("fieldSearch").value != "" && document.getElementById("fieldSearchSelect").value == 'internKommentar') {
        var q = document.getElementById('fieldSearch').value.replace(spaceSplitter, "####");
        var words = q.split("####");
        /*    for (let i = 0; i < words.length; i++) {
              let f: any = new Object();
              ob = new Object();
              f.internKommentar = words[i];
              ob.match = f;
              query.query.bool.must.push(ob);
            }*/
        for (var temp = 0; temp < words.length; temp++) {
            var pos_1 = 0;
            var f_4 = new Object();
            ob = new Object();
            if (words[temp].indexOf("*") != -1 || words[temp].indexOf("?") != -1) {
                f_4.internKommentar = words[temp].toLowerCase();
                ob.wildcard = f_4;
            }
            else {
                f_4.internKommentar = words[temp];
                ob.match = f_4;
            }
            query.query.bool.must.push(ob);
        }
    }
    if (includeTextField && document.getElementById("fieldSearch").value != "" && document.getElementById("fieldSearchSelect").value == 'bruker') {
        var f_5 = new Object();
        ob = new Object();
        f_5.bruker = document.getElementById('fieldSearch').value;
        ob.match = f_5;
        query.query.bool.must.push(ob);
    }
    if (includeTextField && document.getElementById("fieldSearch").value != "" && document.getElementById("fieldSearchSelect").value == 'sjanger') {
        var f_6 = new Object();
        ob = new Object();
        f_6.sjanger = document.getElementById('fieldSearch').value;
        ob.match = f_6;
        query.query.bool.must.push(ob);
    }
    if (includeTextField && document.getElementById("fieldSearch").value != "" && document.getElementById("fieldSearchSelect").value == 'mediagruppe_enhets_id') {
        var f7 = new Object();
        ob = new Object();
        f7.mediagruppe_enhets_id = parseInt(document.getElementById('fieldSearch').value);
        ob.match = f7;
        query.query.bool.must.push(ob);
    }
    /* if (boolOr.bool.should.length > 0)
       query.query.bool.must.push(boolOr);*/
    if (includeTextField)
        insertWordSearch(query);
    if (document.getElementById('keywordList').value != "") {
        var f_7 = new Object();
        ob = new Object();
        f_7.tema = document.getElementById('keywordList').value;
        ob.match = f_7;
        query.query.bool.must.push(ob);
    }
    var element = document.getElementById('moderkort');
    var checked = element.checked;
    if (checked) {
        var f_8 = new Object();
        ob = new Object();
        f_8.tema = "moderkort";
        ob.match = f_8;
        query.query.bool.must.push(ob);
    }
    if (includeTextField && document.getElementById("filnavn").value != "") {
        /*    let f: any = new Object();
            ob = new Object();
            f.filnavn = (<HTMLInputElement>document.getElementById("filnavn")).value;
            ob.wildcard = f;
            query.query.bool.must.push(ob);*/
        var q = document.getElementById('filnavn').value.replace(spaceSplitter, "####");
        var words = q.split("####");
        for (var i = 0; i < words.length; i++) {
            if (words[i].length == 0)
                continue;
            var f_9 = new Object();
            ob = new Object();
            f_9.filnavn = words[i];
            ob.wildcard = f_9;
            query.query.bool.must.push(ob);
        }
    }
    if (document.getElementById("fromDate").value != "" || document.getElementById("toDate").value != "") {
        var dateFilter = JSON.parse("{\"range\": {\"registrert_dato\":{}}}");
        if (document.getElementById("fromDate").value != "") {
            var st = document.getElementById("fromDate").value;
            if (st.length == 4)
                st += "-01-01";
            dateFilter.range.registrert_dato.gte = st;
        }
        if (document.getElementById("toDate").value != "") {
            var st = document.getElementById("toDate").value;
            if (st.length == 4)
                st += "-01-01";
            dateFilter.range.registrert_dato.lt = st;
        }
        dateFilter.range.registrert_dato.format = "yyyy-MM-dd";
        query.query.bool.must.push(dateFilter);
    }
    if (document.getElementById("button1").checked == true)
        return query;
    var f = new Object();
    ob = new Object();
    if (document.getElementById("button2").checked == true)
        f.kan_webpubliseres = "1";
    else
        f.kan_webpubliseres = "0";
    ob.match = f;
    query.query.bool.must.push(ob);
    return query;
}
function search() {
    wheelInstance.clearUl();
    wheelInstance.hideOverlay();
    runQuery = createQuery(true);
    //  alert(JSON.stringify(runQuery,null,2));
    runQuery.from = 0;
    pagePos = 0;
    sessionStorage.setItem("query", JSON.stringify(runQuery, null, 2));
    var formData = new Object();
    //  formData.elasticdata = JSON.stringify(runQuery, null, 2);
    formData.elasticdata = runQuery;
    formData.resturl = "unifotobase/billede/_search";
    postPhpMain(formData, fillResult);
}
function fillResult(data) {
    document.getElementById('resultTable').innerHTML = "";
    resultElastic = new ElasticClass(data);
    var docs = resultElastic.getDocs();
    if (docs.length == 1) {
        //    window.location.href="gjenstand.html?id="+resultElastic.getSingleFieldFromDoc(docs[0], "museumKey");
        //   return;
    }
    //mediagruppe_enhets_id 
    for (var temp = 0; temp < docs.length; temp++) {
        //    var pA = resultElastic.getArrayFromDoc(docs[temp], "fotos"); Foto-fil
        var gj = resultElastic.getSingleFieldFromDoc(docs[temp], "motiv"); //xxxxx
        //    if (pA.length == 0)
        if (gj == "")
            gj = resultElastic.getSingleFieldFromDoc(docs[temp], "sted"); //xxxxx
        if (gj == "")
            gj = resultElastic.getSingleFieldFromDoc(docs[temp], "alledata");
        insertInResultTable(resultElastic.getSingleFieldFromDoc(docs[temp], "mediagruppe_enhets_id"), "resultTable", resultElastic.getSingleFieldFromDoc(docs[temp], "filnavn"), temp, resultElastic.getSingleFieldFromDoc(docs[temp], "foto_kort_id"), gj, columnsInResult, "175px", "small");
        //  else
        //    insertInResultTable("resultTable", pA[0], temp, resultElastic.getSingleFieldFromDoc(docs[temp], "museumKey"), gj[0], columnsInResult, "150px", "small");
    }
    setTraversalDiv();
}
function insertContentIntoRelationTable(table, content) {
    if (content == "")
        return;
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    cell1.innerHTML = content;
}
function postPhpMain(formData, callBack) {
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
/*
function postPhpMain(formData, callBack) {
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
function insertInResultTable(mediegruppeId, tableId, filename, nr, id, name, cellsprRow, width, type) {
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
    cell1.setAttribute("style", "vertical-align:top;");
    //    var img = "<img  onload='calcPhotoSize(150,200,\"img" + nr + "\")' id='img" + nr + "' src='http://www.unimus.no/felles/bilder/web_hent_bilde.php?filename=" + encodeURIComponent(filename) + "&type=" + type + "' height=" + width + "/>";
    //https://nabu.usit.uio.no/muv/mediagroups/12483244/image?type=small
    var img = "<img  onload='calcPhotoSize(150,200,\"img" + nr + "\")' id='img" + nr + "' src='https://nabu.usit.uio.no/muv/mediagroups/" + mediegruppeId + "/image?type=" + type + "' height=" + width + "/>";
    var aref = "<a target='_blank' href='foto.html?id=" + id + "'>" + img + "</a>";
    if (name.length > 30)
        name = name.substring(0, 30) + "..";
    cell1.innerHTML = name + "<br>" + aref;
}
function setTraversalDiv() {
    var nrOfDocs = resultElastic.getDocCount();
    document.getElementById('zeroButtonId').disabled = false;
    if (pagePos == 0)
        document.getElementById('prevButtonId').disabled = true;
    else
        document.getElementById('prevButtonId').disabled = false;
    if ((pagePos + pageSize) >= nrOfDocs)
        document.getElementById('nextButtonId').disabled = true;
    else
        document.getElementById('nextButtonId').disabled = false;
    var to = pagePos + pageSize;
    if (to > nrOfDocs)
        to = nrOfDocs;
    var str = (pagePos + 1) + "-" + to + "  antall fotos ut av " + nrOfDocs;
    if (nrOfDocs == 0)
        str = "Ingen foto funnet";
    document.getElementById('traversalLabel').innerHTML = str;
}
function move(i) {
    var toMove = (i * pageSize) + pagePos;
    if (toMove < 0)
        toMove = 0;
    runQuery.from = toMove;
    sessionStorage.setItem("query", JSON.stringify(runQuery, null, 2));
    pagePos = toMove;
    var formData = new Object();
    //  formData.elasticdata = JSON.stringify(runQuery, null, 2);
    formData.elasticdata = runQuery;
    formData.resturl = "unifotobase/billede/_search";
    postPhpMain(formData, fillResult);
}
function setToZero() {
    document.getElementById("inputField").value = "";
    document.getElementById("fieldSearch").value = "";
    document.getElementById("filnavn").value = "";
    document.getElementById("fieldSearchSelect").value = "";
    document.getElementById("keywordList").value = "";
    document.getElementById("fromDate").value = "";
    document.getElementById("toDate").value = "";
    document.getElementById("button1").checked = true;
    //  (<HTMLSelectElement>document.getElementById('keywordList')).value = ""; 
    search();
}
function setUpWheelWords(query, str) {
    var q = str.replace(spaceSplitter, "####");
    var lemmaList = q.split("####");
    if (lemmaList.length == 0)
        return;
    wordListQuery.tags.terms.include = lemmaList[lemmaList.length - 1] + ".*";
    for (var temp = 0; temp < lemmaList.length - 1; temp++) {
        var f = new Object();
        var ob = new Object();
        f.alledata = lemmaList[temp];
        ob.match = f;
        query.query.bool.must.push(ob);
    }
    return query;
}
//-----------------------------wheel functions
function changeWordwheel(event) {
    if (wheelInstance.handleWheel(event) == true)
        return;
    var str = document.getElementById('inputField').value;
    if (str.length > 1) {
        var query = createQuery(false);
        query = setUpWheelWords(query, str);
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
                wheelInstance.fillFacets(ar);
            },
            dataType: "json"
        });
    }
    else {
        wheelInstance.clearUl();
        wheelInstance.hideOverlay();
    }
}
function lookupIndex(string) {
    var pos = document.getElementById('inputField').value.indexOf(string);
    if (pos == -1)
        document.getElementById('inputField').value = wheelInstance.replaceLastWord(document.getElementById('inputField').value, string);
    wheelInstance.hideOverlay();
    search();
}
function resize() {
    if (wheelInstance != null) {
        wheelInstance.followObject(document.getElementById('inputField'), 0, 24);
    }
    var gridContainer = document.getElementById("gridContainer");
    gridContainer.style.height = window.innerHeight + "px";
    var footElement = document.getElementById("app-footer");
    footElement.style.width = window.innerWidth - (50) + "px";
    var resultdiv = document.getElementById('resultDiv');
    if (resultdiv.clientHeight < 1000)
        rowsInResult = Math.round(resultdiv.clientHeight / 225);
    else
        rowsInResult = Math.round(1000 / 225);
    columnsInResult = Math.round(resultdiv.clientWidth / 250);
    defaultObj.size = Math.round(columnsInResult * rowsInResult);
    pageSize = defaultObj.size;
    if (runQuery != null) {
        runQuery.size = pageSize;
        move(0);
    }
}
function calcPhotoSize(height, width, photoId) {
    height -= 10;
    width -= 10;
    var oldHeight = document.getElementById(photoId).height;
    var oldWidth = document.getElementById(photoId).width;
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
function qLookForFileName(event) {
    if (event.keyCode == 13) {
        search();
        return;
    }
}
function publishCommand() {
    var res = confirm('Ønsker du at publisere endringerne?');
    if (res == false)
        return;
    alert('Fotobasen vil nu blive publisert med alle endringer\nTa en kopp kaffe!');
    var formData = new Object();
    formData.command = Tools.publishCommand;
    $.ajax({
        url: Tools.urlToNode + "runCmd",
        type: 'post',
        data: formData,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
        },
        success: function (data) {
            alert(data);
        }
    });
}
function getActiveIndex() {
    $.ajax({
        url: Tools.urlToNode + "fotobase",
        type: 'get',
        //        data: body,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
        },
        success: function (data) {
            var key = "";
            for (key in data)
                break;
            alert(key);
        },
        dataType: "json"
    });
}
