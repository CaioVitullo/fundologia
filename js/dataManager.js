function dataManager($http, me){
    me.getFile = function(url, fileIndex , after){
		//var url = me.getRoot('resultado') + 'cursos/file_' + courses[index] + '.txt';
		try {
			var ajaxConfig = { url: url, cache: false };
			ajaxConfig.method = 'GET';
			ajaxConfig.cache = false;
			ajaxConfig.data= '';
			ajaxConfig.headers= {"Content-Type": "text/gzip"};
			ajaxConfig.params = {_t : new Date().getTime()};
			$http(ajaxConfig).then(function (result, status) {
				me.defaultLists[fileIndex]=result.data;
				console.log('load file:',url )
                if(typeof(after)=='function')
                    after();
			});
		} catch (error) {
			
		}
		 
	};
	me.getFromSrc = function(name, index, after){
		if(window[name] != null){
			me.defaultLists[index]=window[name];
			if(typeof(after)=='function')
                after();
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
				//me.defaultLists[index]=null;
			}
			
		}
	};
	me.getGenericFile = function(url, after){
		try {
			var ajaxConfig = { url: url, cache: false };
			ajaxConfig.method = 'GET';
			ajaxConfig.cache = false;
			//ajaxConfig.data= '';
			//ajaxConfig.headers= {
			//	"Content-Type": "text/gzip"
			//}
			ajaxConfig.params = {_t : new Date().getTime()};
			$http(ajaxConfig).then(function (result, status) {
				after(result.data);
			});
		} catch (error) {
			
		}
	};
	me.getGZip = function(url, after){
		try {
			var ajaxConfig = { url: url, cache: false };
			ajaxConfig.method = 'GET';
			ajaxConfig.cache = false;
			ajaxConfig.data= '';
			ajaxConfig.headers= {"Content-Type": "text/gzip"};
			ajaxConfig.params = {_t : new Date().getTime()};
			$http(ajaxConfig).then(function (result, status) {
				console.log(result);
			});
		} catch (error) {
			p=error
		}
	};
	me.gettry = function(){
		me.getGZip('resultadoFundo/last24.gz', function(result){
			console.log(result);
		})
	};
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
	};
	me.textDialogHtml = '';
	me.titleDialogHtml = '';
	me.showCustomDialog = function(title, html){
		me.textDialogHtml = html;
		me.titleDialogHtml = title;
		$('#modalCustomText').modal('open');
	};
	me.interval_hover=null;
	me.showIntervalDialog = function(){
		ga('send', {
			hitType: 'event',
			eventCategory: 'interval dialog',
			eventAction: 'open dialog',
			eventLabel: me.currentRow.name
		  });
		//chart_bestInterval
		var d = [];
		var L = [['Permanencia', 'Mínimo', 'Médio', 'Máximo']];
		for(var i=0;i<me.currentRow.figures[me.selectedPeriod].intervalResumes.length;i++){
			var item = me.currentRow.figures[me.selectedPeriod].intervalResumes[i];
			var p = [];
			p[0]=item.length;
			p[1]=item.minPerformance;
			p[2]=item.montlyAvg;
			p[3]=item.montlyAvg;
			p[4]=item.maxPerformance;
			p[5]='<p>Quem permaneceu ' + item.length + ' meses no fundo:</p><p>Teve um rendimento mensalizado médio de <strong>' + item.montlyAvg + '%</strong>.</p>' + '<p>O maior rendimento mensalizado foi de: <strong>' + item.maxPerformance + '%</strong></p><p> E o menor rendimento mensalizado foi de:<strong>' + item.minPerformance +'%</strong></p>' 
			d.push(p);
			L.push([item.length,item.minPerformance, item.montlyAvg, item.maxPerformance ]);
		}
		//var data = google.visualization.arrayToDataTable(d, true);
		var data = new google.visualization.DataTable();
		
		data.addColumn({type:'number',label: 'Periodo'});
		data.addColumn('number', 'mínimo');
		data.addColumn('number', 'média');
		data.addColumn('number', 'média');
		data.addColumn('number', 'máximo');
		data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data.addRows(d);
		
		var w =  $(window).width()*0.35;
		console.log(w);
		  var options = {
			legend:'none',tooltip:{isHtml: true},
			width:w,
			hAxis: {title: 'Permanência no fundo(meses)'},
			vAxis: {title: 'Rendimento médio mensalizado (%)'}
		  };
	  
		  var chart = new google.visualization.CandlestickChart(document.getElementById('chart_bestInterval'));
		  chart.draw(data, options);

		  var lineChart = new google.visualization.LineChart(document.getElementById('chart_bestInterval_line'));
          lineChart.draw(google.visualization.arrayToDataTable(L), {
			
			curveType: 'function',
			legend: { position: 'right' },
			width:w,
			hAxis: {title: 'Permanência no fundo(meses)'},
			vAxis: {title: 'Rendimento médio mensalizado (%)'}
		  });
		me.interval_hover = me.currentRow.figures[me.selectedPeriod].intervalResumes[0];
		$('#modalInterval').modal('open');
	}
	me.rankingFullList = null
	me.showRankDialog = function(){
		ga('send', {
			hitType: 'event',
			eventCategory: 'rank dialog',
			eventAction: 'open dialog'
		  });
		
		if(me.rankingFullList ==null){
			me.rankDataIsLoading = true;
			me.getGenericFile('resultadoFundo/rankingByMonth.txt', function(result){
				me.rankDataIsLoading = false;
				me.rankingFullList  = result;
			});
		}
		
		
		$('#modalRankingDialog').modal('open');
	}
	me.currentSortCol = 0;
	me.sortReverse = true;
	me.setCurrentSort = function(i){
		if(me.currentSortCol == i){
			me.sortReverse = !me.sortReverse;
		}else{
			me.currentSortCol = i;
		}
	};
	me.ranktableColumns=[0,1,2,3,4,5,6,7,8,9];
	me.showNextRankTableColumns = true;
	me.showPrevtRankTableColumns = false;
	me.nextRankTableColumns = function(){
		var min = me.ranktableColumns.min();
		var max = me.ranktableColumns.max();
		min += 1;
		max += 1;
		
		me.showPrevtRankTableColumns = min>0;	
		me.showNextRankTableColumns = max < 20;

		if(max==20){
			return;
		}

		me.ranktableColumns=[];
		for(var i=min;i<=max;i++){
			me.ranktableColumns.push(i);
		}
	};
	me.prevRankTableColumns = function(){
		var min = me.ranktableColumns.min();
		var max = me.ranktableColumns.max();
		
		min -= 1;
		max -= 1;
		me.showPrevtRankTableColumns = min>0;	
		me.showNextRankTableColumns = max < 20;
		if(min==-1){
			return;
		}
		me.ranktableColumns=[];
		for(var i=min;i<=max;i++){
			me.ranktableColumns.push(i);
		}
	};
	me.showExtraChartFooter = false;
	me.openCampaign = function(camp){
		if(camp == 'txadm'){
			me.showExtraChartFooter = true;
			me.openChart(
				'Taxa Administrativa',
				 'admTax',
				 'Os fundos de investimento com maior taxa Administrativa tiveram rendimento melhor nos últimos meses? Este gráfico vai te ajudar a descobrir!')
				if (!me.$$phase)
            		me.$apply();
		}
	};
	me.showChartIcons = function(){
		$("i:contains('insert_chart')").removeClass('tiny').addClass('small')
	};
	me.hideChartIcons = function(){
		$("i:contains('insert_chart')").removeClass('small').addClass('tiny')
	};
	
	me.blinkLock=false;
	me.compareProp = [
		{label:'Rentabilidade no período', prop:'performance', d:2},
		{label:'Soma de pontos no ranking', prop:'totalRank', d:-1},
		{label:'Meses positivos', prop:'posNegCountRate', d:2},
		{label:'Meses negativos', prop:'posNegCountRate', d:2},
		{label:'Média rentabilidade positiva', prop:'positiveAvg', d:2},
		{label:'Média rentabilidade negativa', prop:'negativeAvg', d:2},
		{label:'Média rendimento', prop:'average', d:2},
		{label:'Volatilidade', prop:'volatilidadeAnual', d:2},
		{label:'Correlação CDI', prop:'correlationCDI', d:-1},
		{label:'Correlação IBOV', prop:'correlationIbov', d:-1},
		{label:'Correlação SP&500', prop:'correlationSP500', d:-1},
		
	];
	me.sortColumns = [
		'rank',
		'name',	//1
		'posNegCountRate', //2
		'posNegAvgRate',	//3
		'monthAboveCDI',			//4
		'volatilidadeAnual',			//5
		'sharpCDI',	//6
		'admTax',			//7
		'performance'		//8
	];
}

function closeChartDialog(it){
	$(it).parent().modal('close');
};