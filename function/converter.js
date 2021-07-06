
const numberValidation = (number) => {
    let inputNomor =  number
    let hasilNomor = '';
    if(inputNomor.startsWith("0")){
        if(inputNomor.startsWith("0")) hasilNomor = inputNomor.replace("0", "62");
        else hasilNomor = inputNomor
    }
    else hasilNomor = inputNomor.replace("+", "")
    while(hasilNomor.match("-")) hasilNomor = hasilNomor.replace("-", "")
    while(hasilNomor.match(" ")) hasilNomor = hasilNomor.replace(" ", "")
    for(let i = 0; i < 4; i++){
        hasilNomor = hasilNomor.replace("(", "")
        hasilNomor = hasilNomor.replace(")", "")
    }
    let userId = hasilNomor+"@c.us";
    return userId
}

module.exports = {
    numberValidation
}

