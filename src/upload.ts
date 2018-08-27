var rowList = null;
let columns = 0;
let returnMessage;
function uploadInitialize(){
  $(document).ready(function(){
   // do jQuery
  });
//  document.getElementById("inputArea").value = "";
}


let billedTemplate:any = {
    alledata:"",
    annen_info:"",
    bruker:"",
    datering_fra:"",
    datering_til:"",
    eksternKommentar:"",
    fra_År:0,
    til_År:0,
    internKommentar:"",
    koblinger:[],
    motiv:"",
    old_foto_kort_id:-1,
    old_mediagruppe_enhets_id:-1,
    personText:[],
    persondata:[],
    sjanger:"",
    sted:"",
    stedListe:"",
    stedkommentar:"",
    user:""
 }

function cloneJSON(obj) {
    // basic type deep copy
    if (obj === null || obj === undefined || typeof obj !== 'object')  {
        return obj
    }
    // array deep copy
    if (obj instanceof Array) {
        var cloneA = [];
        for (var i = 0; i < obj.length; ++i) {
            cloneA[i] = cloneJSON(obj[i]);
        }              
        return cloneA;
    }                  
    // object deep copy
    var cloneO = {};   
    for (let i in obj) {
        cloneO[i] = cloneJSON(obj[i]);
    }                  
    return cloneO;
}





function cleanString(str){
  str = str.replace(/\t/g," ");
  str = str.replace(/\n/g," ");
  str = str.replace(/\r/g," ");
  return str;
}


function upload(){
  returnMessage = "";
  (<HTMLInputElement>document.getElementById('outputArea')).value = returnMessage;
  let jump = 0;  
  rowList = (<HTMLInputElement>document.getElementById('inputArea')).value.split("\n");
  if(rowList.length < 1){
    alert('invalid input');
    return;
  }
  if(rowList.length == 1 && rowList[0] == "")
  {
    alert('invalid input');
    return;
  }
  let arr = rowList[0].split("\t");
  columns = arr.length;
  for(let temp = 1;temp <rowList.length;temp++){
      arr = rowList[temp].split("\t");
      if(arr.length == 1 && rowList[temp]==""){
        jump++;  
        continue;
      }  
      if(arr.length != columns){
          alert("Mismatch med antal kolonner på linie " + (temp+1) );
          return;
      }  
  }
  if(confirm("Antal rækker er " + (rowList.length-jump) +" og antal kolonner er " + columns + ". Ønsker du at fortsætte?")==false)
    return;
  insertColumns(0);
}

function insertColumns(index){
    if(index==rowList.length){
      alert("Import færdig");
      (<HTMLInputElement>document.getElementById('outputArea')).value = returnMessage;
      return;
    }
    let arr = rowList[index].split("\t");
    if(arr.length != columns){
        returnMessage += rowList[index] + ": Fejl antal kolonner\n";
        (<HTMLInputElement>document.getElementById('outputArea')).value = returnMessage;
        insertColumns(index+1);
        return;
    }
    if(arr[0]== ""){
        insertColumns(index+1);
        return;
    }
    let url = "http://musit-win-p01.uio.no/api/media/filenames/uploadedTo?filename="+arr[0];
    let formData:any = new Object();
    formData.url = url;
    $.ajax({
        url: Tools.urlToNode + "GetAnyURL",
        type: 'POST',
        data: formData,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
        },
        success: function (data) {
            validate(index,data);
        },
        dataType: "json"
    });

}
function validate(index,docData){
    if(docData.length == 0){
        returnMessage += rowList[index] + ": Billedfil eskisterer ikke\n";
        (<HTMLInputElement>document.getElementById('outputArea')).value = returnMessage;
        insertColumns(index+1);
        return;
    }
    if(docData.length >1){
        returnMessage += rowList[index] + ": Flere billedfiler med samme navn\n";
        (<HTMLInputElement>document.getElementById('outputArea')).value = returnMessage;
        insertColumns(index+1);
        return;
    }

    let url = Tools.urlToNode+"unifotobase/billede/_search?q=foto_kort_id:"+docData[0].rowId;
    $.ajax({
        url: url,
        type: 'GET',
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
        },
        success: function (data) {
            if(data.hits.hits.length > 0){
                returnMessage += rowList[index] + ": Post allerede opprettet\n";
                (<HTMLInputElement>document.getElementById('outputArea')).value = returnMessage;
                insertColumns(index+1);
                return;
            }
            insertPhoto(index,docData);
        },
        dataType: "json"
    });

}

function hentDato(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    let d = "";
    let m = "";
    
    if(dd<10) {
        d = '0'+dd
    }else
      d= ""+dd; 
    
    if(mm<10) {
        m = '0'+mm
    }else m= ""+mm 
    return yyyy+"-"+m+"-"+d;
}

function insertPhoto(index,data){
  returnMessage += rowList[index] + ": Oprettet\n";
  (<HTMLInputElement>document.getElementById('outputArea')).value = returnMessage;
  let obj= cloneJSON(billedTemplate);
  obj.mediagruppe_enhets_id = data[0].mediaGroupdId;
  obj.filnavn = data[0].filename;
  obj.foto_kort_id = data[0].rowId;
  obj.kan_webpubliseres="0";
  obj.registrert_dato = hentDato();
  obj.bruker="nypost";

  let formData:any = new Object();
  formData.foto_kort_id = obj.foto_kort_id;
  formData.content = obj;
  $.ajax({
      url: Tools.urlToNode + "insertPost",
      type: 'post',
      data: formData,
      error: function (XMLHttpRequest, textStatus, errorThrown) {
          alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
      },
      success: function (data) {
        alert(JSON.stringify(data,null,2));
        insertColumns(index+1);
    },
      dataType: "json"
  });



}