function histogramManager(me){
    me.histogramPosNegRate = [];
	me.histogramPosNegAvgRate=[];
	me.histogramTxAdm = [];
	me.histogramCorrelIbov = [];
	me.histogramCorrelCDI = [];
	me.histogramCorrelSP500 = [];
	me.histogramPerformance=[];
	me.histogramStDev=[];
	me.histogramAvg=[];
	me.histogramAboveCDI=[];
	me.histogramAboveIBOV=[];
	me.histDiasRecuperacao = [];

	me.currentRowHistPosNegMonth = 0;
	me.currentRowHistPosNegAvgMonth = 0;
	me.currentRowHistCorrelIbov = 0;
	me.currentRowHistCorrelCDI = 0;
	me.currentRowHistCorrelSP500 = 0;
	me.currentRowPosNegCountRate=0;
	me.currentRowHistPerformance=0;
	me.currentRowHistStDev=0;
	me.currentRowHistAvg=0;
	me.currentRowTxAdm=0;
	me.currentRowAboveCDI=0;
	me.currentRowAboveIBOV=0;
	me.currentRowDiasRecuperacao=0;
   
    me.histClick = function(hist,item, property, type){
        if(me.canShowFeature('toast_filtroPorHistograma'))
            me.toastOk('Boa!! Você ativou o filtro por histograma. Para desfazer basta clicar na mesma barra novamente.<a onclick="toastCallback()">Entendi!</a>');
        if(compareIfSafe(item, 'isFiltering', true)){
			item.isFiltering=false;
			delete me.histogramItemFilter[property];
			if(Object.keys(me.histogramItemFilter).length == 0)
				me.histogramItemFilter = null;
		}else{
			hist.data.set({isFiltering:false});
			if(me.histogramItemFilter == null)
				me.histogramItemFilter = {};
			me.histogramItemFilter[property] = {name:property, low:item.low, high:item.high, type:type};
            
            item.isFiltering = true;
		}	
	};
	me.cleanHistFilter = function(){
		me.histogramItemFilter = null;
	};
	me.histupate = function(zscore, prop, text){
		
		if(me.currentRow != null){
			if(me.currentRow.hasOwnProperty('zscores')==false){
				me.currentRow.zscores={};
			}
			
			me.currentRow.zscores[prop]={p:zscore, z:text};
		}
	}
	me.histogram_info={low:0, high:0, class:''};
	me.histHover = function(histogram,item){
		me.showMesesPositivos = false;
		me.showMesesNegativos = false;
		me.histogram_info.low = item.low;
		me.histogram_info.high = item.high;
		me.histogram_info.class='histInfoColor' + (9-histogram.data.indexOf(item));
	}
    me.loadHistograms = function(row){
		me.showGenereicHist(row, 'histogramAboveCDI', 'monthAboveCDI','currentRowAboveCDI' ,'histogram_MonthsAboveCDI_'+ me.selectedPeriod);
		me.showGenereicHist(row, 'histogramAboveIBOV', 'monthsAboveIBOV','currentRowAboveIBOV' ,'histogram_MonthsAboveIBOV_'+ me.selectedPeriod);
		me.showGenereicHist(row, 'histogramPosNegRate', 'posNegCountRate','currentRowHistPosNegMonth' ,'histogram_posNegCountRate_'+ me.selectedPeriod);
		me.showGenereicHist(row, 'histogramPosNegAvgRate', 'posNegAvgRate','currentRowHistPosNegAvgMonth' ,'histogram_posNegAverageRate_'+ me.selectedPeriod);
		me.showGenereicHist(row, 'histogramCorrelIbov', 'correlationIbov','currentRowHistCorrelIbov' ,'histogramCorrelationIbov_'+ me.selectedPeriod);
		me.showGenereicHist(row, 'histogramCorrelCDI', 'correlationCDI','currentRowHistCorrelCDI' ,'histogramCorrelationCDI_'+ me.selectedPeriod);
		me.showGenereicHist(row, 'histogramCorrelSP500', 'correlationSP500','currentRowHistCorrelSP500' ,'histogramCorrelationSP500_'+ me.selectedPeriod);
		me.showGenereicHist(row, 'histogramPerformance', 'performance','currentRowHistPerformance' ,'histogram_Performance_'+ me.selectedPeriod);
		me.showGenereicHist(row, 'histogramStDev', 'volatilidadeAnual','currentRowHistStDev' ,'histogram_stDev_'+ me.selectedPeriod);
		me.showGenereicHist(row, 'histogramAvg', 'average','currentRowHistAvg' ,'histogram_avg_'+ me.selectedPeriod);
		me.showGenereicHist(row, 'histogramTxAdm', 'admTax','currentRowTxAdm' ,'histogram_txAdm', function(row){return row.info.admTax;});
		//me.showGenereicHist(row, 'histDiasRecuperacao', 'diasAteRecuperar','currentRowDiasRecuperacao' ,'histogram_diasRecuperacao', function(row){if(row.analiseTemer != null){return row.analiseTemer.diasAteRecuperar;}else{return 0;}});
		
		//$('.tooltipped').tooltip({delay: 50});
	}
    me.histogramHash = function(){
		if(me.histogramItemFilter == null)
			return [];
		var k = [];
		for(i in me.histogramItemFilter){
			k.push(me.histogramItemFilter[i].name + '_' + me.histogramItemFilter[i].low);
        }
        return k;
	};
    me.histogramItemFilter = null;
    me.showGenereicHist = function(row, histArray, propery,indexProperty, file, fn){
		me.getAndSaveFile(file, function(result){
			me[histArray] = result;
			me['show_' + histArray] = true;
				me.showEssaPorra = true;
			if(row != null && row.figures[me.selectedPeriod] != null){
				for(var i = 0;i<result.data.length;i++){
					if(isBetween(typeof(fn)=='function' ? fn(row) :row.figures[me.selectedPeriod][propery], result.data[i].low, result.data[i].high)){
						me[indexProperty] = i;
						break;
					}
				} 
			}
			 
		});
	}
	me.showHistogramPosNegMonths = function(row){
		me.getAndSaveFile('histogram_posNegCountRate_' + me.selectedPeriod, function(result){
			me.histogramPosNegRate = result.data;
			if(row.figures[me.selectedPeriod] != null){
				for(var i = 0;i<result.data.length;i++){
					if(isBetween(row.figures[me.selectedPeriod].posNegCountRate, result.data[i].low, result.data[i].high)){
						me.currentRowHistPosNegMonth = i;
						break;
					}
				} 
			}
		});
	};

	me.openModalOQue = function(){
		
		$('#modalOque').modal('open');
		window.setTimeout(function(){
			$('.carousel.carousel-slider').carousel({fullWidth: true});
			$('.carousel.carousel-slider').css('height','100%');
		},500)
	};

	me.skiprightOn = false;
	me.skipRight = function(){
		me.skiprightOn = true;
		$('.modal-overlay').css('opacity',0);
	}

	me.carouselInstance = null;
	me.getCarousel = function(){
		if(me.carouselInstance == null){
			me.carouselInstance = $('#carouselDetail');
		}
		return me.carouselInstance;
	};
	me.carouselRight = function(){
		me.getCarousel().carousel('next');
	};
	me.carouselLeft = function(){
		me.getCarousel().carousel('prev');
	};

	me.showChartToast=false;
	me.filterByChart = function(){
		
	}
}