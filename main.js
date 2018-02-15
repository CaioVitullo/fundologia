
var mainApp = angular.module('mainApp', []);

mainApp.controller('ctrl', function ($http, $scope) {
	var me = $scope;
	dataManager($http, me);
	histogramManager(me);
	classUtil(me);

	me.showAllFilterTypeOn= true;
	me.showAllFilterInitValueOn=true;
	me.showAllFilterResgateOn = true;
	me.showAllFilterVolumeOn = true;
	me.showAllFilterPeriodoOn = true;
	me.selectedPeriod = 1;
	me.defaultSelectedPeriod =me.selectedPeriod;
	me.withdrawDays = 100;
	me.admTx = 4;
	
	me.loadCtrl = function(){
		me.getDefaultLists(function(){
			$('#preloading').hide();
		});
		me.lastHash = me.filterHash(me.getFilterStatus());
		me.loadHistograms(null);
	}; 
	

	me.getRoot = function(file='index'){
		return  window.location.href.substring(0, window.location.href.indexOf(file +'.html'));
	};
	me.lastResult = [];
	me.lastHash = null;
	
	me.getMainList = function(){
		if(me.checkFilterList()){
			return me.defaultLists[me.selectedPeriod];	
		}else{
			var filterStatus = me.getFilterStatus();
			var currentHash = me.filterHash(filterStatus);
			if(me.lastHash != null && me.lastHash.hasSameValuesAs(currentHash) == false){
				var fullList = me.defaultLists[3];
				var list = [];
				for(var i = 0, len = fullList.length;i<len;i++ ){
					var item = fullList[i];
					if(
						item.figures[me.selectedPeriod] != null &&
						item.info.TypeFilter.hasAnyTrueOnSameIndex(filterStatus.Tipo) &&
						(me.withdrawDays == 100 || item.info.withdrawDays <= me.withdrawDays )&&
						(me.admTx == 4 || item.info.admTax <= me.admTx) &&
						(me.histogramItemFilter==null || me.verifyHistogramFilter(item) ) &&
						item.info.VolumeFilter.hasAnyTrueOnSameIndex(filterStatus.volume) && 
						item.info.InitialValueFilter.hasAnyTrueOnSameIndex(filterStatus.Initialvalue)){
							list.push(item);
						}
				}
				if(list.length > 0)
					list = list.sort(function(a,b){
						return b.figures[me.selectedPeriod].performance - a.figures[me.selectedPeriod].performance;
					});
				list = list.take(30);
				me.lastHash = currentHash;
				me.lastResult = list;
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
			volume:me.filters.volume.selectToArray('checked'),
			Initialvalue:me.filters.InitialValue.selectToArray('checked'),
			histFilter:me.histogramHash()
		};
	};
	
	me.checkFilterList = function(){
		return me.filters.Tipo.allSetTo({checked:true}) &&
			me.filters.volume.allSetTo({checked:true}) &&
			me.filters.InitialValue.allSetTo({checked:true}) &&
			me.withdrawDays == 100 &&
			me.admTx == 4 &&
			me.histogramItemFilter == null

			//me.filters.resgate.allSetTo({checked:true}) &&

	}
	me.userHasSelectedRow=false;
	
	me.hasShowedToastForCompare=false;
	me.rowClick = function(row){
		me.userHasSelectedRow = !me.userHasSelectedRow;
		me.currentDetailRow = row.id;
		if(me.userHasSelectedRow && me.hasShowedToastForCompare == false){
			me.hasShowedToastForCompare=true;
			me.toast('Selecione outro fundo para compará-los separadamente!') 
		}
	};
	
	me.drawLineChart = function(row){
			
		
		if(isSafeToUse(google, 'visualization.arrayToDataTable') == false || 
			isSafeToUse(google, 'visualization.LineChart') == false)
			return
			
			var values = row.figures[me.selectedPeriod].sequencePerformance;
			var d = [['Mês', 'Performance']];
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
	
			var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
	
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
	me.currentDetailRow = 0;
	me.currentRow=null;
	me.showRowDetail = function(row){
		if(me.currentDetailRow != row.id && me.userHasSelectedRow==false){
			me.currentRow = row;
			me.currentDetailRow = row.id
			me.drawLineChart(row);
			//me.showHistogramPosNegMonths(row);
			me.loadHistograms(row);
			me.currentRowPosNegCountRate = me.getFromFigure(row, 'posNegCountRate');
			me.current_correlationIbov = me.getFromFigure(row, 'correlationIbov')*100;
			me.current_correlationCDI = me.getFromFigure(row, 'correlationCDI')*100;
			me.current_correlationSP500 = me.getFromCurrentFigure('correlationSP500')*100;
			$('.tooltipped').tooltip({delay: 50, html:true});
		}
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
		for(var i=0;i<me.defaultLists[3].length;i++){
			var items = me.defaultLists[3][i].figures[me.selectedPeriod];
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
	me.getWidth = function(value,col){
		if(value <0){
			switch(col){
				case 0:
					return (100-Math.abs(value))/2;
				case 1:
					return Math.abs(value)/2;
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
					return Math.abs(value)/2;
				case  3:
					return (100 - Math.abs(value))/2;
			}
		}
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
		var index = me.filters.InitialValue.indexOf(item);
		for(var i=index-1;i>=0;i--){
			me.filters.InitialValue[i].checked=item.checked;
		}
		for(var i=index+1;i<me.filters.InitialValue.length; i++){
			me.filters.InitialValue[i].checked=!item.checked;
		}
		
	}
	me.closeModalDialog = function(name){
		$('#' + name).modal('close');
	}
	
	me.chartData = {}
	me.getGenericData = function(propery){
		if(me.chartData.hasOwnProperty(propery)){
			if(me.chartData[propery].hasOwnProperty(me.selectedPeriod))
				return me.chartData[propery][me.selectedPeriod];
		}
		
			var d= [];
			for(var i=0;i<me.defaultLists[3].length;i++){
				var item = me.defaultLists[3][i]
				var fig = item.figures[me.selectedPeriod];
				if(fig != null){
					
					d.push([
						
						
						item.info.hasOwnProperty(propery) ? item.info[propery] : fig[propery],
						item.info.isAcao ? fig.performance : null,
						item.info.isMultimercado ? fig.performance : null,
						item.info.isRendaFixa ? fig.performance : null,
						item.name 
						
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
			vAxis: {title: 'Performance'},
			legend: 'none',
			aggregationTarget:'none'
			//tooltip:{ textStyle: {color: 'black'}, showColorCode: true}
			//bubble: {textStyle: {fontSize: 11}}
		  };
	}
	me.openChart = function(name, propery){
		me.currentCharTitle = name + ' vs Performance';
		$('#modal1').modal('open');

		var data = new google.visualization.DataTable();
		
		data.addColumn('number', name);
		data.addColumn('number', 'Ação');
		data.addColumn('number', 'Multimercado');
		data.addColumn('number', 'Renda Fixa');
		data.addColumn({'type': 'string', 'role': 'annotation', p:{role:'annotation'}});
		
		
		data.addRows(me.getGenericData(propery));

        var options = me.gerDefaultChartOptions(name);

        var chart = new google.charts.Scatter(document.getElementById('chart_txdm_scatter'));

        chart.draw(data, google.charts.Scatter.convertOptions(options));
	}
	
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
	me.openBubbleChart = function(){
		me.currentCharTitle =  ' vs Performance';
		$('#modal1').modal('open');

		var d = [['ID', 'Mêses Positivos', 'Relação ganho/perda', 'Classificação', 'Rentabilidade']];
			for(var i=0;i<me.defaultLists[3].length;i++){
				var item = me.defaultLists[3][i]
				var fig = item.figures[me.selectedPeriod];
				if(fig != null){
					
					d.push([
						item.name,
						fig.posNegCountRate,
						fig.posNegAvgRate,
						item.info.isAcao ? 'Ação': item.info.isMultimercado ? 'Multimercado' : 'Renda Fixa',
						fig.performance
					])
				}		
			}
			var data = google.visualization.arrayToDataTable(d);
			
			  var options = me.gerDefaultChartOptions();
		
			  var chart = new google.visualization.BubbleChart(document.getElementById('chart_txdm_scatter'));
			  chart.draw(data, options);
	}
	

	me.filters = {
		Periodo : [
			{id:0, Title:'Últimos 12 mêses', visible:true, default:true},
			{id:1, Title:'Últimos 24 mêses', visible:true, default:true},
			{id:2, Title:'Últimos 36 mêses', visible:true, default:true},
			{id:3, Title:'2017', visible:false, default:false},
			{id:4, Title:'2016', visible:false, default:false}
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
			{id:0, Title:'500', checked:true, visible:false, default:false},
			{id:1, Title:'1k', checked:true, visible:true, default:true},
			{id:2, Title:'3k', checked:true, visible:false, default:false},
			{id:3, Title:'5k', checked:true, visible:true, default:true},
			{id:4, Title:'10k', checked:true, visible:false, default:false},
			{id:5, Title:'15k', checked:true, visible:false, default:false},
			{id:6, Title:'20k', checked:true, visible:false, default:false},
			{id:7, Title:'25k', checked:true, visible:true, default:true},
			{id:8, Title:'30k', checked:true, visible:false, default:false},
			{id:9, Title:'50k', checked:true, visible:false, default:false},
			{id:10, Title:'200k', checked:true, visible:false, default:false},
			{id:11, Title:'Qualificados(1M)', checked:true, visible:false, default:false}
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
        return $filter('number')(input, decimals)+'%';
    };
}]);
mainApp.filter('rounded', ['$filter', function($filter) {
    return function(input, decimals) {
        return $filter('number')(input, decimals);
    };
}]);

mainApp.directive('myHistogram', function(){
	return {
		restrict:'E',
		scope:{
			histogram:'=',
			value:'=',
			showChart:'@',
			chartTitle:'@',
			property:'@',
			type:'@',
			currentrow:'=',
			tooltip:"@",
			correlation:'=',
			sufix:'@'
		},
		replace:true,
		templateUrl:'templates/histogram.html'
	};
});

google.charts.load('current', {'packages':['corechart', 'scatter']});
//google.charts.setOnLoadCallback(drawChart);

$(document).ready(function(){
	$('.tooltipped').tooltip({delay: 50});
	$('.modal').modal();
});