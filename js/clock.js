function createDiv(){
    $('.headers').append(`
<div id="clock"></div>
`)
}

setInterval(async function(){
    ipcRenderer.send('get_clock','GET');
},
100)

var server = "https://interno.locker.coretechs.com.br"

const {ipcRenderer} = require('electron');

ipcRenderer.on('get_clock_response', (event, clocktime) => {
    var clock = new Date(clocktime).toLocaleDateString() + " - " + new Date(clocktime).toLocaleTimeString()
    $('#clock').text(clock);
})

async function authLocker(){
    var locker_cod = process.env.LOCKER_COD;
    var locker_key = process.env.LOCKER_KEY;
    var server = process.env.SERVER;

    const data = {locker_cod,locker_key,ip};

    console.log(data)

    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      };

    const response = await fetch(server+'/auth/locker',options);
    const retorno = await response.json();
    console.log(retorno);
    
    if(!retorno){
        sessionStorage.setItem('sessionId','false');
        sessionStorage.setItem('token','false') 
        return
    }else{
        var sessionId = retorno.sessionId;
        var token = retorno.token;
    
        sessionStorage.setItem('sessionId',sessionId);
        sessionStorage.setItem('token',token)
    }
}

async function authLocker_check(){

    var sessionId = sessionStorage.getItem("sessionId");
    var token = sessionStorage.getItem("token");
    var server = process.env.SERVER;

    const data = {sessionId,token};

    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      };
    console.log(data)
    const response = await fetch(server+'/auth_check/locker',options);
    const retorno = await response.json();

    const status = retorno;

    if(!status){
        authLocker();
    } else if(status){
        return
    }
}