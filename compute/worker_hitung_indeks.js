module.exports = function(input, managerCallback) {
    
    var nilaiIndeks = [];
    var nData = input[0].nilai.length;
    nilaiIndeks.length = nData;
    for(var i = 0; i < nData; i++) {nilaiIndeks[i] = 0;}
    for(var i = 0; i < input.length; i++) {
        for(var j = 0; j < nData; j++) {
            nilaiIndeks[j] += input[i].bobot * input[i].nilai[j];
        }
    }    
    
    managerCallback(null, nilaiIndeks);
    
};
