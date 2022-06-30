const { app, BrowserWindow, nativeImage } = require("electron");

// Habilita o live reload no Electron e no FrontEnd da aplicação com a lib electron-reload
// Assim que alguma alteração no código é feita
//require("electron-reload")(__dirname, {
  // Note that the path to electron may vary according to the main file
  //electron: require(`${__dirname}/node_modules/electron`),
//});

// Função que cria uma janela desktop
function createWindow() {
  // Adicionando um ícone na barra de tarefas/dock
  const icon = nativeImage.createFromPath(`${app.getAppPath()}/build/icon.png`);

  if (app.dock) {
    app.dock.setIcon(icon);
  }

  // Cria uma janela de desktop
  const win = new BrowserWindow({
    icon,
    width: 1024,
    heigth: 600,
    //fullscreen: true,
    frame: false,
    webPreferences: {
      // habilita a integração do Node.js no FrontEnd
      nodeIntegration: true, // to allow require
      contextIsolation: false, // allow use with Electron 12+
    },
  });

  // carrega a janela com o conteúdo dentro de index.html
  win.loadFile("index.html");

  // Abre o console do navegador (DevTools),
  // manter apenas quando estiver desenvolvendo a aplicação,
  // pode utilizar variáveis de ambiente do node para executar esse código apenas quando estiver em modo DEV
  win.webContents.openDevTools();
}

// Método vai ser chamado assim que o Electron finalizar sua inicialização
// e estiver pronto para abrir e manipular o nosso código.
// Algumas APIs podem ser usadas somente depois que este evento ocorre.
app.whenReady().then(createWindow);

