async function endSessionUser(){
    var sessionUserId = sessionStorage.getItem("sessionUserId");
    var tokenUser = sessionStorage.getItem("tokenUser");

    sessionStorage.setItem("sessionUserId",false);
    sessionStorage.setItem("tokenUser",false);
    sessionStorage.setItem("userLogged",false);
    sessionStorage.setItem("perfilUser",false);

    const data = {sessionUserId,tokenUser};
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

    fetch("https://interno.locker.coretechs.com.br/endSession_user",options)
}
endSessionUser();
