var mainApp = angular.module('mainApp', []);

mainApp.controller('ctrl', function ($http, $scope, $timeout, $interval) {
    var me = $scope;
    dataManager($http, me);
	me.loading = true;
	me.charts = [];
    me.loadCtrl = function(){
        me.getDefaultLists(function(){}, function(){
			
			var int = $interval(function(){
				if(isSafeToUse(google,'visualization.ScatterChart') && isSafeToUse(google,'visualization.Histogram') && isSafeToUse(google,'visualization.arrayToDataTable') && me.defaultLists[3] != null){
					$interval.cancel(int);
					me.openAnaliseDiasRecuperacao();
				}
			}, 100);
			
        }, true);
	};
	me.chart2 = function(){
		var dataHist = [['Fundo', 'Rentabilidade em 18-05-2017']];	
		for(var i=0;i<me.defaultLists[3].length;i++){
			var item = me.defaultLists[3][i];
			if(item.analiseTemer != null && isBetween(item.analiseTemer.difQuota, -35, 0) && item.figures[1] != null)
				dataHist.push([item.name, (Math.abs(item.analiseTemer.difQuota)/(item.figures[1].volatilidadeAnual/3.4641))]);
		}

		var data = google.visualization.arrayToDataTable(dataHist);
		
		var options = {
			
			legend: { position: 'none' },
			hAxis:{ title:'rendimento em 18-05-2017 dividido pela Volatilidade mensal'},
			vAxis:{title:'Quantidade de fundos'},
			colors: ["#ff0e00","#ff6300","#ff5500","#ff4700","#ff3900","#ff2b00","#ff1c00","#ff0000"],//"#ffaa00","#ff9c00","#ff8e00","#ff8000",
			histogram:{lastBucketPercentile:5}
		  };

  
		  var chart1 = new google.visualization.Histogram(document.getElementById('chart2'));
		  chart1.draw(data, options);
		  me.charts.push(chart1);
	}
	me.chart3 = function(){
		var dataSt = new google.visualization.DataTable();
		var name = 'Recuperação';
		dataSt.addColumn({type:'number',label: name});
		dataSt.addColumn('number', 'Ação');
		dataSt.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		dataSt.addColumn('number', 'Multimercado');
		dataSt.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		dataSt.addColumn('number', 'Renda Fixa');
		dataSt.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		dataSt.addColumn({'type': 'string', 'role': 'annottion'});
		
		
		dataSt.addRows(me.getGenericData('recuperacao', name, 100.0,
			 function(val, item){
				 return item.analiseTemer != null ? item.analiseTemer.difQuota/100.0 : 0;
			 }, function(val,item){
				 return item.analiseTemer != null ? item.analiseTemer.diasAteRecuperar : 0;
			 }, function(item, fig){
				 if(item.analiseTemer == null)
				 	return '';
				html= '<h5 style="width:300px;font-size:1.3rem;">' + item.name + '</h5>';
				html += '<p>Cota em 17-05-2017 : ' + item.analiseTemer.quota17 + '</p>';
				html +='<p>Cota em 18-05-2017 : ' + item.analiseTemer.queto18 + ' ( <strong>'+  item.analiseTemer.difQuota +'%</strong> )</p>';
				html += '<p>No dia ' + item.analiseTemer.diaRecuperacao + ' o fundo voltou ao patamar do dia 17-05-2017'; 
				html += '<p>Total de dias(úteis) até recuperar: ' + item.analiseTemer.diasAteRecuperar + '</p>';
				return html;
			}, function(item){
				return item.analiseTemer != null;
			}));

	
		var chartSt = new google.visualization.ScatterChart(document.getElementById('chart3'));
		chartSt.draw(dataSt,  {
			title: 'Rendimento um dia após a delação vs Tempo de recuperação.',
			hAxis:{format:'percent', title:'rendimento em 18-05-2017'},
			vAxis:{title:'Quantidade de dias úteis para voltar ao patamar anterior'},
			tooltip:{isHtml: true},
			colors: ['#E94D20', '#ECA403', '#63A74A']
		  });
		  me.charts.push(chartSt);
	}
	me.chart1 = function(){
		
		var dataHist = [['Fundo', 'Rentabilidade em 18-05-2017']];	
		for(var i=0;i<me.defaultLists[3].length;i++){
			var item = me.defaultLists[3][i];
			if(item.analiseTemer != null && isBetween(item.analiseTemer.difQuota, -35, 0))
				dataHist.push([item.name, item.analiseTemer.difQuota/100.0]);
		}

		var data = google.visualization.arrayToDataTable(dataHist);
		//
		var w =  $('#modalRecuperacao').width()*0.9;
		var h = Math.min(w / 1.61, $('#modalRecuperacao').height()) 
		var options = {
			title: 'Análise dos fundos que tiveram prejuizo.',
			legend: { position: 'none' },
			hAxis:{format:'percent', title:'rendimento em 18-05-2017'},
			vAxis:{title:'Quantidade de fundos'},
			//height:h,
			//width:w,
			colors: ["#ff7100","#ff6300","#ff5500","#ff4700","#ff3900","#ff2b00","#ff1c00","#ff0e00","#ff0000"],//"#ffaa00","#ff9c00","#ff8e00","#ff8000",
			histogram:{lastBucketPercentile:5}
		  };

  
		  var chart = new google.visualization.Histogram(document.getElementById('chart1'));
		  chart.draw(data, options);
		  me.charts.push(chart);
	};
	me.chart4 = function(){
		var data3 = new google.visualization.DataTable();
		var name = 'Recuperação';
		data3.addColumn({type:'number',label: name});
		data3.addColumn('number', 'Ação');
		data3.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data3.addColumn('number', 'Multimercado');
		data3.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data3.addColumn('number', 'Renda Fixa');
		data3.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data3.addColumn({'type': 'string', 'role': 'annottion'});
		
		data3.addRows(me.getGenericData('recuperacaoVolume', name, 1,
			 function(val, item){
				 return item.analiseTemer != null ? item.analiseTemer.volume17 : 0;
			 }, function(val,item){
				 return item.analiseTemer != null ? item.analiseTemer.diasAteRecuperar : 0;
			 }, function(item, fig){
				 if(item.analiseTemer == null)
				 	return '';
				html= '<h5 style="width:300px;font-size:1.3rem;">' + item.name + '</h5>';
				html += '<p>Volume: <strong>' + item.analiseTemer.volume17 + '</strong></p>';
				html += '<p>Cota em 17-05-2017 : ' + item.analiseTemer.quota17 + '</p>';
				html +='<p>Cota em 18-05-2017 : ' + item.analiseTemer.queto18 + ' ( <strong>'+  item.analiseTemer.difQuota +'%</strong> )</p>';
				html += '<p>No dia ' + item.analiseTemer.diaRecuperacao + ' o fundo voltou ao patamar do dia 17-05-2017'; 
				html += '<p>Total de dias(úteis) até recuperar: ' + item.analiseTemer.diasAteRecuperar + '</p>';
				
				return html;
			}, function(item){
				return item.analiseTemer != null;
			}));

		
		var chart3 = new google.visualization.ScatterChart(document.getElementById('chart4'));
		chart3.draw(data3,  {
			title: 'Tempo de recuperação vs Volume.',
			hAxis:{ title:'Patrimônio', logScale:true},
			vAxis:{title:'Quantidade de dias úteis para voltar ao patamar anterior'},
			tooltip:{isHtml: true},
			colors: ['#E94D20', '#ECA403', '#63A74A']
		  });
		me.charts.push(chart3);
	}
	me.chart5 = function(){
		var data4 = new google.visualization.DataTable();
		var name = 'Recuperação';
		data4.addColumn({type:'number',label: name});
		data4.addColumn('number', 'Ação');
		data4.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data4.addColumn('number', 'Multimercado');
		data4.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data4.addColumn('number', 'Renda Fixa');
		data4.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data4.addColumn({'type': 'string', 'role': 'annottion'});
		
		data4.addRows(me.getGenericData('recuperacao_correlacaoIbov', name, 1,
			 function(val, item){
				 return item.analiseTemer != null ? item.figures[0].correlationIbov : 0;
			 }, function(val,item){
				 return item.analiseTemer != null ? item.analiseTemer.difQuota/100.0 : 0;
			 }, function(item, fig){
				 if(item.analiseTemer == null)
				 	return '';
				html= '<h5 style="width:300px;font-size:1.3rem;">' + item.name + '</h5>';
				html += '<p>Correlação IBOV: <strong>' + item.figures[0].correlationIbov + '</strong></p>';
				html +='<p>Rentabilidade :<strong>'+  item.analiseTemer.difQuota +'%</strong></p>';
				html += '<p>Total de dias(úteis) até recuperar: ' + item.analiseTemer.diasAteRecuperar + '</p>';
				
				return html;
			}, function(item){
				return item.analiseTemer != null;
			}));

		
		var chart4 = new google.visualization.ScatterChart(document.getElementById('chart5'));
		chart4.draw(data4,  {
			title: 'Correlação IBOV vs Queda.',
			hAxis:{ title:'Correlação IBOVESPA'},
			vAxis:{title:'Rentabilidade em 18-05-2017', format:'percent'},
			tooltip:{isHtml: true},
			colors: ['#E94D20', '#ECA403', '#63A74A']
		  });
		  me.charts.push(chart4);
	};
	me.chart6 = function(){
		var data5 = new google.visualization.DataTable();
		var name = 'Recuperação';
		data5.addColumn({type:'number',label: name});
		data5.addColumn('number', 'Ação');
		data5.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data5.addColumn('number', 'Multimercado');
		data5.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data5.addColumn('number', 'Renda Fixa');
		data5.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data5.addColumn({'type': 'string', 'role': 'annottion'});
		
		data5.addRows(me.getGenericData('recuperacao_velocidade', name, 1,
			 function(val, item){
				 return item.analiseTemer != null ? item.figures[0].correlationIbov : 0;
			 }, function(val,item){
				 return item.analiseTemer  ?  item.analiseTemer.velocidade/100.0 : 0;
			 }, function(item, fig){
				 if(item.analiseTemer == null)
				 	return '';
				html= '<h5 style="width:300px;font-size:1.3rem;">' + item.name + '</h5>';
				html += '<p>Correlação IBOV: <strong>' + item.figures[0].correlationIbov + '</strong></p>';
				html +='<p>Velocidade :<strong>'+  Math.abs(item.analiseTemer.velocidade) +'%/dia</strong></p>';
				html += '<p>Total de dias(úteis) até recuperar: ' + item.analiseTemer.diasAteRecuperar + '</p>';
				
				return html;
			}, function(item){
				return item.analiseTemer != null && item.analiseTemer.diasAteRecuperar > 0;
			}));

		
		var chart5 = new google.visualization.ScatterChart(document.getElementById('chart6'));
		chart5.draw(data5,  {
			title: 'Correlação IBOV vs Velocidade de recuperação.',
			hAxis:{ title:'Correlação IBOVESPA', minValue:-1, maxValue:1},
			vAxis:{title:'Velocidade de recuperação', format:'percent'},
			tooltip:{isHtml: true},
			colors: ['#E94D20', '#ECA403', '#63A74A']
		  });
		  me.charts.push(chart5);
	};
	me.chart7 = function(){
		var data6 = new google.visualization.DataTable();
		var name = 'Recuperação';
		data6.addColumn({type:'number',label: name});
		data6.addColumn('number', 'Ação');
		data6.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data6.addColumn('number', 'Multimercado');
		data6.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data6.addColumn('number', 'Renda Fixa');
		data6.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data6.addColumn({'type': 'string', 'role': 'annottion'});
		
		data6.addRows(me.getGenericData('recuperacaoVolumeVelocidade', name, 1,
			 function(val, item){
				 return item.analiseTemer != null ? item.analiseTemer.volume17 : 0;
			 }, function(val,item){
				 return item.analiseTemer != null ? item.analiseTemer.velocidade/100.0 : 0;
			 }, function(item, fig){
				 if(item.analiseTemer == null)
				 	return '';
				html= '<h5 style="width:300px;font-size:1.3rem;">' + item.name + '</h5>';
				html += '<p>Volume: <strong>' + item.analiseTemer.volume17 + '</strong></p>';
				html += '<p>Cota em 17-05-2017 : ' + item.analiseTemer.quota17 + '</p>';
				html +='<p>Cota em 18-05-2017 : ' + item.analiseTemer.queto18 + ' ( <strong>'+  item.analiseTemer.difQuota +'%</strong> )</p>';
				html += '<p>No dia ' + item.analiseTemer.diaRecuperacao + ' o fundo voltou ao patamar do dia 17-05-2017'; 
				html += '<p>Total de dias(úteis) até recuperar: ' + item.analiseTemer.diasAteRecuperar + '</p>';
				
				return html;
			}, function(item){
				return item.analiseTemer != null;
			}));

		
		var chart6 = new google.visualization.ScatterChart(document.getElementById('chart7'));
		chart6.draw(data6,  {
			title: 'Velocidade de recuperação vs Volume.',
			hAxis:{ title:'Volume', logScale:true},
			vAxis:{title:'Velicidade de recuparação'},
			tooltip:{isHtml: true},
			colors: ['#E94D20', '#ECA403', '#63A74A']
		  });
		  me.charts.push(chart6);
	};
	me.chart8 = function(){
		var dataHist = [['Fundo', 'Rentabilidade em 18-05-2017']];	
		for(var i=0;i<me.defaultLists[3].length;i++){
			var item = me.defaultLists[3][i];
			if(item.analiseTemer != null && isBetween(item.analiseTemer.difQuota, -35, 0))
				dataHist.push([item.name, item.analiseTemer.diasAteRecuperar]);
		}

		var data = google.visualization.arrayToDataTable(dataHist);
		//
		
		var options = {
			legend: { position: 'none' },
			hAxis:{ title:'Dias para se recuperar'},
			vAxis:{title:'Quantidade de fundos'},
			//height:h,
			//width:w,
			colors: ["#ff584e","#ff6300","#ff5500","#ff4700","#ff3900","#ff2b00","#ff1c00","#ff0e00","#ff0000"],//"#ffaa00","#ff9c00","#ff8e00","#ff8000",
			histogram:{lastBucketPercentile:5}
		  };

  
		  var chart = new google.visualization.Histogram(document.getElementById('chart8'));
		  chart.draw(data, options);
		  me.charts.push(chart);
	};
    me.openAnaliseDiasRecuperacao = function(){
		//
		// me.analiseRecuperacao = {
		// 	qtdAbaixo1:me.defaultLists[3].count(function(item){return item.analiseTemer != null && item.analiseTemer.difQuota<=-1}),
		// 	qtd1mes:me.defaultLists[3].count(function(item){
		// 		return item.analiseTemer != null && 
		// 			isBetween(item.analiseTemer.difQuota, -35, 0) && 
		// 			item.analiseTemer.diasAteRecuperar>=22}),
		// 	countCaiu:me.defaultLists[3].count(function(item){return  item.analiseTemer != null && isBetween(item.analiseTemer.difQuota, -35, 0)}),
		// 	countAll:me.defaultLists[3].count(function(item){return  item.analiseTemer != null})
		// }
		// me.analiseRecuperacao.percAbaixo1 = (100 * me.analiseRecuperacao.qtdAbaixo1/me.analiseRecuperacao.countAll).toFixed(2);
		me.selectedPeriod = 1;
		
		//#####################################################
		  //##			GRAFICO II
		//#####################################################
		me.chart1();
		me.chart2();
		me.chart8();
		me.chart3();
		me.chart4();
		me.chart5();
		me.chart6();
		me.chart7();

		me.loading = false;
		//#####################################################
		//##			GRAFICO III
		//#####################################################
		
		$('#modalRecuperacao').modal('open');

	};
	me.busy = false;
	me.update = function(){
		if(me.busy)
			return
		
		me.loading=true;
		me.busy = true;
		me.openAnaliseDiasRecuperacao();
		me.busy = false;
	};
});

var rtime;
var timeout = false;
var delta = 100;

$(window).resize(function(){
	
	rtime = new Date();
	if (timeout === false) {
		timeout = true;
		setTimeout(resizeend, delta);
	}
		
});

function resizeend() {
    if (new Date() - rtime < delta) {
        setTimeout(resizeend, delta);
    } else {
		timeout = false;
		try{
			getMainScope().update();
		}catch(e){	}
    }               
}