// Quando clicarmos no botão de fechar a janela no app desktop
// O evento vai ser ouvido aqui no arquivo main.js e algum procedimento pode ser realizado
// tipo fechar alguma conexão de banco de dados por exemplo.
app.on("window-all-closed", () => {
  // No MacOS quando fecha uma janela, na verdade ela é "minimizada"
  // e o processo executa em segundo-plano tipo um app do celular
  // Para fechar e encerrar o app tem que teclar Cmd+Q ou no dock (barra de tarefas)
  // clicar com botão direito e encerrar o app
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // Esse evento é disparado pelo MacOS quando clica no ícone do aplicativo no Dock.
  // Basicamente cria a janela se não foi criada.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const {ipcMain} = require('electron');

var  Datastore = require('nedb');

require('dotenv/config');

const fetch = require('electron-fetch').default

//var LocalStorage = require('node-localstorage').LocalStorage;

//localStorage = new LocalStorage('./localStorage');

const {SerialPort} = require("serialport");
//const { ReadlineParser } = require('@serialport/parser-readline');
const fs = require('fs');

const port_str = process.env.PORT;

const port = new SerialPort({path: port_str, baudRate: 9600});
//const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))


const db_comp = new Datastore('db_comp.db');
const db_locker = new Datastore('db_locker.db');
const db_correios = new Datastore('db_correios.db');
const db_entregas = new Datastore('db_entregas.db');
const db_ap = new Datastore('db_ap.db');
const db_session = new Datastore('db_session.db');
const db_users = new Datastore('db_users.db');
const db_changes = new Datastore('db_changes.db');

db_comp.loadDatabase();
db_locker.loadDatabase();
db_correios.loadDatabase();
db_entregas.loadDatabase();
db_ap.loadDatabase();
db_session.loadDatabase();
db_users.loadDatabase();
db_changes.loadDatabase();


time = Date.now();

function clock(){
  clocktime = time+1000;
  time = clocktime;
};

clock();
setInterval(clock,1000);

ipcMain.on('get_clock', (event,get) => {
  event.reply('get_clock_response', clocktime)
})

function gerarEntregaID(length) {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJLMNOPQRSTUVWXYZ";
  var token = "";

  for (var i = 0; i < length; i++) {
    var randomNumber = Math.floor(Math.random() * chars.length);
    token += chars.substring(randomNumber, randomNumber + 1);
  }
  return token
}

function gerarToken(length) {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJLMNOPQRSTUVWXYZ!@#$*";
  var token = "";

  for (var i = 0; i < length; i++) {
    var randomNumber = Math.floor(Math.random() * chars.length);
    token += chars.substring(randomNumber, randomNumber + 1);
  }
  return token
}
//----------------------------------------------------------------------------------------------------------------
var sessionId = false;
var token = false;
var server = process.env.SERVER;

var locker_cod = process.env.LOCKER_COD;
var locker_key = process.env.LOCKER_KEY;
console.log(`Locker: ${locker_cod}`)
console.log(`Locker key: ${locker_key}`)
console.log(`Server adress: ${server}`)
//----------------------------------------------------------------------------------------------------------------

async function authLocker(){
console.log("Iniciando auth function")
  const data = {locker_cod,locker_key};

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
      sessionId = false;
      token = false; 
      console.log("not authenticated")
      return
  }else{
      sessionId = retorno.sessionId;
      token = retorno.token;
      console.log("Authentication complete")
      console.log('sessionId: '+sessionId+' - token: '+token)
  }
}


async function authLocker_check(){
console.log("Checking session status")
  const data = {sessionId,token};

  const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  console.log("credentials to send...")  
  console.log(data)

  const response = await fetch(server+'/auth_check/locker',options);
  const retorno = await response.json();

  console.log("Session status: "+retorno)

  if(!retorno){
    console.log("Session false! Calling auth function...")
      await authLocker();
  }else if(retorno){
    console.log("Auth OK")
      return
  }
}


authLocker_check();

setInterval(async function(){
  await authLocker_check();
}
,60000)

authLocker_check();

setInterval(async function(){
  await sync();
}
,60000)

async function sync(){
  console.log("Sincronizando com o servidor")
  db_changes.find({}, async(err,data) => {
    console.log(data)
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

  const response = await fetch(server+'/sync',options);
  const retorno = await response.json()
  console.log(retorno)
  
  db_changes.remove({}, { multi: true }, function (err, numRemoved) {
    console.log(numRemoved);
  });

  })
  }

ipcMain.on('get_apartamentos',(event,request)=>{
  db_ap.find({}).sort({ ap: 1 }).exec(function (err, data) {
    const response = JSON.stringify(data)
    event.reply('get_apartamentos_response',response)
  });
})

ipcMain.on('get_compDisp',(event,size)=>{
  db_comp.find({sit:"DISPONÍVEL",size:size}).sort({ comp: 1 }).exec(function (err, data) {
    const response = JSON.stringify(data)
    event.reply(`get_compDisp${size}_response`,response)
  });
})

ipcMain.on('get_locker',(event,size)=>{
  db_locker.find({}, (err, data) => {
    const response = JSON.stringify(data)
    event.reply('get_locker_response',response)
  });
})

ipcMain.on('get_lockerAlterar', (event, data) => {
  var cod = data.cod; 
  var logradouro = data.logradouro;
  var numero = data.numero;
  var complemento = data.complemento;
  var cep = data.cep;
  var data = {cod,logradouro,numero,complemento,cep}
  db_locker.update({cod:cod},{$set:{logradouro:logradouro,numero:numero,complemento:complemento,cep:cep}},{multi:false})
})

ipcMain.on('get_open',(event,comp)=>{
  port.write("o:"+comp);
  console.log("open:"+comp);
  event.reply(`get_open_response`,true)
})

ipcMain.on('get_entrega',(event, request) => {

  var pass = gerarEntregaID(6);
  var qrCode = gerarToken(24);
  var entregaId = gerarEntregaID(16); 
  var data = JSON.parse(request);

  var dataComp = data.comp;
  var dataAp = data.ap;
  var timestamp = clocktime;
  data.timestamp = timestamp;
  data.entregaId = entregaId;
  data.pass = pass;
  data.qrCode = qrCode;
  data.sit = "";
  data.tipo = 'outros';
  db_entregas.insert(data);

  //-------------------------------------------------
  var db = 'db_entregas';
  var action = 'insert';
  var metadata = {locker_cod,db,action};
  const status = true;
  var data_changes = {status,metadata,data}
  db_changes.insert(data_changes)
  //-------------------------------------------------

  db_comp.update({comp:dataComp},{$set:{sit:'OCUPADO',entregaId:entregaId,date:timestamp,ap:dataAp}},{multi:true});

    //-------------------------------------------------
    db_comp.find({comp:dataComp}, (err, data_comp) => {
      var db = 'db_comp';
      var action = 'update';
      var metadata = {locker_cod,db,action}
      const data = data_comp[0];
      const status = true;
      var data_changes = {status,metadata,data}
      db_changes.insert(data_changes)
    })
    //-------------------------------------------------

  db_ap.find({ap:dataAp}).sort({ comp: 1 }).exec(async function (err, retorno) {
  var number = retorno[0].tel;
  var comp = dataComp;
  var hoje = new Date(clocktime);
  var date_rec = hoje.setDate(hoje.getDate() + 3);

  var apiQR = process.env.API_QR;
  var url = apiQR+"/qrGen/"+entregaId;

  var data_qr = {entregaId,comp,timestamp,date_rec,pass,qrCode};
  var data_zap = {number,pass,url};
  var data_obj_send = {data_qr,data_zap};
  var data_send = JSON.stringify(data_obj_send)

  event.reply('get_entrega_response', data_send)

})
})

ipcMain.on('get_entregaCorreios',(event, request) => {

  var pass = gerarEntregaID(6);
  var qrCode = gerarToken(24);
  var entregaId = gerarEntregaID(16); 
  var data = JSON.parse(request);

  var credencial = data.credencial;
  var dataComp = data.comp;
  var dataAp = data.ap;
  var timestamp = clocktime;
  data.credencial = credencial;
  data.timestamp = timestamp;
  data.entregaId = entregaId;
  data.pass = pass;
  data.qrCode = qrCode;
  data.sit = "";
  data.tipo = 'correios'
  db_entregas.insert(data);

    //-------------------------------------------------
    var db = 'db_entregas';
    var action = 'insert';
    var metadata = {locker_cod,db,action}
    var data_changes = {metadata,data}
    db_changes.insert(data_changes)
    //-------------------------------------------------

  db_comp.update({comp:dataComp},{$set:{sit:'OCUPADO',entregaId:entregaId,date:timestamp,ap:dataAp}},{multi:true});

      //-------------------------------------------------
      db_comp.find({comp:dataComp}, (err, data_comp) => {
        var db = 'db_comp';
        var action = 'update';
        var metadata = {locker_cod,db,action}
        const data = data_comp[0]
        const status = true;
        var data_changes = {status,metadata,data}
        db_changes.insert(data_changes)
      })
      //-------------------------------------------------

  db_ap.find({ap:dataAp}).sort({ comp: 1 }).exec(async function (err, retorno) {
  var number = retorno[0].tel;
  var comp = dataComp;
  var hoje = new Date(clocktime);
  var date_rec = hoje.setDate(hoje.getDate() + 3);

  var apiQR = process.env.API_QR;
  var url = apiQR+"/qrGen/"+entregaId;

  var data_qr = {entregaId,comp,timestamp,date_rec,pass,qrCode};
  var data_zap = {number,pass,url};
  var data_obj_send = {data_qr,data_zap};
  var data_send = JSON.stringify(data_obj_send)

  event.reply('get_entregaCorreios_response', data_send)

})
})

ipcMain.on('get_pass', (event, pass) => {
      db_entregas.find({"pass":pass}, (err, retorno) => {
        var entregaId = retorno[0].entregaId;
        const timestamp = clocktime;
        db_comp.update({entregaId:entregaId},{$set:{sit:'DISPONÍVEL',entregaId:"",date:"0",ap:"",pointer:true}},{multi:false});

    //-------------------------------------------------
    db_comp.find({pointer:true}, (err, data_comp) => {
      var db = 'db_comp';
      var action = 'update';
      var metadata = {locker_cod,db,action}
      const data = data_comp[0];
      var data_changes = {metadata,data};
      db_changes.insert(data_changes);
    })
    //-------------------------------------------------
    db_comp.update({pointer:true},{$set:{pointer:false}},{multi:true});

        db_entregas.update({entregaId:entregaId},{$set:{sit:timestamp}},{multi:false});

    //-------------------------------------------------
    db_entregas.find({entregaId:entregaId}, (err, data_entregas) => {
      var db = 'db_entregas';
      var action = 'update';
      var metadata = {locker_cod,db,action}
      const data = data_entregas[0]
      const status = true;
      var data_changes = {status,metadata,data}
      db_changes.insert(data_changes)
    })
    //-------------------------------------------------

        event.reply('get_pass_response', retorno);
    });
})

ipcMain.on('get_qr', (event, qrCode) => {
      db_entregas.find({"qrCode":qrCode}, (err, retorno) => { 
        if(retorno.length>0){
          var sit = retorno[0].sit;
          if(sit!=""){
            var erro = "";
            event.reply('get_qr_response', erro)
          } else {
            var entregaId = retorno[0].entregaId;
            const timestamp = clocktime;
            db_comp.update({entregaId:entregaId},{$set:{sit:'DISPONÍVEL',entregaId:"",date:"0",ap:"",pointer:true}},{multi:false});

            //-------------------------------------------------
            db_comp.find({pointer:true}, (err, data_comp) => {
              var db = 'db_comp';
              var action = 'update';
              var metadata = {locker_cod,db,action}
              const data = data_comp[0];
              var data_changes = {metadata,data};
              db_changes.insert(data_changes);
            })
            //-------------------------------------------------
            db_comp.update({pointer:true},{$set:{pointer:false}},{multi:true});

            db_entregas.update({entregaId:entregaId},{$set:{sit:timestamp}},{multi:false});

    //-------------------------------------------------
    db_entregas.find({entregaId:entregaId}, (err, data_entregas) => {
      var db = 'db_entregas';
      var action = 'update';
      var metadata = {locker_cod,db,action}
      const data = data_entregas[0]
      const status = true;
      var data_changes = {status,metadata,data}
      db_changes.insert(data_changes)
    })
    //-------------------------------------------------

            event.reply('get_qr_response', retorno)
          }
    }
  })
})

ipcMain.on('get_user', (event, data) => {
  var data_obj = JSON.parse(data);
  var user = data_obj.user;
  var pass = data_obj.pass;

  db_users.find({user:user}, (err, retorno) => {
    var pass_user;
    var perfil;
    if(retorno!=""){
      pass_user = retorno[0].pass;
      perfil = retorno[0].perfil;
      if(pass===pass_user){
        var type = "user";
        var sessionUserId = gerarToken(8);
        var tokenUser = gerarToken(16);
        var timestamp = Date.now();
        var status = true;
        var data = {type,sessionUserId,tokenUser,timestamp,status,user,perfil}

        db_session.insert(data);
        var data_send = JSON.stringify(data)
        event.reply('get_user_response', data_send)
      } else {
        var tokenUser = false;
        var sessionUserId = false;
        var status = false;
        var data = {sessionUserId,tokenUser,status}
        var data_send = JSON.stringify(data)
        event.reply('get_user_response', data_send)
      }
    } else {
      var tokenUser = false;
      var sessionUserId = false;
      var status = false;
      var data = {sessionUserId,tokenUser,status}
      var data_send = JSON.stringify(data)
      event.reply('get_user_response', data_send)
    }
  })
})

ipcMain.on('get_insertAp', (event, data) => {
  console.log(data)
  db_ap.insert(data);
})

ipcMain.on('get_editAp', (event, data) => {
  console.log(data)
  const ap = data.ap;
  const morador = data.morador;
  const tel = data.tel;
  db_ap.update({ap:ap},{$set:{morador:morador,tel:tel}},{multi:false});

      //-------------------------------------------------
      db_ap.find({ap:ap}, (err, data_ap) => {
        var db = 'db_ap';
        var action = 'update';
        var metadata = {locker_cod,db,action}
        const data = data_ap[0];
        var data_changes = {metadata,data};
        db_changes.insert(data_changes);
      })
      //-------------------------------------------------
})

ipcMain.on('get_deleteAp', (event, ap) => {
  db_ap.remove({ap:ap},(err, data) => {});

        //-------------------------------------------------
          var db = 'db_ap';
          var action = 'delete';
          var metadata = {locker_cod,db,action}
          const data = ap;
          const status = true;
          var data_changes = {status,metadata,data};
          db_changes.insert(data_changes);
        //-------------------------------------------------
})

ipcMain.on('get_clockAdjust', (event, newtime) => {
  time = newtime;
})

ipcMain.on('get_clockAdjustAuto', async(event, newtime) => {
  time = newtime;
})

ipcMain.on('get_compartimentos', (event, get) => {
  db_comp.find({}).sort({ comp: 1 }).exec(function (err, data) {
    event.reply('get_compartimentos_response',data)
  });
})

ipcMain.on('get_receberAdm', (event, entregaId) => {
  const timestamp = clocktime;
  db_comp.update({entregaId:entregaId},{$set:{sit:'DISPONÍVEL',entregaId:"",date:"0",ap:"",pointer:true}},{multi:false});

    //-------------------------------------------------
    db_comp.find({pointer:true}, (err, data_comp) => {
      var db = 'db_comp';
      var action = 'update';
      var metadata = {locker_cod,db,action}
      const data = data_comp[0];
      var data_changes = {metadata,data};
      db_changes.insert(data_changes);
    })
    //-------------------------------------------------

    db_comp.update({pointer:true},{$set:{pointer:false}},{multi:true});

  db_entregas.update({entregaId:entregaId},{$set:{sit:timestamp}},{multi:false});

    //-------------------------------------------------
    db_entregas.find({entregaId:entregaId}, (err, data_entregas) => {
      var db = 'db_entregas';
      var action = 'update';
      var metadata = {locker_cod,db,action}
      const data = data_entregas[0]
      const status = true;
      var data_changes = {status,metadata,data}
      db_changes.insert(data_changes)
    })
    //-------------------------------------------------

})

ipcMain.on('get_lock', (event, data) => {
  var sit_pre = data.sit_pre;
  var comp = data.comp;;
  var sit;
  if(sit_pre==="L"){
    sit = "BLOQUEADO"
  } else {
    sit = "DISPONÍVEL"
  }
  db_comp.update({comp:comp},{$set:{sit:sit}},{multi:false}); 

  //-------------------------------------------------
  db_comp.find({comp:comp}, (err, data_comp) => {
    var db = 'db_comp';
    var action = 'update';
    var metadata = {locker_cod,db,action}
    const data = data_comp[0];
    const status = true;
    var data_changes = {status,metadata,data};
    db_changes.insert(data_changes);
  })
  //-------------------------------------------------
})

ipcMain.on('get_compInsert', (event, size) => {
  db_comp.count({}, function(err, count) {
    var comp = String(count + 1);
    var sit = "DISPONÍVEL"
    var entregaId = "";
    var date = "0";
    var ap= "";
    var data = {comp,size,sit,entregaId,date,ap}
    db_comp.insert(data);

  //-------------------------------------------------
    var db = 'db_comp';
    var action = 'insert';
    var metadata = {locker_cod,db,action}
    const status = true;
    var data_changes = {status,metadata,data};
    db_changes.insert(data_changes);
  //-------------------------------------------------
  });
})

ipcMain.on('get_log', (event, data_log) => {
  var route = data_log.route;


  if(route==='/log'){
    var data = [];
  db_entregas.find({}).sort({ timestamp: 1 }).exec(function (err, data_entregas) {
    for(i=0;i<data_entregas.length;i++){
      var tipo = data_entregas[i].tipo;
      var entregaId = data_entregas[i].entregaId;
      var ap = data_entregas[i].ap;
      var comp = data_entregas[i].comp
      var sit = data_entregas[i].sit;
      var timestamp = data_entregas[i].timestamp;
      var row = {tipo,entregaId,ap,comp,sit,timestamp};
      data.push(row);
      event.reply('get_log_response', data)
    }
  });
  }


  if(route==='/log/ap'){
    var data = [];
  var ap = data_log.data.ap;
  db_entregas.find({ap:ap}).sort({ timestamp: 1 }).exec(function (err, data_entregas) {
    for(i=0;i<data_entregas.length;i++){
      var tipo = data_entregas[i].tipo;
      var entregaId = data_entregas[i].entregaId;
      var ap = data_entregas[i].ap;
      var comp = data_entregas[i].comp
      var sit = data_entregas[i].sit;
      var timestamp = data_entregas[i].timestamp;
      var row = {tipo,entregaId,ap,comp,sit,timestamp};
      data.push(row);
      event.reply('get_log_response', data);
    }
  });
  }


  if(route==='/log/data'){
    var data = [];
    var data_from = data_log.data.data_from;
    var data_to = data_log.data.data_to;
    db_entregas.find({timestamp:{$gte:data_from,$lte:data_to}}).sort({ timestamp: 1 }).exec(function (err, data_entregas) {
      for(i=0;i<data_entregas.length;i++){
        var tipo = data_entregas[i].tipo;
        var entregaId = data_entregas[i].entregaId;
        var ap = data_entregas[i].ap;
        var comp = data_entregas[i].comp
        var sit = data_entregas[i].sit;
        var timestamp = data_entregas[i].timestamp;
        var row = {tipo,entregaId,ap,comp,sit,timestamp};
        data.push(row);
        event.reply('get_log_response', data);
      }
    });
  }
  
  
  if(route==='/log/ap_data'){
  var data = [];
  var ap = data_log.data.ap;
  var data_from = data_log.data.data_from;
  var data_to = data_log.data.data_to;
  db_entregas.find({ap:ap, timestamp:{$gte:data_from,$lte:data_to}}).sort({ timestamp: 1 }).exec(function (err, data_entregas) {
    for(i=0;i<data_entregas.length;i++){
      var tipo = data_entregas[i].tipo;
      var entregaId = data_entregas[i].entregaId;
      var ap = data_entregas[i].ap;
      var comp = data_entregas[i].comp
      var sit = data_entregas[i].sit;
      var timestamp = data_entregas[i].timestamp;
      var row = {tipo,entregaId,ap,comp,sit,timestamp};
      data.push(row);
      event.reply('get_log_response', data);
    }
  });
  }
})

ipcMain.on('get_logCorreios', (event, data_log) => {
  var route = data_log.route;



  if(route==='/log/correios'){
    var data = [];
    db_entregas.find({tipo:'correios'}).sort({ timestamp: 1 }).exec(function (err, data_correios) {
      for(i=0;i<data_correios.length;i++){
        var credencial = data_correios[i].credencial;
        var entregaId = data_correios[i].entregaId;
        var ap = data_correios[i].ap;
        var comp = data_correios[i].comp
        var sit = data_correios[i].sit;
        var timestamp = data_correios[i].timestamp;
        var row = {credencial,entregaId,ap,comp,sit,timestamp};
        data.push(row);
      }
      event.reply('get_logCorreios_response', data)
    });
  }


  if(route==='/log/correios/ap'){
    var data = [];
  var ap = data_log.data.ap;
    db_entregas.find({tipo:'correios',ap:ap}).sort({ timestamp: 1 }).exec(function (err, data_correios) {
      for(i=0;i<data_correios.length;i++){
        var credencial = data_correios[i].credencial;
        var entregaId = data_correios[i].entregaId;
        var ap = data_correios[i].ap;
        var comp = data_correios[i].comp
        var sit = data_correios[i].sit;
        var timestamp = data_correios[i].timestamp;
        var row = {credencial,entregaId,ap,comp,sit,timestamp};
        data.push(row);
      }
      event.reply('get_logCorreios_response', data);
    });
  }


  if(route==='/log/correios/data'){
    var data = [];
    var data_from = data_log.data.data_from;
    var data_to = data_log.data.data_to;
      db_entregas.find({tipo:'correios', timestamp:{$gte:data_from,$lte:data_to}}).sort({ timestamp: 1 }).exec(function (err, data_correios) {
        for(i=0;i<data_correios.length;i++){
          var credencial = data_correios[i].credencial;
          var entregaId = data_correios[i].entregaId;
          var ap = data_correios[i].ap;
          var comp = data_correios[i].comp
          var sit = data_correios[i].sit;
          var timestamp = data_correios[i].timestamp;
          var row = {credencial,entregaId,ap,comp,sit,timestamp};
          data.push(row);
        }
        event.reply('get_logCorreios_response', data);
      });
  }
  
  
  if(route==='/log/correios/ap_data'){
    var data = [];
  var ap = data_log.data.ap;
  var data_from = data_log.data.data_from;
  var data_to = data_log.data.data_to;
    db_entregas.find({tipo:'correios', ap:ap, timestamp:{$gte:data_from,$lte:data_to}}).sort({ timestamp: 1 }).exec(function (err, data_correios) {
      for(i=0;i<data_correios.length;i++){
        var credencial = data_correios[i].credencial;
        var entregaId = data_correios[i].entregaId;
        var ap = data_correios[i].ap;
        var comp = data_correios[i].comp
        var sit = data_correios[i].sit;
        var timestamp = data_correios[i].timestamp;
        var row = {credencial,entregaId,ap,comp,sit,timestamp};
        data.push(row);
      }
      event.reply('get_logCorreios_response', data);
    });
  }
})