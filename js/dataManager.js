function dataManager($http, me){
    me.getFile = function(url, fileIndex , after){
		//var url = me.getRoot('resultado') + 'cursos/file_' + courses[index] + '.txt';
		try {
			var ajaxConfig = { url: url, cache: false };
			ajaxConfig.method = 'GET';
			ajaxConfig.cache = false;
			ajaxConfig.params = {_t : new Date().getTime()};
			$http(ajaxConfig).then(function (result, status) {
				me.defaultLists[fileIndex]=result.data;
                if(typeof(after)=='function')
                    after();
			});
		} catch (error) {
			
		}
		 
    };
    me.defaultFiles = [
		{index:1, name:'last24'},
		{index:2, name: 'last36'},
		{index:3, name:'bigList'},
		{index:0, name: 'last12'}];

	me.defaultLists = [];
	me.getDefaultLists = function(fn, afterBigList){
		
		for(i=0;i<me.defaultFiles.length;i++){
			var file = me.defaultFiles[i].name;
			var index = me.defaultFiles[i].index;
			var url = 'resultadoFundo/' + file + '.txt';
			if(me.defaultFiles[i].name =='bigList'){
				me.getFile(url, index, afterBigList);
			}else if(me.defaultFiles[i].name =='last24'){
				me.getFile(url, index, fn);
			}else{
				me.getFile(url, index, null);
			}
			
		}
	};
	me.getGenericFile = function(url, after){
		try {
			var ajaxConfig = { url: url, cache: false };
			ajaxConfig.method = 'GET';
			ajaxConfig.cache = false;
			ajaxConfig.params = {_t : new Date().getTime()};
			$http(ajaxConfig).then(function (result, status) {
				after(result.data);
			});
		} catch (error) {
			
		}
    }
    me.saveOnStorage = function(key, obj){
		
		if(typeof(localStorage) == 'object'){
			value = JSON.stringify(obj);
			localStorage.setItem(key, value);
			return true;
		}
		return false;
	};
	me.getFromStorage = function(key){
		if(typeof(localStorage) == 'object'){
			value =localStorage.getItem(key);
			return JSON.parse(value);
		}
		return null;
	};
	
	me.getQuerystring = function (name, _url) {
        var url = _url != null ? _url : window.location.href;
        if (url.indexOf('?') >= 0) {
            var parte = url.split('?')[1].split('#')[0];
            if (parte.indexOf('&') >= 0) {
                var retorno = '';
                $(parte.split('&')).each(function (index, item) {
                    var chaveValor = item.split('=');
                    if (chaveValor[0] == name) {
                        retorno = chaveValor[1];
                        return false;
                    }
                });
                return retorno;
            } else {
                if (parte.indexOf('=') >= 0 && parte.split('=')[0] == name) {
                    var str = parte.split('=')[1];
                    return str.split('#')[0];
                }
            }
        }
    };
    me.hasBeenShowed = function(name){
        var storage = me.getFromStorage(name);
        if(storage == null)
            return false;
        return storage.value;
    };
    me.canShowFeature = function(key){
        if(me.hasBeenShowed(key) == false){
            me.saveOnStorage(key, {value:true});
            return true;
        }
        return false;
    }
}