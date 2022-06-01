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

auth_get();

async function auth_get(){
    var sessionId = sessionStorage.getItem("sessionId");
    var token = sessionStorage.getItem("token");
     
    var get_ip = await fetch('https://api.ipify.org?format=json');
    var ret = await get_ip.json();
    var ip = ret.ip

    if(sessionId && token && ip){
        auth(sessionId,token,ip)
    } else {
        //window.location.replace("login.html")
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

var server = 'https://interno.locker.coretechs.com.br'