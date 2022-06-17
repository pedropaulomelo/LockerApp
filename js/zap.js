require('dotenv/config');

function qrGen(data_qr){
  var options = {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data_qr)
};
    fetch(process.env.API_QR+'/insert',options)
}

async function whatstxt(comp,number){
    const msg = "Olá! Você acaba de receber uma encomenda no compartimento "+comp+" do CoreTechs Locker localizado no Condomínio New Tower. Para receber, basta efetuar acessar o link abaixo e efetuar a leitura do QRCode, ou digitando a senha abaixo." 
  const response = await fetch(process.env.API_ZAP+'/sendText', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'sessionkey': process.env.SESSION_KEY
    },
    body: JSON.stringify(
        {
            "session": process.env.SESSION_NAME, 
            "number": number,
            "text":msg
        }
    )
  });
  const content = await response.json();
  
  console.log(content);
  };  
  
  async function whatspass(pass,number){
  const response = await fetch(process.env.API_ZAP+'/sendText', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'sessionkey': process.env.SESSION_KEY
    },
    body: JSON.stringify(
        {
            "session": process.env.SESSION_NAME,
            "number": number,
            "text":pass
        }
    )
  });
  const content = await response.json();
  
  console.log(content);
  };  
  
  async function whatsQR(url,number){
  const response = await fetch(process.env.API_ZAP+'/sendLink', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'sessionkey': process.env.SESSION_KEY
    },
    body: JSON.stringify(
        {
            "session": process.env.SESSION_NAME,
            "number": number,
            "url":url,
            "text":"Acesse este link para gerar o QRCode"
        }
    )
  });
  const content = await response.json();
  
  console.log(content);
  };  