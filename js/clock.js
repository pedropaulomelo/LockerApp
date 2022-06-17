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
