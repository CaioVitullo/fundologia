
var mainApp = angular.module('mainApp', ['rw.moneymask']);
mainApp.run(["$locale", function ($locale) {
    $locale.NUMBER_FORMATS.GROUP_SEP = ".";
    $locale.NUMBER_FORMATS.DECIMAL_SEP = ",";
}]);
mainApp.controller('ctrl', function ($http, $scope, $timeout, $interval) {
	var me = $scope;
	dataManager($http, me);
	histogramManager(me);
	classUtil(me);
	me.isDev = window.location.href.indexOf('dev.') >= 0;
	me.disqusOn = false;
	me.searchTxt = "";
	me.lastSearchTxt = "";
	me.showAllFilterTypeOn= true;
	me.showAllFilterInitValueOn=true;
	me.showAllFilterResgateOn = true;
	me.showAllFilterVolumeOn = true;
	me.showAllFilterPeriodoOn = true;
	me.selectedPeriod = 1;
	me.defaultSelectedPeriod =me.selectedPeriod;
	me.withdrawDays = 100;
	me.maxWithdrawDays = 100;
	me.admTx = 4;
	me.maxAdmTx = 4;
	me.volatilidade=30;
	me.maxVolatilidade=30;
	me.mobileSelectedPage = 'main';
	me.isMobile = $('#mobileMenu').is(':visible');
	
	me.searchFieldTxt = 'Pesquise e compare os melhores fundos de investimento para o seu perfil';

	me.loadCtrl = function(){
		me.getDefaultLists(function(){
			window.finishedLoading=true;
			$timeout(function(){
				if(me.canShowFeature('abertura')){
					$('#loadingFP').hide();
					$('#linkBoraProSite').fadeIn();
					
				}else{
					skipIntroduction();
				}
			},500);
		}, function(){
			me.selectFirstRow();
			me.setWalletSearchList();
			var list = me.defaultLists[3];
			me.calcFilterHistogramTxAdm(list);
			me.calcFilterHistogramResgate(list);
			me.calcFilterHistogramVolatilidade(list);
			
		});
		me.getWalletList();
		me.lastHash = me.filterHash(me.getFilterStatus());
		//me.loadHistograms(null);
		$('#chart-toast-container').removeAttr('style');
		//$('.modal').modal();
		
		me.width = $(window).width();
		// me.frases = ['o fim do achismo', 'pra quem gosta de resultado!'];
		// me.currentFrasesID = 0;	
		// if(me.isMobile==false){
		// 	$interval(function(){
		// 		me.currentFrasesID++;
		// 		if(me.currentFrasesID==me.frases.length)
		// 			me.currentFrasesID = 0;
		// 		var frase = me.frases[me.currentFrasesID];
		// 		$('#subtitle').fadeOut('slow').text(frase).fadeIn('slow');
		// 	}, 10 * 1000, 3);
		// }
		
		resizeHorizontalScroll();
	}; 
	

	me.getRoot = function(file){
		if(file == null){file='index';}
		return  window.location.href.substring(0, window.location.href.indexOf(file +'.html'));
	};
	me.lastResult = [];
	me.lastHash = null;
	me.hasMoreLines = true;
	me.noResult = false;
	me.podeSerQueTenha12 = [];
	me.podeSerQueTenha=[];
	me.defaultListSize = 30;
	me.getMainList = function(){
		if(me.checkFilterList()){
			return me.defaultLists[me.selectedPeriod];	
		}else{
			var filterStatus = me.getFilterStatus();
			var currentHash = me.filterHash(filterStatus);
			if(me.lastHash != null && me.lastHash.hasSameValuesAs(currentHash) == false){
				
				me.podeSerQueTenha12 = [];
				me.podeSerQueTenha=[];
				var fullList = me.defaultLists[3];
				var list = [];
				var count = 0;
				for(var i = 0, len = fullList.length;i<len;i++ ){
					var item = fullList[i];
					if( 
						item.figures[me.selectedPeriod] != null &&
						item.info.TypeFilter.hasAnyTrueOnSameIndex(filterStatus.Tipo) &&
						(me.withdrawDays == me.maxWithdrawDays || item.info.withdrawDays <= me.withdrawDays )&&
						(me.admTx == 4 || item.info.admTax <= me.admTx) &&
						(me.volatilidade==me.maxVolatilidade || item.figures[me.selectedPeriod].volatilidadeAnual <= me.volatilidade) &&
						(me.histogramItemFilter==null || me.verifyHistogramFilter(item) ) &&
						item.info.VolumeFilter.hasAnyTrueOnSameIndex(filterStatus.volume) && 
						(me.searchTxt == "" || (item.name.toLowerCase().indexOf(me.searchTxt.toLowerCase()) >= 0 || item.nameNoAccent.indexOf(me.searchTxt.toLowerCase()) >= 0 ))  &&
						(me.filterHideClosed == false || item.info.isClosed == false) &&
						(me.filterHideRestrict == false || item.info.restrict==false) &&
						(me.selectedChartID.length == 0 || me.selectedChartID.indexOf(item.uniqueID) >= 0) &&
						item.info.InitialValueFilter.hasAnyTrueOnSameIndex(filterStatus.Initialvalue)){
							list.push(item);
							count++;
						}
				}
				if(list.length > 0){
					if(me.currentSortCol == 1 || me.currentSortCol==7){
						if(me.sortReverse){
							list = list.sort(function(a,b){
								return a.info[me.sortColumns[me.currentSortCol]] - b.info[me.sortColumns[me.currentSortCol]];
							});
						}else{
							list = list.sort(function(a,b){
								return b.info[me.sortColumns[me.currentSortCol]] - a.info[me.sortColumns[me.currentSortCol]];
							});
						}
						
					}else{
						if(me.sortReverse){
							list = list.sort(function(a,b){
								return a.figures[me.selectedPeriod][me.sortColumns[me.currentSortCol]] - b.figures[me.selectedPeriod][me.sortColumns[me.currentSortCol]];
							});
						}else{
							list = list.sort(function(a,b){
								return b.figures[me.selectedPeriod][me.sortColumns[me.currentSortCol]] - a.figures[me.selectedPeriod][me.sortColumns[me.currentSortCol]];
							});
						}
						
					}
					if(me.lastSearchTxt != me.searchTxt)
						$timeout(function(){me.selectFirstRow();},50);
						
					me.lastSearchTxt = me.searchTxt;
					if(me.isMobile==false){
						me.calcFilterHistogramTxAdm(list);
						me.calcFilterHistogramResgate(list);
						me.calcFilterHistogramVolatilidade(list);
					}
					
					list = list.take(me.defaultListSize);
					me.hasMoreLines = count > list.length;
					me.lastHash = currentHash;
					me.lastResult = list;
					me.noResult = false;
					
					me.podeSerQueTenha=[];
					me.podeSerQueTenha12=[];
				}else{
					me.noResult = true;
					if(me.searchTxt.length > 0){
						var left = me.checkLeftFilters()==false;
						if(left == true){
							me.podeSerQueTenha=me.defaultLists[3].equals(function(item){return item.figures[me.selectedPeriod] != null}).hasText({name:me.searchTxt});
							if(me.podeSerQueTenha != null && me.podeSerQueTenha.length > 0){
								me.noResult = false;
								for(var i=0;i<me.podeSerQueTenha.length;i++){
									var f = me.podeSerQueTenha[i];
									f.notFoundDueTo = [];
									if(f.info.TypeFilter.hasAnyFalseOnSameIndex(filterStatus.Tipo)){
										f.notFoundDueTo.push('Filtro de Classificação');
									}
									if(f.info.VolumeFilter.hasAnyFalseOnSameIndex(filterStatus.volume)){
										f.notFoundDueTo.push('Filtro de Volume');
									}
									if(me.volatilidade!=me.maxVolatilidade && f.figures[me.selectedPeriod].volatilidadeAnual > me.volatilidade){
										f.notFoundDueTo.push('Filtro de Volatilidade');
									}
									if(f.info.admTax > me.admTx){
										f.notFoundDueTo.push('Filtro de Volatilidade');
									}
									if(me.withdrawDays != me.maxWithdrawDays && f.info.withdrawDays > me.withdrawDays){
										f.notFoundDueTo.push('Filtro de Resgate');
									}
									if(me.filterHideClosed == true && f.info.isClosed == true){
										f.notFoundDueTo.push('Filtro de Status(fundo fechado)');
									}
									if(me.filterHideRestrict == true && f.info.restrict == true){
										f.notFoundDueTo.push('Filtro de Status(fundo restrito)');
									}
									if(f.info.InitialValueFilter.hasAnyFalseOnSameIndex(filterStatus.Initialvalue)){
										f.notFoundDueTo.push('Filtro de aplicação inicial');
									}
									if(f.notFoundDueTo.length > 0)
									f.notFoundDueTo = f.notFoundDueTo.join(", ") + (f.notFoundDueTo.length==1 ? ' está' : ' estão') + ' ativo' + (f.notFoundDueTo.length==1 ? '' : 's'); 
								}
							}
						}
						if(me.selectedPeriod >= 1 && me.podeSerQueTenha.length==0){
							me.podeSerQueTenha12 =me.defaultLists[3].equals(function(item){return item.figures[0] != null}).hasText({name:me.searchTxt}).select('name');
							if(me.podeSerQueTenha12.length > 0){
								me.noResult = false;
							}
						}
					}
				}
					
				return list;
			}else{
				me.podeSerQueTenha12 = [];
				me.podeSerQueTenha=[];
				return me.lastResult;
			}
		}
		
	};
	me.verifyHistogramFilter = function(row){
		if(me.histogramItemFilter==null || Object.keys(me.histogramItemFilter).length == 0)
			return true;
		
		for(i in me.histogramItemFilter){
			var item = me.histogramItemFilter[i];
			if(item.type=='figure'){
				if(isBetween(row.figures[me.selectedPeriod][item.name], item.low, item.high) == false)
					return false;
			}else{
				if(isBetween(row.info[item.name], item.low, item.high) == false)
					return false;
			}
		}
		return true;
	}
	me.filterHash = function(filters){
		var a = [];
		for(i in filters){
			var f = filters[i];
			if(Array.isArray(f)){
				a.union(f);
			}
		}
		return a;
	}
	me.getFilterStatus = function(){
		return {
			period:[me.selectedPeriod],
			Tipo:me.filters.Tipo.selectToArray('checked'),
			resgate:[me.withdrawDays],
			admTx:[me.admTx],
			search:[me.searchTxt],
			volume:me.filters.volume.selectToArray('checked'),
			Initialvalue:me.filters.InitialValue.selectToArray('checked'),
			histFilter:me.histogramHash(),
			showEvenClosed:[me.filterHideClosed ? 1 : 0],
			showEvenRestrict:[me.filterHideRestrict ? 1 : 0],
			sort:[me.currentSortCol],
			sortReverse:[me.sortReverse?1:0],
			size:[me.defaultListSize],
			volatilidade:[me.volatilidade],
			selectedChartID:me.selectedChartID
		};
	};
	me.cleanAllFiltersButSearch = function(){
			me.filters.Tipo.set({checked:true});
			me.filters.volume.set({checked:true});
			me.filters.InitialValue.set({checked:true});
			me.withdrawDays = me.maxWithdrawDays;
			me.admTx = me.maxAdmTx;
			me.histogramItemFilter == null;
			me.volatilidade = me.maxVolatilidade;
			me.selectedChartID=[];
			me.podeSerQueTenha=[];
	};
	me.checkFilterList = function(){
		return me.selectedPeriod==1 &&
			me.filters.Tipo.allSetTo({checked:true}) &&
			me.filters.volume.allSetTo({checked:true}) &&
			me.filters.InitialValue.allSetTo({checked:true}) &&
			me.withdrawDays == me.maxWithdrawDays &&
			me.admTx == me.maxAdmTx &&
			me.histogramItemFilter == null && 
			me.searchTxt == "" &&
			me.filterHideClosed==false &&
			me.filterHideRestrict == false &&
			me.currentSortCol==0 &&
			me.sortReverse==true &&
			me.defaultListSize == 30 &&
			me.selectedChartID.length==0 &&
			me.volatilidade == me.maxVolatilidade;
			//me.filters.resgate.allSetTo({checked:true}) &&

	}
	me.checkLeftFilters = function(){
		return me.filters.Tipo.allSetTo({checked:true}) &&
			me.filters.volume.allSetTo({checked:true}) &&
			me.filters.InitialValue.allSetTo({checked:true}) &&
			me.withdrawDays == me.maxWithdrawDays &&
			me.admTx == me.maxAdmTx &&
			me.histogramItemFilter == null && 
			me.volatilidade == me.maxVolatilidade;
	}
	me.userHasSelectedRow=false;
	me.showMore = function(){
		me.defaultListSize += 20;
	};
	me.selectRow = function(row){
		if(me.isMobile == true){
			me.currentDetailRow = row.uniqueID;
			me.currentrow = row;
			me.showRowDetail(row, true);
			me.mobSelectPage('histogram');
		}
	};
	me.hasShowedToastForCompare=false;
	me.fundsToCompare = [];
	me.rowClick = function(row, item){
		
		me.userHasSelectedRow = !me.userHasSelectedRow;
		me.currentDetailRow = row.uniqueID;
		if(me.userHasSelectedRow && me.hasShowedToastForCompare == false){
			me.hasShowedToastForCompare=true;
			me.toast('Selecione outro fundo para compará-los separadamente!') 
		}
		if(row.selectedToCompare){
			me.fundsToCompare.remove({uniqueID:row.uniqueID});
			row.selectedToCompare=false;
		}else if(me.fundsToCompare.length <= 1){
			me.fundsToCompare.push(row);
			row.selectedToCompare = true;
			if(me.fundsToCompare.length==2)
				$('.toast').fadeOut();
		}
	};
	me.compareFundItemClick = function(index){
		if(me.fundsToCompare.length > 0){
			var id = me.fundsToCompare[index].uniqueID;
			me.fundsToCompare.remove({uniqueID:id});
			var item = me.defaultLists[me.selectedPeriod].first({uniqueID:id});
			if(item != null)
				item.selectedToCompare = false;
			var item = me.lastResult.first({uniqueID:id});
				if(item != null)
					item.selectedToCompare = false;
			
			me.cleanRowSelection();
		}
		
	};
	me.cleanRowSelection = function(){
		me.currentDetailRow = null;
		me.userHasSelectedRow = false;
	};
	me.selectFirstRow = function(){
		if(me.checkFilterList()){
			if(me.defaultLists != null && me.defaultLists[me.selectedPeriod] != null && me.defaultLists[me.selectedPeriod].length > 0)
			var row = me.defaultLists[me.selectedPeriod][0];
			if(row != null){
				me.currentDetailRow = row.uniqueID;
				me.userHasSelectedRow = false;
				me.showRowDetail(row, true);
			}
		}else{
			if(me.lastResult != null && me.lastResult.length > 0){
				var row = me.lastResult[0];
				if(row != null){
					me.currentDetailRow = row.uniqueID;
					me.userHasSelectedRow = false;
					me.showRowDetail(row, true);
				}
			}
		}
		
		
	};
	me.changePeriodo = function(){
		ga('send', {
			hitType: 'event',
			eventCategory: 'Periodo',
			eventAction: 'filter'
		  });
		me.loadHistograms(null);
	}
	me.drawLineChart = function(row, recalcWidth, element, extraOptions){
			
		
		if(isSafeToUse(google, 'visualization.arrayToDataTable') == false || 
			isSafeToUse(google, 'visualization.LineChart') == false)
			return
			
			var months = me.getPeriodNames();
			var values = row.figures[me.selectedPeriod].sequencePerformance;
			var d = [['Mês', 'Rentabilidade acumulada(%)']];
			for(var i=0;i<values.length;i++){
				d.push([months[i],values[i]])
			}
			var data = google.visualization.arrayToDataTable(d);
			
			var MM=me.getMinMaxValues();
			
			var options = {
			  
			  //title: 'Performance',
			  curveType: 'function',
			  legend: { position: 'none' },
			  width:$('#rightMenu').width(),
			  vAxis:{
				  maxValue:MM.max,
				  minValue:MM.min,
				  gridlines: { color: '#e0e0e0', count: 6} ,
				  textStyle:{color:'#9e9e9e'},//fontName:'"Roboto", sans-serif'
				  baselineColor:'#e0e0e0'
				},
				hAxis:{
					gridlines:{count:0, color: '#e0e0e0'},
					baselineColor:'#e0e0e0'
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
			var chart = new google.visualization.LineChart(document.getElementById(element));
	
			chart.draw(data, options);
			
	};
	me.drawRankChart = function(row, resizeWidth){
			
		
		if(isSafeToUse(google, 'visualization.arrayToDataTable') == false || 
			isSafeToUse(google, 'visualization.LineChart') == false)
			return
			
			var values = row.rank.take(24);
			var d = [['Mês', 'Rank']];
			var add=0;
			for(var i=0;i<values.length;i++){
				add += values[i];
				d.push([i,add])
			}
			var data = google.visualization.arrayToDataTable(d);
			
			
			
			var options = {
			  //title: 'Performance',
			  curveType: 'function',
			  legend: { position: 'none' },
			  width:$('#rightMenu').width(),
			  vAxis:{
				  maxValue:3000,
				  minValue:0,
				  gridlines: { color: '#e0e0e0', count: 6} ,
				  textStyle:{color:'#9e9e9e'},//fontName:'"Roboto", sans-serif'
				  baselineColor:'#e0e0e0'
				},
				hAxis:{
					gridlines:{count:0, color: '#e0e0e0'},
					baselineColor:'#e0e0e0'
				}
			};
			if(resizeWidth==true)
				options.width = $('#rightmenu').width();
				
			var chart = new google.visualization.LineChart(document.getElementById('ranking_chart'));
	
			chart.draw(data, options);
			
	};
	me.getFromFigure = function(row,prop){
		if(row != null && row.figures != null && row.figures[me.selectedPeriod] != null)
			return row.figures[me.selectedPeriod][prop];
		return 0;
	}
	me.getFromCurrentRow = function(prop){
		if(me.currentRow != null && me.currentRow.info.hasOwnProperty(prop))
			return me.currentRow.info[prop];
		return 0;
	}
	me.getDiasRecuperacao = function(){
		if(me.currentRow != null && me.currentRow.analiseTemer != null)
			return me.currentRow.analiseTemer.diasAteRecuperar;
		
		return 0;
	}
	me.getFromCurrentFigure = function(prop){
		return me.getFromFigure(me.currentRow, prop);
	}
	me.currentFigure=null;
	me.currentDetailRow = 0;
	me.currentRow=null;
	me.showRowDetail = function(row, first){
		me._hoverId = row.uniqueID;
		$timeout(function(){
			if(me._hoverId == row.uniqueID || first){
				if((me.currentDetailRow != row.uniqueID && me.userHasSelectedRow==false)||first){
					me.currentRow = row;
					me.currentDetailRow = row.uniqueID
					me.currentFigure= row.figures[me.selectedPeriod];
					me.drawLineChart(row);
					me.drawRankChart(row);
					//me.showHistogramPosNegMonths(row);
					me.loadHistograms(row);
					me.currentRowPosNegCountRate = me.getFromFigure(row, 'posNegCountRate');
					me.current_correlationIbov = me.getFromFigure(row, 'correlationIbov')*100;
					me.current_correlationCDI = me.getFromFigure(row, 'correlationCDI')*100;
					me.current_correlationSP500 = me.getFromCurrentFigure('correlationSP500')*100;
					//$('.tooltipped').tooltip({delay: 50, html:true});
				}
			}
		}, 120);
		
	};
	
	
	me.current_correlationIbov = 0;
	me.current_correlationCDI = 0;
	me.current_correlationSP500=0;
	
	
	me.minMaxPerformanceValues = {};
	me.getMinMaxValues = function(){
		if(me.minMaxPerformanceValues.hasOwnProperty(me.selectedPeriod))
			return me.minMaxPerformanceValues[me.selectedPeriod];

		var max = 0;
		var min=999;
		for(var i=0;i<me.defaultLists[me.selectedPeriod].length;i++){
			var items = me.defaultLists[me.selectedPeriod][i].figures[me.selectedPeriod];
			if(items != null){
				items = items.sequencePerformance;
				var _max = items.max();
				var _min = items.min();
				if(_max > max){max = _max;}
				if(_min < min){min = _min;}
			}
				
		}
		me.minMaxPerformanceValues[me.selectedPeriod] = {max:max, min:min};
		return {max:max, min:min};
		
	}
	
	me.toggleFilter = function(value, filter){

		if(value){
			filter.set({visible:true});
		}else{
			filter.setTo({default:false},{visible:false});
		}
		value = !value;
		return value;
	}
	me.changeInitialValue = function(item){
		ga('send', {
			hitType: 'event',
			eventCategory: 'Aplicacao Inicial',
			eventAction: 'filter',
			eventLabel: item.Title
		  });

		if(item.filter == false || item.checked==true)
			return

		var index = me.filters.InitialValue.indexOf(item);
		for(var i=index-1;i>=0;i--){
			me.filters.InitialValue[i].checked=!item.checked;
		}
		for(var i=index+1;i<me.filters.InitialValue.length; i++){
			me.filters.InitialValue[i].checked=item.checked;
		}
		
		me.showAllFilterInitValueOn = !me.filters.InitialValue.any({visible:true});
		me.toggleFilter(true, me.filters.InitialValue);
		//me.checkFilterTopShow(me.filters.InitialValue,me.showAllFilterInitValueOn);
	}
	me.closeModalDialog = function(name){
		$('#' + name).modal('close');
	}
	me.checkFilterTopShow = function(filter, prop, name){
		ga('send', {
			hitType: 'event',
			eventCategory: name,
			eventAction: 'filter'
		  });

		if(prop==false)
			return;

		for(var i=0;i<filter.length;i++){
			var item = filter[i];
			if(item.default==true && item.checked == true)
				return;
		}
		prop = me.toggleFilter(prop, filter);
	}
	me.valueHover = function(){
		$timeout(function(){
			if($('#rankHorizontal').is(':hover')){
				if(me.canShowFeature('doubleClickRankScroll')){
					me.toastOk('Para ver a lista completa e outras informações clique no icone logo abaixo!<a onclick="toastCallback()"> Entendi!</a>')
				}
			}
		},1500);
	};
	
	
	
	me.currentCharTitle = '';
	me.gerDefaultChartOptions = function(title){
		var w =  $('#modal1').width()*0.85;
		var h = Math.min(w / 1.61, $('#modal1').height()) 
		return {
			//width:w,
			height: h,
			chart: {
			  //title: 'Students\' Final Grades',
			  //subtitle: 'based on hours studied'
			},
			chartArea: {width: '80%', 'height': '70%', top:35},
			colors: ['#E94D20', '#ECA403', '#63A74A'],
			hAxis: {title: title},
			vAxis: {
				title: 'Rentabilidade(%) acumulada nos ' + me.filters.PeriodoTitle(),
				minValue:-0.3,
				textStyle : {
					fontSize: 12,
					'font-style':'normal',
					'font-name':'sans-serif'
				},
				format: 'percent'
			},
			legend: {position:'top'},
			
			
			tooltip:{isHtml: true}//{isHtml:true, textStyle: {color: 'black'}, showColorCode: true}
			//bubble: {textStyle: {fontSize: 11}}
		  };
	}
	me.analiseRecuperacao = {};
	me.openAnaliseDiasRecuperacao = function(){
		//
		
		me.analiseRecuperacao = {
			qtdAbaixo1:me.defaultLists[3].count(function(item){item.analiseTemer != null && item.analiseTemer.difQuota<=-1}),
			countAll:me.defaultLists[3].count(function(item){item.analiseTemer != null})
		}
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
			height:h,
			width:w,
			colors: ["#ff7100","#ff6300","#ff5500","#ff4700","#ff3900","#ff2b00","#ff1c00","#ff0e00","#ff0000"],//"#ffaa00","#ff9c00","#ff8e00","#ff8000",
			histogram:{lastBucketPercentile:5}
		  };

  
		  var chart = new google.visualization.Histogram(document.getElementById('chart_histogram_queda'));
		  chart.draw(data, options);

		//#####################################################
		  //##			GRAFICO II
		//#####################################################
		var dataSt = new google.visualization.DataTable();
		var name = 'Recuperação';
		dataSt.addColumn({type:'number',label: name});
		dataSt.addColumn('number', 'Ação');
		dataSt.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		dataSt.addColumn('number', 'Multimercado');
		dataSt.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		dataSt.addColumn('number', 'Renda Fixa');
		dataSt.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		
		
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
			}, function(){
				return item.analiseTemer != null;
			}));

	
		var chartSt = new google.visualization.ScatterChart(document.getElementById('chart_scatter_queda'));
		chartSt.draw(dataSt,  {
			title: 'Rendimento um dia após a delação vs Tempo de recuperação.',
			hAxis:{format:'percent', title:'rendimento em 18-05-2017'},
			vAxis:{title:'Quantidade de dias úteis para voltar ao patamar anterior'},
			height:h,
			width:w,
			tooltip:{isHtml: true},
			colors: ['#E94D20', '#ECA403', '#63A74A']
		  });

		//#####################################################
		//##			GRAFICO III
		//#####################################################
		var data3 = new google.visualization.DataTable();
		var name = 'Recuperação';
		data3.addColumn({type:'number',label: name});
		data3.addColumn('number', 'Ação');
		data3.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data3.addColumn('number', 'Multimercado');
		data3.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data3.addColumn('number', 'Renda Fixa');
		data3.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		
		
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
			}, function(){
				return item.analiseTemer != null;
			}));

		
		var chart3 = new google.visualization.ScatterChart(document.getElementById('chart_scatter_queda_volume'));
		chart3.draw(data3,  {
			title: 'Tempo de recuperação vs Volume.',
			hAxis:{ title:'Patrimônio', logScale:true},
			vAxis:{title:'Quantidade de dias úteis para voltar ao patamar anterior'},
			height:h,
			width:w,
			tooltip:{isHtml: true},
			colors: ['#E94D20', '#ECA403', '#63A74A']
		  });

		//#####################################################
		//##			GRAFICO IV
		//#####################################################
		var data4 = new google.visualization.DataTable();
		var name = 'Recuperação';
		data4.addColumn({type:'number',label: name});
		data4.addColumn('number', 'Ação');
		data4.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data4.addColumn('number', 'Multimercado');
		data4.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data4.addColumn('number', 'Renda Fixa');
		data4.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		
		
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
			}, function(){
				return item.analiseTemer != null;
			}));

		
		var chart4 = new google.visualization.ScatterChart(document.getElementById('chart_scatter_queda_correlIbov'));
		chart4.draw(data4,  {
			title: 'Correlação IBOV vs Queda.',
			hAxis:{ title:'Correlação IBOVESPA'},
			vAxis:{title:'Rentabilidade em 18-05-2017', format:'percent'},
			height:h,
			width:w,
			tooltip:{isHtml: true},
			colors: ['#E94D20', '#ECA403', '#63A74A']
		  });

		//#####################################################
		//##			GRAFICO V
		//#####################################################
		var data5 = new google.visualization.DataTable();
		var name = 'Recuperação';
		data5.addColumn({type:'number',label: name});
		data5.addColumn('number', 'Ação');
		data5.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data5.addColumn('number', 'Multimercado');
		data5.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data5.addColumn('number', 'Renda Fixa');
		data5.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		
		
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
			}, function(){
				return item.analiseTemer != null && item.analiseTemer.diasAteRecuperar > 0;
			}));

		
		var chart5 = new google.visualization.ScatterChart(document.getElementById('chart_scatter_queda_velocidade'));
		chart5.draw(data5,  {
			title: 'Correlação IBOV vs Velocidade de recuperação.',
			hAxis:{ title:'Correlação IBOVESPA', minValue:-1, maxValue:1},
			vAxis:{title:'Velocidade de recuperação', format:'percent'},
			height:h,
			width:w,
			tooltip:{isHtml: true},
			colors: ['#E94D20', '#ECA403', '#63A74A']
		  });


		//#####################################################
		//##			GRAFICO VI
		//#####################################################
		var data6 = new google.visualization.DataTable();
		var name = 'Recuperação';
		data6.addColumn({type:'number',label: name});
		data6.addColumn('number', 'Ação');
		data6.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data6.addColumn('number', 'Multimercado');
		data6.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data6.addColumn('number', 'Renda Fixa');
		data6.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		
		
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
			}, function(){
				return item.analiseTemer != null;
			}));

		
		var chart6 = new google.visualization.ScatterChart(document.getElementById('chart_scatter_queda_volume_velocidade'));
		chart6.draw(data6,  {
			title: 'Velocidade de recuperação vs Volume.',
			hAxis:{ title:'Volume', logScale:true},
			vAxis:{title:'Velicidade de recuparação'},
			height:h,
			width:w,
			tooltip:{isHtml: true},
			colors: ['#E94D20', '#ECA403', '#63A74A']
		  });
		$('#modalRecuperacao').modal('open');

	};
	me.openChart = function(name, propery, text){
		ga('send', {
			hitType: 'event',
			eventCategory: name,
			eventAction: 'chart'
		  });
		
		  if(propery=='diasRecuperacao'){
			  me.openAnaliseDiasRecuperacao();
			  return;
		  }

		me.currentCharTitle = name + ' vs Rentabilidade';
		if(text != null)
			me.currentChartText = text.replace('Clique e confira!', '');
		
		$('#modal1').modal('open');

		var data = new google.visualization.DataTable();
		
		data.addColumn({type:'number',label: name});
		data.addColumn('number', 'Ação');
		data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data.addColumn('number', 'Multimercado');
		data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data.addColumn('number', 'Renda Fixa');
		data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data.addColumn({'type': 'string', 'role': 'annottion'});
		
		
		data.addRows(me.getGenericData(propery, name, propery == 'admTax'?100.0:1));

		var options = me.gerDefaultChartOptions(name);
		
		if(propery == 'admTax')
		  options.hAxis.format='percent';
		if(propery == 'volume')
		  options.hAxis.logScale = true;

		//var chart = new google.charts.Scatter(document.getElementById('chart_txdm_scatter'));
		var chart = new google.visualization.ScatterChart(document.getElementById('chart_txdm_scatter'));
		var lastSelectedRow = -1;
		var _me = me;
		me.selectedChartID=[];
		me.chartSelectedFunds = [];
		me.hideChartToastHeader = false;
		if(me.isMobile==false){
			google.visualization.events.addListener(chart, 'select', function(){
				var selectedItem = chart.getSelection()[0];
				
				if (selectedItem && lastSelectedRow != selectedItem.row) {
					lastSelectedRow = selectedItem.row;
					var info = data.getValue(selectedItem.row, 7);
					if(info != null){
						var f = info.split('|');
						_me.showSelectedFund(f);
						if (!me.$$phase)
						me.$apply();
					}
				}
			});
		}
		
		//chart.draw(data, google.charts.Scatter.convertOptions(options));
		chart.draw(data, options);
	}
	me.chartSelectedFunds = [];
	me.showSelectedFund = function(data){
		console.log(data);
		if(me.chartSelectedFunds.length == 0){
			me.showChartToast=true;
		}else{
			
		}
		me.chartSelectedFunds.push({id:parseInt(data[1]), name:data[0]});
		
	}
	me.hideChartToast = function(){
		me.chartSelectedFunds = [];
		me.showChartToast = false;
	};
	me.selectedChartID = [];
	me.filterByChart = function(){
		me.selectedChartID = me.chartSelectedFunds.select('id');
		me.chartSelectedFunds = [];
		me.showChartToast=false;
		$('#modal1').modal('close');
	};
	me.cleanChartFilter = function(){
		
		me.selectedChartID=[];
	};
	me.mobSelectPage = function(page){
		if(page=='histogram')
			$timeout(function(){
				me.drawLineChart(me.currentRow, true);
				me.drawRankChart(me.currentRow, true);
				resizeHorizontalScroll();

			} ,50);
			

		me.mobileSelectedPage = page;
	};
	
	me.mobApplyFilter = function(){
		$('.button-collapse').sideNav('hide');
		$("html, body").animate({ scrollTop: 0 }, "slow");
		me.mobSelectPage('main');
	};
	me.histData = {};//histogram_posNegCountRate
	me.getAndSaveFile = function(name,after){
		if(me.histData.hasOwnProperty(name)){
			after(me.histData[name]);
			return
		}else{
			var url = 'resultadoFundo/' + name + '.txt';
			me.getGenericFile(url, function(result){
				me.histData[name]=result;
				after(result);
			});
		}
	}
	me.getAndSaveFileMany = function(files,after){
		var results = [];
		for(var i=0;i<files.length;i++){
			me.getAndSaveFile(files[i], function(result){
				results.push(result);
				if(results.length==files.length){
					if(typeof(after)=='function'){
						after(results);
					}else{
						return results;
					}
				}
			});
		}
	};
	me.closeCompareDialog = function(){
		$('.toast').fadeOut();
		me.highLightCompareDialog = false;
		me.compareDlgStillOpen = false;
		me.forceIconeCompareBlinkHard = false;
		me.compareFundItemClick(0);
		if(me.fundsToCompare.length > 0)
			me.compareFundItemClick(0);
	};
	me.openCompareDialog = function(){
		ga('send', {
			hitType: 'event',
			eventCategory: 'compare',
			eventAction: 'open dialog'
		  });

		$('.toast').fadeOut();
		$('#modalCompare').modal(
			{
				'startingTop':'3%',
				'endingTop': '4%',
				complete:function(){
					$("html, body").animate({ scrollTop: 0 }, "slow");
					me.closeCompareDialog();
					if (!me.$$phase)
						me.$apply();
		}});
		$('#modalCompare').modal('open');
		//CORRELATION
		var min = [me.fundsToCompare[0].values.length, me.fundsToCompare[1].values.length, me.filters.Periodo[me.selectedPeriod].len].min();
		me.compare_correlationF2f = me.fundsToCompare[0].values.take(min).correlation(me.fundsToCompare[1].values.take(min));

		var months = me.getCurrentPeriodNames().reverse();
		var d = [['Mês', me.fundsToCompare[0].name, me.fundsToCompare[1].name]];
		for(var i =0;i<me.fundsToCompare[0].figures[me.selectedPeriod].sequencePerformance.length;i++){
			d.push([
					months[i],
					me.fundsToCompare[0].figures[me.selectedPeriod].sequencePerformance[i],
					me.fundsToCompare[1].figures[me.selectedPeriod].sequencePerformance[i]
				]);
		}
		var data = google.visualization.arrayToDataTable(d);
  
		  var options = {
			width:$('#chartCompareDiv').width()*0.95,
			height:$('#chartCompareDiv').prev('div').height(),
			curveType: 'function',
			legend: { position: 'top' },
			hAxis: {title: me.filters.PeriodoTitle()},
			vAxis: {title: 'Rentabilidade(%) acumulada no período'},
		  };
  
		  var chart = new google.visualization.LineChart(document.getElementById('chart_compare'));
  
		  chart.draw(data, options);
		  
		 
	};
	

	me.highLightCompareDialog = false;
	me.compareDlgStillOpen = false;
	me.forceIconeCompareBlinkHard = false;
	me.showPreCompareDialog = function(){
		me.highLightCompareDialog = true;
		
		$timeout(function(){
			me.highLightCompareDialog = false;
			me.compareDlgStillOpen = true;
		},2000);
	};
	me.showCompareArrowTip = function(){
		if(true || me.canShowFeature('showCompareArrowTip')){
			me.forceIconeCompareBlinkHard=true;
			me.toastOk('Selecione outro fundo clicando no icone que esta piscando do lado do nome dos fundos.<a onclick="toastCallback()"> Entendi!</a>')
		}
	};

	me.getCurrentPeriodNames = function(alwaysFull, fullname){
		return me.getPeriodNames(me.filters.Periodo[me.selectedPeriod].len,alwaysFull, fullname);
	}
	
	me.getPeriodNames = function(m, alwaysFull, fullname){
		alwaysFull=alwaysFull==null?true:alwaysFull;
		m=m==null?36:m;
		var month = 9;
		var year = 18;
		var list = [];
		for(var i = 0;i<m;i++){
			list.push(me.getMonthName(month, year, alwaysFull || (i==m-1||month==1), fullname));
			month -=1;
			if(month == 0){
				month = 12;
				year-=1;
			}
		}
		return list;
	};
	me._monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
	me._fullMonthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
	me.getMonthName = function(monthIndex, year, full, fullname){
		if(fullname==true){
			if(full==true || full==null)
				return me._fullMonthNames[monthIndex-1] + ' de 20' + year
			return me._fullMonthNames[monthIndex-1];
		}else{
			if(full==true || full==null)
				return me._monthNames[monthIndex-1] + '/' + year
			return me._monthNames[monthIndex-1];
		}
		
	}
	me.periodName = me.getPeriodNames();
	me.filterHideClosed = false;
	me.filterHideRestrict = false;
	me.filters = {
		PeriodoTitle:function(){
			return me.filters.Periodo[me.selectedPeriod].Title.toLowerCase();},
		PeriodoLen:function(){
			return me.filters.Periodo[me.selectedPeriod].len;
		},
		Periodo : [
			{id:0,len:12, Title:'Últimos 12 meses', visible:true, default:true},
			{id:1,len:24, Title:'Últimos 24 meses', visible:true, default:true},
			{id:2,len:36, Title:'Últimos 36 meses', visible:true, default:true}
			//{id:3, Title:'2017', visible:false, default:false},
			//{id:4, Title:'2016', visible:false, default:false}
		],
		Tipo : [
			{id:0, Title:'Renda Fixa', checked:true, visible:true, default:true},
			{id:1, Title:'Multimercado', checked:true, visible:true, default:true},
			{id:2, Title:'Ações', checked:true, visible:true, default:true},
			{id:3, Title:'Long And Short', checked:true, visible:false, default:false},
			{id:4, Title:'Cambial', checked:true, visible:false, default:false},
			{id:5, Title:'Indexado', checked:true, visible:false, default:false},
			{id:6, Title:'Exterior', checked:true, visible:false, default:false},
		],
		InitialValue : [
			{id:0, Title:'500', checked:true, visible:false, default:false, filter:true, disabled:true},
			{id:1, Title:'1k', checked:true, visible:true, default:true, filter:true, disabled:false},
			{id:2, Title:'3k', checked:true, visible:false, default:false, filter:true, disabled:false},
			{id:3, Title:'5k', checked:true, visible:true, default:true, filter:true, disabled:false},
			{id:4, Title:'10k', checked:true, visible:false, default:false, filter:true, disabled:false},
			{id:5, Title:'15k', checked:true, visible:false, default:false, filter:true, disabled:false},
			{id:6, Title:'20k', checked:true, visible:false, default:false, filter:true, disabled:false},
			{id:7, Title:'25k', checked:true, visible:true, default:true, filter:true, disabled:false},
			{id:8, Title:'30k', checked:true, visible:false, default:false, filter:true, disabled:false},
			{id:9, Title:'50k', checked:true, visible:false, default:false, filter:true, disabled:false},
			{id:10, Title:'200k', checked:true, visible:false, default:false, filter:true, disabled:false}
			//{id:11, Title:'Qualificados', checked:true, visible:false, default:false, filter:false}
		],
		resgate : [
			{id:0, Title:'D+0', checked:true, visible:true, default:true},
			{id:1, Title:'D+1', checked:true, visible:true, default:true},
			{id:2, Title:'D+7', checked:true, visible:true, default:true},
			{id:3, Title:'D+30', checked:true, visible:false, default:false},
			{id:4, Title:'D+60', checked:true, visible:false, default:false}
		],
		volume : [
			{id:0, Title:'1M', checked:true, visible:true, default:true},
			{id:1, Title:'10M', checked:true, visible:true, default:true},
			{id:2, Title:'100M', checked:true, visible:true, default:true},
			{id:3, Title:'500M', checked:true, visible:false, default:false},
			{id:4, Title:'1B', checked:true, visible:false, default:false}
		]
	};
	
});


