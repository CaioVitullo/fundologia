
var mainApp = angular.module('mainApp', []);

mainApp.controller('ctrl', function ($http, $scope, $timeout, $interval) {
	var me = $scope;
	dataManager($http, me);
	histogramManager(me);
	classUtil(me);
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
	me.admTx = 4;
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
					$('#linkBoraProSite').fadeIn();
				}else{
					skipIntroduction();
				}
			},500);
		}, function(){
			me.selectFirstRow();
		});
		me.lastHash = me.filterHash(me.getFilterStatus());
		//me.loadHistograms(null);
			
		$('.modal').modal();
		
		me.width = $(window).width();
		me.frases = ['o fim do achismo', 'pra quem gosta de resultado!', 'teste teste teste'];
		me.currentFrasesID = 0;	
		if(me.isMobile==false){
			$interval(function(){
				me.currentFrasesID++;
				if(me.currentFrasesID==me.frases.length)
					me.currentFrasesID = 0;
				var frase = me.frases[me.currentFrasesID];
				$('#subtitle').fadeOut('slow').text(frase).fadeIn('slow');
			}, 10 * 1000, 3);
		}
		
		resizeHorizontalScroll();
	}; 
	

	me.getRoot = function(file='index'){
		return  window.location.href.substring(0, window.location.href.indexOf(file +'.html'));
	};
	me.lastResult = [];
	me.lastHash = null;
	me.hasMoreLines = true;
	me.noResult = false;
	me.defaultListSize = 30;
	me.getMainList = function(){
		if(me.checkFilterList()){
			return me.defaultLists[me.selectedPeriod];	
		}else{
			var filterStatus = me.getFilterStatus();
			var currentHash = me.filterHash(filterStatus);
			if(me.lastHash != null && me.lastHash.hasSameValuesAs(currentHash) == false){
				var fullList = me.defaultLists[3];
				var list = [];
				var count = 0;
				for(var i = 0, len = fullList.length;i<len;i++ ){
					var item = fullList[i];
					if( 
						item.figures[me.selectedPeriod] != null &&
						item.info.TypeFilter.hasAnyTrueOnSameIndex(filterStatus.Tipo) &&
						(me.withdrawDays == 100 || item.info.withdrawDays <= me.withdrawDays )&&
						(me.admTx == 4 || item.info.admTax <= me.admTx) &&
						(me.volatilidade==me.maxVolatilidade || item.figures[me.selectedPeriod].volatilidadeAnual <= me.volatilidade) &&
						(me.histogramItemFilter==null || me.verifyHistogramFilter(item) ) &&
						item.info.VolumeFilter.hasAnyTrueOnSameIndex(filterStatus.volume) && 
						(me.searchTxt == "" || (item.name.toLowerCase().indexOf(me.searchTxt.toLowerCase()) >= 0 || item.nameNoAccent.indexOf(me.searchTxt.toLowerCase()) >= 0 ))  &&
						(me.filterHideClosed == false || item.info.isClosed == false) &&
						(me.filterHideRestrict == false || item.info.restrict==false) &&
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
					me.hasMoreLines = count > list.length;
					list = list.take(me.defaultListSize);
					me.lastHash = currentHash;
					me.lastResult = list;
				}
					
				
				return list;
			}else{
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
			volatilidade:[me.volatilidade]
		};
	};
	
	me.checkFilterList = function(){
		return me.filters.Tipo.allSetTo({checked:true}) &&
			me.filters.volume.allSetTo({checked:true}) &&
			me.filters.InitialValue.allSetTo({checked:true}) &&
			me.withdrawDays == 100 &&
			me.admTx == 4 &&
			me.histogramItemFilter == null && 
			me.searchTxt == "" &&
			me.filterHideClosed==false &&
			me.filterHideRestrict == false &&
			me.currentSortCol==0 &&
			me.sortReverse==true &&
			me.defaultListSize == 30 &&
			me.volatilidade == me.maxVolatilidade;
			//me.filters.resgate.allSetTo({checked:true}) &&

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
	me.drawLineChart = function(row, recalcWidth){
			
		
		if(isSafeToUse(google, 'visualization.arrayToDataTable') == false || 
			isSafeToUse(google, 'visualization.LineChart') == false)
			return
			
			var values = row.figures[me.selectedPeriod].sequencePerformance;
			var d = [['Mês', 'Rentabilidade(%)']];
			for(var i=0;i<values.length;i++){
				d.push([i,values[i]])
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
				options.width = $('#rightmenu').width();
	
			var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
	
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
					me.toastOk('Duplo click para visualizar a lista completa!<a onclick="toastCallback()"> Entendi!</a>')
				}
			}
		},1500);
	};
	
	me.chartData = {}
	me.getGenericData = function(propery, name){
		if(me.chartData.hasOwnProperty(propery)){
			if(me.chartData[propery].hasOwnProperty(me.selectedPeriod))
				return me.chartData[propery][me.selectedPeriod];
		}
		
			var d= [];
			var fn = function(item, fig){
				html= '<h5 style="width:300px;font-size:1.3rem;">' + item.name + '</h5><p>' + name + ': ' + (item.info.hasOwnProperty(propery) ? item.info[propery] : fig[propery]) + '</p>';
				html += '<p>Rendimento: ' + fig.performance + '% acumulado nos ' + me.filters.Periodo[me.selectedPeriod].Title.toLowerCase();
				return html;
			}
			for(var i=0;i<me.defaultLists[3].length;i++){
				var item = me.defaultLists[3][i]
				var fig = item.figures[me.selectedPeriod];
				if(fig != null){
					
					d.push([
						item.info.hasOwnProperty(propery) ? item.info[propery] : fig[propery],
						item.info.isAcao ? fig.performance : null,
						fn(item, fig) ,
						item.info.isMultimercado ? fig.performance : null,
						fn(item, fig) ,
						item.info.isRendaFixa ? fig.performance : null,
						fn(item, fig)
					])
				}		
			}

			if(me.chartData.hasOwnProperty(propery) == false)
				me.chartData[propery] = {};
			me.chartData[propery][me.selectedPeriod]=d;
			return d;
	}
	
	me.currentCharTitle = '';
	me.gerDefaultChartOptions = function(title){
		var w =  $('#modal1').width()*0.95;
		var h = Math.min(w / 1.61, $('#modal1').height()) * 0.85;
		return {
			width:w,
			height: h,
			chart: {
			  //title: 'Students\' Final Grades',
			  //subtitle: 'based on hours studied'
			},
			colors: ['#E94D20', '#ECA403', '#63A74A'],
			hAxis: {title: title},
			vAxis: {title: 'Rentabilidade(%) acumulada no período'},
			legend: 'none',
			//aggregationTarget:'none',
			
			tooltip:{isHtml: true}//{isHtml:true, textStyle: {color: 'black'}, showColorCode: true}
			//bubble: {textStyle: {fontSize: 11}}
		  };
	}
	me.openChart = function(name, propery, text){
		ga('send', {
			hitType: 'event',
			eventCategory: name,
			eventAction: 'chart'
		  });

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
		
		
		data.addRows(me.getGenericData(propery, name));

        var options = me.gerDefaultChartOptions(name);
		
		//var chart = new google.charts.Scatter(document.getElementById('chart_txdm_scatter'));
		var chart = new google.visualization.ScatterChart(document.getElementById('chart_txdm_scatter'));

		//chart.draw(data, google.charts.Scatter.convertOptions(options));
		chart.draw(data, options);
	}
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
	me.closeCompareDialog = function(){
		$('.toast').fadeOut();
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
		$('#modalCompare').modal({complete:function(){
			$("html, body").animate({ scrollTop: 0 }, "slow");
			me.compareFundItemClick(0);
			me.compareFundItemClick(0);
			if (!me.$$phase)
            	me.$apply();
		}});
		$('#modalCompare').modal('open');

		var d = [['Mês', me.fundsToCompare[0].name, me.fundsToCompare[1].name]];
		for(var i =0;i<me.fundsToCompare[0].figures[me.selectedPeriod].sequencePerformance.length;i++){
			d.push([i,
					me.fundsToCompare[0].figures[me.selectedPeriod].sequencePerformance[i],
					me.fundsToCompare[1].figures[me.selectedPeriod].sequencePerformance[i]
				]);
		}
		var data = google.visualization.arrayToDataTable(d);
  
		  var options = {
			width:$('#chartCompareDiv').width()*0.95,
			height:$('#chartCompareDiv').prev('div').height(),
			curveType: 'function',
			legend: { position: 'bottom' }
		  };
  
		  var chart = new google.visualization.LineChart(document.getElementById('chart_compare'));
  
		  chart.draw(data, options);
		  
		 
	};
	me.groupedRankList = [];
	me.openRankDialog = function(row){
		ga('send', {
			hitType: 'event',
			eventCategory: 'view detail',
			eventAction: 'open dialog',
			eventLabel: row.name
		  });

		if(me.isMobile == true){
			me.selectRow(row);
			return;
		}
		var first = true;
		me.groupedRankList = [];
		var month = 2;
		var year = 18;
		var list = [];
		var len = me.filters.Periodo[me.selectedPeriod].len;
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
		//$('.tooltipped').tooltip({delay: 50, html:true});
		$('#modaltable').modal('open');
	}
	me.getPeriodNames = function(){
		var month = 2;
		var year = 18;
		var list = [];
		for(var i = 0;i<36;i++){
			list.push(me.getMonthName(month, year));
			month -=1;
			if(month == 0){
				month = 12;
				year-=1;
			}
		}
		return list;
	};
	me._monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
	me.getMonthName = function(monthIndex, year){
		return me._monthNames[monthIndex-1] + '/' + year
	}
	me.periodName = me.getPeriodNames();
	me.filterHideClosed = false;
	me.filterHideRestrict = false;
	me.filters = {
		PeriodoTitle:function(){
			return me.filters.Periodo[me.selectedPeriod].Title.toLowerCase();},
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
			{id:0, Title:'500', checked:true, visible:false, default:false, filter:true},
			{id:1, Title:'1k', checked:true, visible:true, default:true, filter:true},
			{id:2, Title:'3k', checked:true, visible:false, default:false, filter:true},
			{id:3, Title:'5k', checked:true, visible:true, default:true, filter:true},
			{id:4, Title:'10k', checked:true, visible:false, default:false, filter:true},
			{id:5, Title:'15k', checked:true, visible:false, default:false, filter:true},
			{id:6, Title:'20k', checked:true, visible:false, default:false, filter:true},
			{id:7, Title:'25k', checked:true, visible:true, default:true, filter:true},
			{id:8, Title:'30k', checked:true, visible:false, default:false, filter:true},
			{id:9, Title:'50k', checked:true, visible:false, default:false, filter:true},
			{id:10, Title:'200k', checked:true, visible:false, default:false, filter:true}
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



mainApp.filter('percentage', ['$filter', function($filter) {
    return function(input, decimals) {
		if(input=='')
			return'';
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
			fn:'&'
			
			
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

google.charts.load('current', {'packages':['corechart', 'scatter']});
//google.charts.setOnLoadCallback(drawChart);

$(document).ready(function(){
	//$('.tooltipped').tooltip({delay: 50, html:true});
	$('.modal').modal();
	resizeHorizontalScroll();
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