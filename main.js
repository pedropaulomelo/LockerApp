const { app, BrowserWindow, nativeImage } = require("electron");

// Habilita o live reload no Electron e no FrontEnd da aplicação com a lib electron-reload
// Assim que alguma alteração no código é feita
require("electron-reload")(__dirname, {
  // Note that the path to electron may vary according to the main file
  electron: require(`${__dirname}/node_modules/electron`),
});

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
    fullscreen: true,
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

const { response } = require('express');
const express = require('express');
const res = require('express/lib/response');

const {SerialPort} = require("serialport");
const { ReadlineParser } = require('@serialport/parser-readline')
const port = new SerialPort({path: "COM9", baudRate: 9600});
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
//const parser = new ReadlineParser();
//port.pipe(parser);

const server = express();

server.listen(3000, () => console.log('listening at 3000'));


//server.post('/status', async (request, response) => {
  //const data = request.body;
  //const comp = data.open;
  //port.write("status:"+comp);
  //console.log("status:"+comp);
  //parser.on("data", (line) => {
  //  const status = line;
  //  console.log(status);
  //  if(status === "open"){
  //    console.log("Já está aberto");
  //    } else {
  //      if(status === "close"){
  //        console.log("Abrindo...");
  //      }
  //    }
  //  });
  //}); 

  server.post('/open', async (request, response) => {
  //console.log(request.body)
  //const comp = request.body.comp;
  port.write("o:1")
  //port.write("o:"+comp);
  //console.log("open:"+comp);
  parser.on("data", async function(line){
  //  const status = ""+line; 
    console.log(line);
    await response.json(line)
  });
});