mainApp.filter('highlight', function($sce) {
    return function(text, phrase) {
      if (phrase) text = text.replace(new RegExp('('+phrase+')', 'gi'),
        '<span class="highlighted">$1</span>')

      return $sce.trustAsHtml(text)
    }
});
mainApp.filter('percentage', ['$filter', function($filter) {
    return function(input, decimals) {
		if(input=='')
			return'';
		if(decimals==-1)
			return input;
		return $filter('number')(input, decimals)+'%';
    };
}]);
mainApp.filter('rounded', ['$filter', function($filter) {
    return function(input, decimals) {
        return $filter('number')(input, decimals);
    };
}]);
mainApp.filter('trusted', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}]);
mainApp.directive('myHistogram', function(){
	return {
		restrict:'E',
		scope:{
			histogram:'=',
			value:'=',
			classification:'=',
			showChart:'@',
			chartTitle:'@',
			property:'@',
			type:'@',
			currentrow:'=',
			tooltip:"@",
			correlation:'=',
			sufix:'@',
			reversecolor:'@',
			titleTooltip:'@',
			fn:'&',
			update:'&'
		},
		replace:true,
		templateUrl:'templates/histogram.html',
		controller:function($scope){
			if(typeof($scope.reversecolor)=='undefined')
				$scope.reversecolor= '';

			$scope.extraTxt ='';
			$scope.classificationType='';
			$scope._zscore=0;
			$scope.calc_zscore = function(){
				if($scope.classification==0){
					$scope.extraTxt= 'dos fundos de Renda Fixa';
					$scope.classificationType='rf';
				}else if($scope.classification==1){
					$scope.extraTxt=  'dos fundos Multimercados';
					$scope.classificationType='mm';
				}else if($scope.classification==2){
					$scope.extraTxt=  'dos fundos de Ação';
					$scope.classificationType='ac';
				}
					
				var m = ($scope.value - $scope.histogram.avg[$scope.classification])/$scope.histogram.stDev[$scope.classification];
				var v= Math.floor(m);
				if(v<0){
					$scope.extraTxtClass = 'zcm' + Math.min(4, Math.abs(v));
					$scope._zscore =-Math.min(100, Math.abs(100*m/4.0));
				}else{
					$scope.extraTxtClass = 'zc' + Math.min(4, v);
					$scope._zscore = Math.min(100, 100*m/4.0);
				}
				$scope.update({
					zscore:$scope._zscore,
					prop:$scope.property,
					text:v
				})
				return v;

			};

			$scope.getWidth = function(col){
				if($scope._zscore <0){
					switch(col){
						case 0:
							return (100-Math.abs($scope._zscore))/2;
						case 1:
							return Math.abs($scope._zscore)/2;
						case 2:
							return 25;
						case 3:
							return 25;
					}
				}else{
					switch(col){
						case 0:
							return 25;
						case 1:
							return 25;
						case 2:
							return Math.abs($scope._zscore)/2;
						case  3:
							return (100 - Math.abs($scope._zscore))/2;
					}
				}
			}
			
			$scope.histClick = function(histogram,item, property, type){
				$scope.fn({
					hist:histogram,
					item:item,
					property:property,
					type:type});
			}
		}
	};
});
mainApp.directive('rdHistogram', function(){
	return {
		restrict:'E',
		scope:{
			histogram:'=',
			tooltip:"@",
			classification:'=',
			sufix:'@'
		},
		replace:true,
		templateUrl:'templates/readOnlyHistogram.html'
	};
});

