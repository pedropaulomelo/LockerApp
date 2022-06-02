function createDiv(){
    $('.headers').append(`
<div id="clock"></div>
`)
}

setInterval(async function(){
    const response = await fetch(server+'/clock');
    var timestamp = await response.json();
    var clock = new Date(timestamp).toLocaleDateString() + " - " + new Date(timestamp).toLocaleTimeString()
    $('#clock').text(clock); 
},
100)

async function getIP(){
    var get_ip = await fetch('https://api.ipify.org?format=json');
      var ret = await get_ip.json();
      var ip = ret.ip
      return ip
  }

auth_get();
var sessionId;
var token;
var ip;

async function auth_get(){
    sessionId = sessionStorage.getItem("sessionId");
    token = sessionStorage.getItem("token");
    var ip = await getIP();

    const data = {sessionId,token,ip}

    if(sessionId && token && ip){
        auth(sessionId,token,ip)
    } else {
        window.location.replace("login.html")
    }
}

async function auth(sessionId,token,ip){
    const data = {sessionId,token,ip};

    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      };
    console.log(data)
    const response = await fetch(server+'/auth_check',options);
    const retorno = await response.json();
      console.log(retorno)
    const status = retorno;

    if(!status){
       window.location.replace("login.html")
    } else if(status){
        return
    }
}

function falha(){
    $('.content').html("");
    $('.content').append(`
    <div id="title">Falha na autenticação!<br>Favor, realizar login novamente.</div>
    `)
}

async function endSession(){
    var sessionId = sessionStorage.getItem("sessionId");
    var data = {sessionId}
    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      };

    const response = await fetch(server+'/endSession',options);
}

var server = "https://interno.locker.coretechs.com.br"