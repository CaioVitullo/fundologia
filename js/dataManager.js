function dataManager($http, me){
	me.chartData = {}
	me.getGenericData = function(propery, name, n=1, fnValueX, fnValueY, fnTooltip, checkLine){
		if(me.chartData.hasOwnProperty(propery)){
			if(me.chartData[propery].hasOwnProperty(me.selectedPeriod))
				return me.chartData[propery][me.selectedPeriod];
		}
		
			var d= [];
			var fn=null;
			if(typeof(fnTooltip)=='function'){
				fn = fnTooltip;
			}else{
				fn = function(item, fig){
					html= '<h5 style="width:300px;font-size:1.3rem;">' + item.name + '</h5><p>' + name + ': ' + (item.info.hasOwnProperty(propery) ? item.info[propery] : fig[propery]) + '</p>';
					html += '<p>Rendimento: ' + fig.performance + '% acumulado nos ' + me.filters.Periodo[me.selectedPeriod].Title.toLowerCase();
					return html;
				}
			}

			var fnVal = function(val,item){return val;}
			if(typeof(fnValueY) == 'function')
				fnVal = fnValueY;
			
			var fnX = function(val,item){return val;}
			if(typeof(fnValueX) == 'function')
				fnX = fnValueX;
			
			if(checkLine==null)
				checkLine = function(item){return true;}

			for(var i=0;i<me.defaultLists[3].length;i++){
				var item = me.defaultLists[3][i]
				var fig = item.figures[me.selectedPeriod];
				if(fig != null && checkLine(item)){
					
					d.push([
						fnX(item.info.hasOwnProperty(propery) ? item.info[propery]/n : fig[propery]/n, item),
						item.info.isAcao ? fnVal(fig.performance/100.0,item) : null,
						fn(item, fig) ,
						item.info.isMultimercado ? fnVal(fig.performance/100.0, item) : null,
						fn(item, fig) ,
						item.info.isRendaFixa ? fnVal(fig.performance/100.0,item) : null,
						fn(item, fig),
						item.name + '|' + item.uniqueID
					])
				}		
			}

			if(me.chartData.hasOwnProperty(propery) == false)
				me.chartData[propery] = {};
			me.chartData[propery][me.selectedPeriod]=d;
			return d;
	}
	
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
	me.getDefaultLists = function(fn, afterBigList, pre){
		pre = pre == null ? '' : '../';
		for(i=0;i<me.defaultFiles.length;i++){
			var file = me.defaultFiles[i].name;
			var index = me.defaultFiles[i].index;
			var url = pre +'resultadoFundo/' + file + '.txt';
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
	me.drawMultiLineChart = function(row,series,seriesNames,  recalcWidth, element, extraOptions){
		
		if(isSafeToUse(google, 'visualization.arrayToDataTable') == false || 
			isSafeToUse(google, 'visualization.LineChart') == false)
			return
			
			var months = me.getCurrentPeriodNames(false).reverse();
			var values = row.figures[me.selectedPeriod].sequencePerformance;
			var d = [['Mês', 'Rentabilidade acumulada(%)'].union(seriesNames)];
			
			for(var i=0;i<values.length;i++){
				var k =[months[i],values[i]];
				for(x=0;x<series.length;x++){
					k.push(series[x][i]);
				}
				d.push(k);
			}
			
			var data = google.visualization.arrayToDataTable(d);
			
			var options = {
				backgroundColor:'#fafafa',
				series: [
					{color: 'blue', },
					{color: 'orange', lineDashStyle: [2, 2]},
					{color: 'green', lineDashStyle: [4,4]}
				  ],
			  //curveType: 'function',
			 
			  vAxis:{
				  //maxValue:MM.max,
				  //minValue:MM.min,
				  gridlines: { color: '#e0e0e0'} ,
				  textStyle:{color:'#9e9e9e'},//fontName:'"Roboto", sans-serif'
				  baselineColor:'#e0e0e0'
				},
				hAxis:{
					gridlines:{color: '#e0e0e0'},
					baselineColor:'#e0e0e0',
					fontSize:14
				}
			};
			if(recalcWidth == true)
				options.width = $('#rightMenu').width();
			if(extraOptions != null){
				for(i in extraOptions){
					options[i]=extraOptions[i];
				}
			}
	
			if(element==null)
				element='curve_chart';
			$('#'+element).contents().remove();
			var chart = new google.visualization.LineChart(document.getElementById(element));
	
			chart.draw(data, options);
			
	};
	me.groupedRankList = [];
	me.firtsTimeOpenDetailDialog = true;
	me.openRankDialog = function(row, fromList){
		ga('send', {
			hitType: 'event',
			eventCategory: 'view detail',
			eventAction: 'open dialog',
			eventLabel: row.name
		  });
		
		if(me.isMobile == true && fromList == true){
			me.selectRow(row);
			return;
		}
		if(me.compareDlgStillOpen==true){
			me.rowClick(row, null);
			return
		}
		var first = true;
		me.groupedRankList = [];
		var month = 3;
		var year = 18;
		var list = [];
		var len = me.filters.Periodo[me.selectedPeriod].len;
		if(me.isMobile == true){
			for(var i = 0;i<len;i++){
				me.groupedRankList.push({
					label:me.getMonthName(month, year),
					rank:me.currentRow.rank[i],
					point:me.currentRow.points[i],
					value:me.currentRow.values[i] });

					month -=1;
					if(month == 0){
						month = 12;
						year-=1;
					}
				}
		}else{
			for(var i = 0;i<len;i++){
				list.push({
					label:me.getMonthName(month, year),
					rank:me.currentRow.rank[i],
					point:me.currentRow.points[i],
					value:me.currentRow.values[i] });
				month -=1;
				if(month == 0 || i ==len-1){
					if(list.length<12){
						while(list.length<12){
							if(first){
								list.includeBefore({label:'', value:'', point:'', rank:''});
							}else{
								list.push({label:'', value:'', point:'', rank:''});
							}
						}
						first=false;
					}
					
						
					me.groupedRankList.push({year:year, data:list});
					month = 12;
					year-=1;
					list = [];
				}
			}
		}
		
		me.getAndSaveFileMany(['cdi', 'ibov'], function(){
			var cdi = me.histData['cdi'].select('accumulated');
			var ibov = me.histData['ibov'].select('accumulated');
			
			me.drawMultiLineChart(me.currentRow,
								[cdi, ibov], 
								['CDI', 'Ibovespa'],
								false,
								'chartLine',
								 {
									width:$('#modaltable').width()*0.9,
									height:$('#modaltable').height()*0.8,
									hAxis: { 
										textStyle : {
											fontSize: 9 // or the number you want
										},
										ticks: [0,5,10,15,20] 
									}
								});
				
				
				var radarChart = new Chart(
					$('#radarChart'),
						{type:"radar",
						data:{
							labels:['Rentabilidade', 'Volatilidade', 'Meses acimda CDI', 'Meses acima IBOV', 'Rel. Ganhho/Perda', 'Meses positivos'],
								datasets:[
										{
											label:me.currentRow.name,
											data:[
												(100 + me.currentRow.zscores.performance.p)/2,
												(100 + me.currentRow.zscores.volatilidadeAnual.p)/2,
												(100 + me.currentRow.zscores.monthAboveCDI.p)/2,
												(100 + me.currentRow.zscores.monthsAboveIBOV.p)/2,
												(100 + me.currentRow.zscores.posNegAvgRate.p)/2,
												(100 + me.currentRow.zscores.posNegCountRate.p)/2
											],
											fill:true,
											fontSize: 40,
											backgroundColor:"rgba(57,105,186, 0.2)",
											borderColor:"rgb(57,105,186)",
											pointBackgroundColor:"rgb(57,105,186)",
											pointBorderColor:"#fff",
											pointHoverBackgroundColor:"#fff",
											pointHoverBorderColor:"rgb(57,105,186)",
										},{
											data:[100,100,100,100,100,100],
											fill:false,
											borderColor:'transparent'
										},{
											data:[0,0,0,0,0,0],
											fill:false,
											borderColor:'transparent'
										}
									]
						},
						options:{
							responsive:true,
							maintainAspectRatio: true,
							layout:{
								width:'400'
							},
							labels: {
								fontColor: 'rgb(255, 99, 132)',
								fontSize: 24
							},
							legend:{display:false},
							tooltips:{
								callbacks:{
									label: function(tooltipItem, data, a,b, c, d) {
										//var label = data.datasets[tooltipItem.datasetIndex].label || '';
										if(tooltipItem.datasetIndex >0)
											return '' ;
										
										var title = data.labels[tooltipItem.index];
										var val = 0;
										var n=0;
										switch(title){
											case 'Rentabilidade':
												val = me.currentRow.zscores.performance.z;
												n = me.currentRow.figures[me.selectedPeriod].performance + '%';
												break;
											case 'Volatilidade':
												val = me.currentRow.zscores.volatilidadeAnual.z;
												n = me.currentRow.figures[me.selectedPeriod].volatilidadeAnual;
												break;
											case 'Meses acimda CDI':
												val = me.currentRow.zscores.monthAboveCDI.z;
												n = me.currentRow.figures[me.selectedPeriod].monthAboveCDI + '%';;
												break;
											case 'Meses acima IBOV':
												val = me.currentRow.zscores.monthsAboveIBOV.z;
												n = me.currentRow.figures[me.selectedPeriod].monthsAboveIBOV + '%';
												break;
											case 'Rel. Ganhho/Perda':
												val = me.currentRow.zscores.posNegAvgRate.z;
												n = me.currentRow.figures[me.selectedPeriod].posNegAvgRate;
												break;
											case 'Meses positivos':
												val = me.currentRow.zscores.posNegCountRate.z;
												n = me.currentRow.figures[me.selectedPeriod].posNegCountRate + '%';
												break;
										}
										var lbl='';
										if(val <=-4){
											lbl='Extremamente abaixo da média'
										}else if(val == -3){
											lbl='Muito abaixo da média'
										}else if(val == -2){
											lbl='Abaixo da média '
										}else if(val == -1){
											lbl='Levemente abaixo da média'
										}else if(val == 0){
											lbl='Na média'
										}else if(val ==1){
											lbl='Levemente acima da média'
										}else if(val ==2){
											lbl='Acima da média'
										}else if(val ==3){
											lbl='Muito acima da média'
										}else if(val >= 4){
											lbl='Extremamente acima da média'
										}
										console.log([
											me.currentRow.zscores.performance,
											me.currentRow.zscores.volatilidadeAnual,
											me.currentRow.zscores.monthAboveCDI,
											me.currentRow.zscores.monthsAboveIBOV,
											me.currentRow.zscores.posNegAvgRate,
											me.currentRow.zscores.posNegCountRate ]);
										return me.currentRow.name + ': ' + n + ' - ' + lbl;

									}
								}
							},
							responsive: true,
							scale: {
								pointLabels: {
									fontSize: 18	
								},
								xAxes: [{
									display: false
								  }],
								yAxes: [{
									display: false,
									ticks: {
										display: false,
										beginAtZero: true,
										max: 100,
										min: 0
									}
								}]
							},
							elements:
								{line:{
									tension:0,
									borderWidth:3
									}
								}
							}
						});
		});

		
		//##############################
		//		HISTOGRAM
		//##############################
		var dataHist = [['Mês', 'Rentabilidade']];	
		
		var monthNames= me.getCurrentPeriodNames();
		for(var i=0;i<me.currentRow.figures[me.selectedPeriod].data.length;i++){
			dataHist.push([monthNames[i], me.currentRow.figures[me.selectedPeriod].data[i]]);
		}
		
  
		  var histChart = new google.visualization.Histogram(document.getElementById('histDetailChart'));
		  histChart.draw(google.visualization.arrayToDataTable(dataHist), {
			legend: { position: 'none' },
			backgroundColor:'#fafafa',
			hAxis:{ title:'Rendimentos nos ' + me.filters.PeriodoTitle() + '(%)'},
			width:$('#modaltable').width()*0.9,
			height:$('#modaltable').height()*0.8,
			vAxis:{},
			colors: ["#ff7100","#ff6300","#ff5500","#ff4700","#ff3900","#ff2b00","#ff1c00","#ff0e00","#ff0000"],//"#ffaa00","#ff9c00","#ff8e00","#ff8000",
			histogram:{lastBucketPercentile:5}
		  });


		//$('.tooltipped').tooltip({delay: 50, html:true});
		$('#modaltable').modal('open');
		if(me.firtsTimeOpenDetailDialog){
			me.firtsTimeOpenDetailDialog = false;
			$('.carousel.carousel-slider').carousel({
				fullWidth: true,
				indicators: true
			  });
		}
		
	}
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
		
		var w =  $(window).width()* (me.isMobile ? 0.9 : 0.35);
		
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
	

	//######################
	//	WALLET
	//######################
	me.walletFunds = [
		//{name:'Fundo 1', info:{isMultimercado:true, withdrawDays:1},alocado:50000 },
		//{name:'Fundo 2', info:{isAcao:true, withdrawDays:5},alocado:50000 },
		//{name:'Fundo 3', info:{isRendaFixa:true, withdrawDays:30},alocado:35000 },
		//{name:'Fundo 4', info:{isMultimercado:true, withdrawDays:7},alocado:15000 },
		//{name:'Fundo 5', info:{isAcao:true, withdrawDays:31},alocado:5000 }
	];
	me.walletAutoCompleteList = {};
	me.canInitAutoComplete = false;
	me.showMyWalletDlg = function(erase){
		if(erase==true){
			me.walletSaveName = 'Minha Carteira';
			me.walletFunds=[];
		}
		$('#modalWallet').modal({
				complete:function(){
					if(me.walletFunds.length > 0){
						me.walletNamesList.push('Não salvo');
						if (!me.$$phase)
            				me.$apply();
							
					}
			}});
		$('#modalWallet').modal('open');
		me.updatePieChart();
		$('#modalWallet').find('input[type="text"]').focus()
	};
	me.setWalletSearchList = function(){
		var k = me.defaultLists[3].selectToArray('name');
		
		for(var i=0;i<k.length;i++){
			me.walletAutoCompleteList[k[i]]=0;
		}
		
		me.canInitAutoComplete = true;
	};
	me.walletRendaFixaPorc =0;
	me.walletMultimercadoPorc=0;
	me.walletAcaoPorc=0;
	me.walletUpdateLine = function(row){
		if(row != null)
			row.showWalletWeight = row.alocado != null;
		
			var s = me.walletFunds.sum('alocado')
		for(var i=0;i<me.walletFunds.length;i++){
			me.walletFunds[i].walletWeight = (100*me.walletFunds[i].alocado/s).toFixed(2);
		}
		
		me.walletRendaFixaPorc = ((100 * me.walletFunds.equals(function(i){return i.info.isRendaFixa;}).sum('alocado'))/s).toFixed(2);
		me.walletMultimercadoPorc = ((100 * me.walletFunds.equals(function(i){return i.info.isMultimercado;}).sum('alocado'))/s).toFixed(2);
		me.walletAcaoPorc = ((100 * me.walletFunds.equals(function(i){return i.info.isAcao;}).sum('alocado'))/s).toFixed(2);
		me.showWalletPerc=me.walletFunds.any(function(i){return i.alocado>0;})
		me.updatePieChart();
	}
	me.addToWallet = function(fund){
		if(me.walletFunds.any({uniqueID:fund.uniqueID})==false){
			me.walletFunds.push(fund);
		}
		me.showMyWalletDlg();
	}
	me.onSelectFund = function(name){
		
		var fund = me.defaultLists[3].first({name:name});
		if(fund != null && me.walletFunds.any({uniqueID:fund.uniqueID})==false){
			me.walletFunds.push(fund);
			
			if (!me.$$phase)
            	me.$apply();
		}
	}
	me.walletRemove = function(item){
		me.walletFunds.remove({uniqueID:item.uniqueID});
		me.updatePieChart();
		me.walletUpdateLine();
	}
	me.firstTimeWalletCarouse = true;
	
	me.updatePieChart = function(){
		if(me.walletFunds.length==0 || me.walletFunds.sum('alocado')==0)
			return

		// var data = google.visualization.arrayToDataTable([
		// 	['Tipo', 'Renda Fixa', 'Multimercado', 'Ações', { role: 'annotation' } ],
		// 	['', me.walletFunds.equals(function(i){return i.info.isRendaFixa;}).sum('alocado'), 
		// 		 me.walletFunds.equals(function(i){return i.info.isMultimercado;}).sum('alocado'), 
		// 		 me.walletFunds.equals(function(i){return i.info.isAcao;}).sum('alocado'),  '']
		//   ]);
		//   var view = new google.visualization.DataView(data);
		  
		//   var chart = new google.visualization.BarChart(document.getElementById('walletPieChart'));
		//   var _width = $('#walletPieChart').parent().width()*0.85;
		//   chart.draw(data, {
		// 	colors: ['#63A74A', '#ECA403','#E94D20' ],
		// 	bar: { groupWidth: '75%' },
		// 	isStacked: 'percent',
		// 	animation:{
		// 		duration: 1000,
		// 		easing: 'out',
		// 	 },
		// 	legend:{position:'top'},
		// 	width:_width,
		// 	backgroundColor:'#fafafa',
		// 	chartArea:{float:'right', backgroundColor:'#fafafa'}
		//   });

		  //withdrawDays	walletWithdrawChart
		  var d =[['Dias', 'LiquidezTotal']] ;
		  _ticks=[];

		  var m = 10;
		  for(var i=0;i<me.walletFunds.length;i++){
			if(me.walletFunds[i].info.withdrawDays > m){m = me.walletFunds[i].info.withdrawDays;}
		  }
		  
		  var tb = 0;
		  for(var i=0;i<m+1;i++){
			t = me.walletFunds.equals(function(item){return item.info.withdrawDays <= i}).sum('alocado');
			if(t != tb){
				_ticks.push(t);
				tb = t;
			}
			d.push([i.toString(),t]);
		  }

		  var dataWD = google.visualization.arrayToDataTable(d);
		  var chartWD = new google.visualization.ColumnChart(document.getElementById('resgateChart'));
  
		  chartWD.draw(dataWD, {
			animation:{
				duration: 1000,
				easing: 'out',
			 },
			 chartArea:{ backgroundColor:{fill:'#fafafa', opacity:100}},
			 legend: { position: 'none' },
			 height:60,
			 hAxis:{ textPosition: 'none',minorGridlines:{color:'none'}, ticks:[]},
			 vAxis:{textPosition: 'none',gridlines:{color:'none'}, minorGridlines:{color:'none'}},
			 //backgroundColor:'#fafafa',
			 backgroundColor: {
				fill: '#fafafa',
				fillOpacity: 0.8
			  }
		  });

		 
	}
	me.walletSaveName = 'Minha Carteira';
	me.openSavename = function(){
		$('#modalPrompt').modal('open');
		$('#modalPrompt').find('input').focus();
	};
	me.saveWallet = function(){
		me.saveWalletName();
		me.saveOnStorage(me.walletSaveName, me.walletFunds.select(['uniqueID', 'name','alocado']));
		me.getWalletList();
	};
	me.getWalletList = function(){
		me.walletNamesList = me.getFromStorage('walletNames')||[];
	};
	me.walletNamesList = [];
	me.saveWalletName = function(){
		var key = 'walletNames';
		var walletNames = me.getFromStorage(key);
		if(walletNames == null ){
			walletNames=[me.walletSaveName];
		}else{
			if(walletNames.indexOf(me.walletSaveName) == -1){
				walletNames.push(me.walletSaveName);
			}else{
				return
			}
		}
		me.saveOnStorage(key, walletNames);
	};
	me.loadWallet = function(name){
		var items = me.getFromStorage(name);
		if(items != null && me.defaultLists[3] != null){
			for(var i=0;i<items.length;i++){
				var fund = me.defaultLists[3].first({name:items[i].name});
				if(fund != null){
					me.walletFunds.push(fund);
				}
			}
		}
		me.showMyWalletDlg(false);
	};
	me.blinkLock=false;
	me.compareProp = [
		{label:'Rentabilidade no período', prop:'performance', d:2},
		{label:'Soma de pontos no ranking', prop:'totalRank', d:-1},
		{label:'Meses positivos', prop:'posNegCountRate', d:2},
		//{label:'Meses negativos', prop:'posNegCountRate', d:2},
		{label:'Média rentabilidade positiva', prop:'positiveAvg', d:2},
		{label:'Média rentabilidade negativa', prop:'negativeAvg', d:2},
		{label:'Média rendimento', prop:'average', d:2},
		{label:'Volatilidade', prop:'volatilidadeAnual', d:2},
		{label:'Correlação CDI', prop:'correlationCDI', d:-1},
		{label:'Correlação IBOV', prop:'correlationIbov', d:-1},
		{label:'Correlação S&P500', prop:'correlationSP500', d:-1},
		{label:'Sharp CDI', prop:'sharpCDI'},
		{label:'Sharp IBOV', prop:'sharpIbov'}
		
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