mainApp.directive('autocomplete', function(){
	return {
		restrict:'E',
		replace:true,
		templateUrl:'templates/autocomplete.html',
		scope:{
			list:'=',
			fn:'&'
		},
		link: function($scope, $element, attr, parentDirectCtrl){
			var rnd = (9999 + Math.random() * 999999999).toFixed(0).toString()
			$($element).find('input').autocomplete({
				data: $scope.list,
				onAutocomplete:function(name){
					$scope.onSelectItem(name);
				}
			  }).attr('id',rnd );
			$($element).find('label').attr('for',rnd );
		},controller:function($scope){
			$scope.txt='';
			$scope.onSelectItem = function(name){
				$scope.fn({name:name});
				$scope.txt='';
				if (!$scope.$$phase)
					$scope.$apply();
			}
		}

	};
});

google.charts.load('current', {'packages':['corechart', 'scatter', 'bar']});
google.charts.setOnLoadCallback(function(){
	window.googleChartHasFinished = true;
});

$(document).ready(function(){
	//$('.tooltipped').tooltip({delay: 50, html:true});
	$('.modal').modal({
			'startingTop':'3%',
			'endingTop': '4%'
			//ready: function(modal, trigger) { 
			//	$(modal).css('top','4%');
			//}
		});
	resizeHorizontalScroll();
	$('#toast-container').removeAttr('style')
	$(".dropdown-trigger").dropdown();
});

$(window).resize(function(){
	resizeHorizontalScroll();
});
function resizeHorizontalScroll (){
	ww = $('#horizontalScollParent').width()
	$('#rankHorizontal').css('maxHeight', ww + 'px')
	$('#rankHorizontal').css('marginBottom',-(ww-100) + 'px')
}
function removeRotateGif(){
	$('.rotate').remove();
}

mainApp.config(function($provide) {
    $provide.decorator("$exceptionHandler", ['$delegate', function($delegate) {
        return function(exception, cause) {
            $delegate(exception, cause);
			var msg = exception.message + '\nStack:' + JSON.stringify(exception.stack);
			logErrorOnHiddenField(msg);
        };
    }]);
});


