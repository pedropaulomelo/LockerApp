async function auth_check_user(){

    var sessionUserId = sessionStorage.getItem("sessionUserId");
    var tokenUser = sessionStorage.getItem("tokenUser");
     
    var get_ip = await fetch('https://api.ipify.org?format=json');
    var ret = await get_ip.json();
    var ip = ret.ip
    const data = {sessionUserId,tokenUser,sessionId,token,ip};

    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      };
    console.log(data)
    const response = await fetch(server+'/auth_check_user',options);
    const retorno = await response.json();

    const status = retorno;

    if(!status){
        falha();
        setTimeout(() => {
            window.location.replace("main.html")
        },2500)
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

auth_check_user()