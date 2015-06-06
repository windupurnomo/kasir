var h = {
    // Generate WHERE berdasarkan lingkup
    getWhere: function(lingkup, idLingkup) {
        if (lingkup === 'pusat' || lingkup === 'nasional') return '';

        var filterLingkup = "";
        if (lingkup === 'prov' || lingkup === 'provinsi') {
            filterLingkup = " WHERE kode_prov = " + idLingkup;
        } else if (lingkup === 'kab' || lingkup === 'kabupaten') {
            filterLingkup = " WHERE kode_kab = " + idLingkup;
        }
        return filterLingkup;
    },

    // Mencari nama tabel sesuai tipe komponen, skala hitung dan skala komponen
    getTabelHitung: function(baseTabel, tipe, skalaHitung, skalaKomponen) {
        if(skalaHitung === 'prov' || skalaHitung === 'provinsi') {
            return baseTabel + "_provinsi_" + tipe;
        }
        else if(skalaHitung === 'kab' || skalaHitung === 'kabupaten') {
            return baseTabel + "_kabupaten_" + tipe;
        }
        else if(skalaHitung === 'kec' || skalaHitung === 'kecamatan') {
            if(skalaKomponen === undefined) {
                return baseTabel + "_kecamatan_" + tipe;
            }
            else if(skalaKomponen === 'kab') {
                return baseTabel + "_kabupaten_" + tipe;
            } 
            else {
                return baseTabel + "_kecamatan_" + tipe;
            }
        }
        else if(skalaHitung === 'des' || skalaHitung === 'desa') {
            if(skalaKomponen === undefined) {
                return baseTabel;
            }        
            switch(skalaKomponen) {
                case 'desa': return baseTabel;
                case 'kec' : return baseTabel + '_kecamatan_' + tipe;
                case 'kab' : return baseTabel + '_kabupaten_' + tipe;
            }        
        }
    },

    getDistinctOn: function(skalaHitung) {
        if(skalaHitung === 'prov' || skalaHitung === 'provinsi') {
            return "DISTINCT ON (kode_prov) ";
        }    
        else if(skalaHitung === 'kab' || skalaHitung === 'kabupaten') {
            return "DISTINCT ON (kode_kab) ";
        }    
        else if(skalaHitung === 'kec' || skalaHitung === 'kecamatan') {
            return "DISTINCT ON (kode_kec) ";
        }
        else if(skalaHitung === 'des' || skalaHitung === 'desa') {
            return " ";
        }
    },

    getOrderBy: function(skalaHitung) {
        if(skalaHitung === 'prov' || skalaHitung === 'provinsi') {
            return " ORDER BY kode_prov";
        }    
        else if(skalaHitung === 'kab' || skalaHitung === 'kabupaten') {
            return " ORDER BY kode_kab";
        }    
        else if(skalaHitung === 'kec' || skalaHitung === 'kecamatan') {
            return " ORDER BY kode_kec";
        }
        else if(skalaHitung === 'des' || skalaHitung === 'desa') {
            return " ORDER BY kode_desa";
        }
    },
    
    getKolom: function(skalaHitung) {
        if(skalaHitung === 'prov' || skalaHitung === 'provinsi') {
            return "kode_prov";
        }    
        else if(skalaHitung === 'kab' || skalaHitung === 'kabupaten') {
            return "kode_kab";
        }    
        else if(skalaHitung === 'kec' || skalaHitung === 'kecamatan') {
            return "kode_kec";
        }
        else if(skalaHitung === 'des' || skalaHitung === 'desa') {
            return "kode_desa";
        }
    },
    
    excelPercentile: function(sortedArray, percentile) { 
        var index = percentile * (sortedArray.length - 1);
        var lower = Math.floor(index);
        if(lower<0) { // should never happen, but be defensive
           return sortedArray[0];
        }
        if(lower>=sortedArray.length-1) { // only in 100 percentile case, but be defensive
           return sortedArray[sortedArray.length - 1];
        }
        var fraction = index - lower;
        // linear interpolation
        return sortedArray[lower] + fraction*(sortedArray[lower+1]-sortedArray[lower]);
    },    
    
    normalisasi: function(data) {

        function trimZero(arr) {
            var i = 0;
            var n = arr.length;
            while(arr[i++] === 0.0 && i < n);    
            return arr.slice(i-1);
        }
                
        function percentileRank(value, percentiles) {            
            if(value === 0.0) return 0;
            var i = 0;
            var p = 0.05;
            while (i < 19 && percentiles[i] < value) {
                i++;
                p += 0.05;
            }
            return Math.round(p * 100) / 100;
        }    
        
        // percentiles
        var dataSort = trimZero(data.slice().sort(function(a,b){return a-b}));
        
        var percentiles = [];
        percentiles.length = 19;
        var p = 0.05;
        for(var i = 0; i < 19; i++) {
            percentiles[i] = h.excelPercentile(dataSort, p);
            p += 0.05;
        }
        
        var normalized = [];
        var n = data.length;
        normalized.length = n;
        
        for(var i = 0; i < n; i++){
            normalized[i] = percentileRank(data[i], percentiles);
        }

        return normalized;
    },
    
    hitungKerentanan5: function(data) {
        // data: {ika:[], iks:[]}
        
        var nilaiKerentanan = [];
        var nData = data.ika.length;
        nilaiKerentanan.length = nData;        
        
        for(var i = 0; i < nData; i++) {
            var IKA = data.ika[i] - 0.5;
            var IKS = data.iks[i] - 0.5;
            var rentan = 0;

            if(IKA>=0 && IKS<=0 && (IKS-IKA)<=-0.25) {
                rentan = 1;
            }
            else if(IKA>=0 && IKS>=0 && (IKS+IKA)>=0.25) {
                rentan = 2;
            }
            else if((IKS-IKA)>=-0.25 && (IKS+IKA)<=0.25 && (IKS+IKA)>=-0.25 && (IKS-IKA)<=0.25) {
                rentan = 3;
            }     
            else if(IKA<=0 && IKS<=0 && (IKS+IKA)<=-0.25) {
                rentan = 4;
            }            
            else if(IKA<=0 && IKS>=0 && (IKS-IKA)>=0.25) {
                rentan = 5;
            }
            
            nilaiKerentanan[i] = rentan;
        }
        
        return nilaiKerentanan;
    },
    
    hitungKerentanan6: function(data) {
        // data: {ika:[], iks:[]}
        
        var nilaiKerentanan = [];
        var nData = data.ika.length;
        nilaiKerentanan.length = nData;        
        
        for(var i = 0; i <= nData; i++) {
            var IKA = data.ika[i] - 0.5;
            var IKS = data.iks[i] - 0.5;
            var rentan = 0;

            if(IKA>=0 && IKS<=0) {
                rentan = 1;
            } 
            else if(IKA>=0 && IKS>=0 && IKS<=IKA) {
                rentan = 2;
            }
            else if(IKA>=0 && IKS>=0 && IKS>=IKA) {
                rentan = 3;
            }
            else if(IKA<=0 && IKS<=0 && IKS<=IKA) {
                rentan = 4;
            }
            else if(IKA<=0 && IKS<=0 && IKS>=IKA) {
                rentan = 5;
            }
            else if(IKA<=0 && IKS>=0) {
                rentan = 6;
            }
            
            nilaiKerentanan[i] = rentan;
        }
        
        return nilaiKerentanan;
    },    
    
    hitungKerentanan7: function(data) {
        // data: {ika:[], iks:[]}
        
        var nilaiKerentanan = [];
        var nData = data.ika.length;
        nilaiKerentanan.length = nData;        
        
        for(var i = 0; i <= nData; i++) {
            var IKA = data.ika[i] - 0.5;
            var IKS = data.iks[i] - 0.5;
            var rentan = 0;

            if(IKA>=0 && IKS<=0 && (IKS-IKA<=-0.25)) {
                rentan = 1;
            }
            else if(IKS>=0 && (IKS+IKA>=0.25) && IKS<=IKA) {
                rentan = 2;
            }
            else if(IKA>=0 && (IKS+IKA>=0.25) && IKS>=IKA) {
                rentan = 3;
            }
            else if(IKS-IKA>=-0.25 && IKS+IKA<=0.25 && (IKS+IKA>=-0.25) && IKS-IKA<=0.25) {
                rentan = 4;
            }
            else if(IKA<=0 && (IKS+IKA<=-0.25) && IKS<=IKA) {
                rentan = 5;
            }
            else if(IKS<=0 && (IKS+IKA<=-0.25) && IKS>=IKA) {
                rentan = 6;
            }
            else if(IKA<=0 && IKS>=0 && (IKS-IKA>=0.25)) {
                rentan = 7;
            }
            
            nilaiKerentanan[i] = rentan;
        }
        
        return nilaiKerentanan;
    }    
    
};

module.exports = h;
