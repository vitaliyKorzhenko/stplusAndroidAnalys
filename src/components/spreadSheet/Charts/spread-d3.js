/*
    D3.js chart as a SpreadJS floating object class.
    
    Copy of a legacy code:
    Build: 20-06-05 / Bar charts
    
    Modifications:
    
*/

var extend = require('./extend.js');
import d3 from 'd3';
import * as d3Tip from "d3-tip"
d3.tip = d3Tip;

var clipPathPrefix = "clip-rect";
//TODO: localize from host
var textNaN = "#N/A";

var chartsDefaultBorderColor = "#e6e6e6";

function formatFloat(value) {
    value = value || "";
    if (isNaN(parseFloat(value))) return textNaN;
    var precision = 5;
    return parseFloat(value).toFixed(precision).toLocaleString().replace(/\.?0+$/, '');
}

export function D3Chart(element) {
    this.margin = 60;
    this.marginXright = this.margin;
    this.marginXleft = 60;
    this.marginBottom = 60;

    this.labelFontSize = 7;
    this.maxTicksX = 20;
    this.maxTicksY = 10;
    this.legendWidth = null;
    this.minX = null;
    this.maxX = null;
    this.minY = null;
    this.maxY = null;
    this.xAxisLength = null;
    this.yAxisLength = null;
    this.xAxisScale = null;
    this.categories = null;
    this.element = element;
    this.gForAxisY = null;
    this.title = null;
    this.axisX = {
        scale: null,
        majorunit: null, 
        ticksCount : null,
        label: null,
        originline: null
    };
    this.axisY = {
        scale: null,
        majorunit: null,
        ticksCount: null,
        label: null
    }
    this.zoom = 1;

     this.options = null;
     this.flag = true;
     this.xAxisPos = null;
     this.optionsAxisX  = null;
     this.optionsAxisY  = null;     

     this.clipPathID = null;
    /* markers can be visible on or a bit over axis  - so we use larger clip path */
     this.clipPathMarkersID = null;
     this.borderColor = null;

     this.tipExtraClassName = '';
}

D3Chart.prototype.setTipExtraClassName = function (classTip) {
    this.tipExtraClassName = classTip ? ' ' + classTip : '';
}



String.prototype.hashCode = function () {
    var hash = 0, i, chr, len;
    if (this.length == 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

D3Chart.prototype.setZoom = function (zoom) {
    this.zoom = zoom;
}

/* solves problem of 1 + 0.2 = 1.200000001 */
function niceNumber(number) {
    var nn = parseFloat(number);
    return Math.abs(nn) < Number.EPSILON ? 0 : Number(nn.toPrecision(6));
}

/* returns array [start, start+step, start+2*step,...., start+N*step, end] 
   end is always included: arrayRange(1,8,3) => [1,4,7,8] */
function arrayRange(start, end, step) {
    var eps = 1e-10;
    var range = [];
    if (end < start && step > 0) {
        step = -step;
    }
    while (step > 0 ? end + eps >= start : end - eps <= start) {
            range.push(niceNumber(start));
            start += step;
    }
    /* include end item */
//    if (range.length > 0 && range[range.length - 1])
//        if (step > 0 ? range[range.length - 1] < end : range[range.length - 1] > end)
//            range.push(niceNumber(end));
    return range;
    
}

D3Chart.prototype.x_axis_d3 = function x_axis_d3(skipXlabels) {
    var lastItem = Math.round(this.axisX.ticksCount);
    /* if category remove last tick */
    if (this.categories && this.categories.length > this.axisX.majorunit) {
        // majorunit can be null ! var ticks = this.categories.length / this.axisX.majorunit;
        var xAxis = d3.svg
          .axis()
          .scale(this.axisX.scale)
          .orient("bottom")
          .ticks(lastItem - 1)
          .tickValues(              
            this.axisX.scale.domain().filter(function(d, i) {
            return d;
            })
          );
      } else {
        
          var xAxis = d3.svg
          .axis()
          .scale(this.axisX.scale)
          .orient("bottom");
          if (typeof this.optionsAxisX !== 'undefined' && this.optionsAxisX.min != null && this.optionsAxisX.max != null && this.optionsAxisX.majorunit != null && !isNaN(this.optionsAxisX.min) && !isNaN(this.optionsAxisX.max) && !isNaN(this.optionsAxisX.majorunit)) {
              var tickVals = arrayRange(this.optionsAxisX.min,this.optionsAxisX.max,this.optionsAxisX.majorunit);
              xAxis = xAxis.tickValues(tickVals);
          } else {
              xAxis = xAxis.ticks(lastItem);
          }
          xAxis = xAxis.tickFormat(function(d, i) {
            if (!skipXlabels) {
                return d;
            } 
            if (i % 2 == 1) {
              if (i == lastItem || i == 0) {
                return d;
              } else
              return "";
            } else {
              return d;
            }
          })
          ;
      }
    return xAxis
}
D3Chart.prototype.createChart = function createChart(optionsInput, useViewBox) {
    // create a deep copy of the options
    var options = extend(true, {}, optionsInput);
    this.options = options;
    this.margin *= this.zoom;
    this.marginXleft *= this.zoom;
    this.marginBottom *= this.zoom;
    this.labelFontSize *= this.zoom;
    var svg = this.element.append("svg")
        .attr("class", "axis")
        .attr("width", options.width)
        .attr("height", options.height)
    if (useViewBox)
        svg.attr("viewBox", "0 0 " + options.width + " " + options.height)
        //.attr("preserveAspectRatio", "none");

    var width = options.width,
        height = options.height;
    
    svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "white");

    var chartExtraType = "";
    var indexTemp = null;
    for (var i = 0; i < options.series.length; i++) {
        if (options.series[i].visible === false) {
            indexTemp = i;
            continue;
        }
        /* options.series[i].extratype is defined only for Box-Plot chart and on core v6.5+ */
        if (options.series[i].label == "Box" ||
            (typeof options.series[i].extratype == 'string' && options.series[i].extratype == 'boxplot') ) {
            chartExtraType = 'boxplot';
            var max = 1;
            for (var j = 0; j < options.series[i].y.length; j++) {
                if (options.series[i].y[j] == null) {
                    max++;
                }
            }
            options.axis.x["max"] = max;
            options.axis.x["min"] = 0;
        }
    }

    if(indexTemp != null)
        options.series.splice(indexTemp, 1);

    if (options.legend) {
        options.legend = this.createLegend(svg, options.series, width, height);
    }
    /* axis.length = svg container h/w - both margins */
     this.marginXright = (options.legend ? this.legendWidth  : this.margin);

    this.xAxisLength =  width - this.marginXright - this.marginXleft ;
    this.yAxisLength = height - this.margin - this.marginBottom;
   
    
    this.findDataRange(options);
    
    /* Stacked bars: prepare to overwrite scaling and Y axis for percent stacked bars */
    var seriesBar = [];
    for (var i = 0; i < options.series.length; i++)
        if (seriesIsBar(options.series[i]))
            seriesBar.push(options.series[i]);
    if (seriesBar.length > 0) {
        /* percent bars requires custom scale and Y axis hacks */
        if (seriesBar.find(function(bar) { return bar["bar-style"] == "percentstack" })) {
            /* recreate Y axis -> refactor */
            this.minY = 0;
            this.maxY = 100;
            this.percentAxisY = true;
            this.axisY.ticksCount = 10;
        }
    }
    /* init */
    this.init(options);
    var gForAxisY = svg.append("g");
    var gForAxisX = svg.append("g");

    this.gForAxisY = gForAxisY;
    this.gForAxisX = gForAxisX;
    var g = svg.append("g");
    /* title */
    var lines = options.title.split("\r\n");
    /* multi line */
    var marginTitle = lines.length == 1 ? 20 : 30;
    for (var y = this.margin - marginTitle * this.zoom, i = 0; i < lines.length; i++, y += 20 * this.zoom) {
        g.append("text")
            .attr("x", (width / 2))
            .attr("y", y)
            .attr("class", "chart-title")
            .text(lines[i]);
    }
    
    /* create axis */
    this.createAxis(svg, (this.axisX.originline || this.axisX.originline == 0) ? svg.append("g") : gForAxisX, gForAxisY);
    this.setInlineStyles();
    /* autofit axis tick labels */
    var axisYticksWidthMin = 35;
    var axisYticksWidthValue = Math.round(this.calcYAxisTicksWidth()*1.05);
    var axisYticksWidth = (axisYticksWidthValue < axisYticksWidthMin) ? axisYticksWidthMin : axisYticksWidthValue;
    var axisYticksWidthMax = 138*this.zoom;
    if (axisYticksWidth > axisYticksWidthMax)
        axisYticksWidth = axisYticksWidthMax;
    /* should we move Y axis and chart plot? */
    var moveY = axisYticksWidth > axisYticksWidthMin;
    /* Sparse X axis tick labels? */
    var axisXticksWidthSum = Math.round(this.calcXAxisTicksWidthSum()*1.1);
    var sparseX = axisXticksWidthSum > this.xAxisLength;
    if((moveY || sparseX) && this.flag){
        if (moveY) {
            var axisTitleYWidth = 25*this.zoom;
            this.marginXleft = Math.floor(axisYticksWidth + axisTitleYWidth);  
            this.xAxisLength =  width - this.marginXright - this.marginXleft ;
            this.xAxisScale = this.calcScaleX(this.optionsAxisX);
            this.axisX.scale = this.xAxisScale;
            sparseX = axisXticksWidthSum > this.xAxisLength;
        }
        this.xAxis = this.x_axis_d3( sparseX);
        if (moveY)
            svg.select('.xaxislabel').attr("dy", "-1.1em");
            
        var x = this.axisTransform(svg.select('.x-axis'), this.xAxis, this.xAxisPos);
        this.axisTransform(svg.select('.y-axis'), this.yAxis, this.margin    );
        /* copy from createAxis(): wraps text to fit */
        if (this.axisX.scale.rangeBand) x.selectAll(".tick text").call(this.wrap, this.axisX.scale.rangeBand(), this);
        /* manually adjust y gridlines to match x axis length */
        svg.selectAll("g.y-axis g.tick line.grid-line").attr("x2", this.xAxisLength);
        this.flag = false;  
     }    
    if (!moveY) {
        if (axisYticksWidthValue > 30*this.zoom)
            svg.select('.xaxislabel').attr("dy", "-1.1em");
        else if (axisYticksWidthValue > 20*this.zoom)
            svg.select('.xaxislabel').attr("dy", "-0.8em");
        else if (axisYticksWidthValue > 10*this.zoom)
            svg.select('.xaxislabel').attr("dy", "-0.6em");
    }
    this.clipPathID = this.addClipPath(svg);
    this.clipPathMarkersID = this.addClipPath(svg,5*this.zoom);
    
    /* plot bars */
    if (seriesBar.length > 0) {
        /* percent bars requires custom scale and Y axis hacks */
        if (seriesBar.find(function(bar) { return bar["bar-style"] == "percentstack" })) {
            /* Make scaled (X,Y) data at first - so createSeria() won't touch Y because of need to create X */
            this.yscaled = [];
            for (var i = 0; i < seriesBar.length; i++)
                this.yscaled[i] = this.scaleData(null, seriesBar[i].y);
            this.zeroY = this.scaleData([0], [0])[0].y;
            /* Rescale to 100 */
            /* max Y length - just in case - don't crash if different length */
            var maxylen = Math.min.apply(null, seriesBar.map(function(bar) { return bar.y ? bar.y.length : 0 }));
            /* calc totals [] */
            var totals = [];
            for (var i = 0; i < maxylen; i++) {
                totals[i] = 0;
                for (var bi = 0; bi < seriesBar.length; bi++)
                    totals[i] += seriesBar[bi].y[i] || 0;
            }
            /* finally rescale - manually */
            for (var i = 0; i < maxylen; i++) {
                for (var bi = 0; bi < seriesBar.length; bi++)
                    if (this.yscaled[bi] && this.yscaled[bi][i])
                        this.yscaled[bi][i].y = this.axisY.scale(seriesBar[bi].y[i] / totals[i] * 100.0) + this.margin;
            }
        }
        for (var i = 0; i < seriesBar.length; i++)
            this.createSeriaBar(svg, seriesBar[i], height, chartExtraType, i, seriesBar);
    }
    /* plot other series */
    for (var i = 0; i < options.series.length; i++) {
        if (!seriesIsBar(options.series[i]))
            this.createSeria(svg, options.series[i], height, chartExtraType);
    }
    this.setInlineStyles();

    var borderColor = chartsDefaultBorderColor;
    var borderWidth = 1;
    if(options.hasOwnProperty('border')) {
        var optBorder = options.border;
        if(optBorder.hasOwnProperty('color')) 
            borderColor = optBorder.color;
        if(optBorder.hasOwnProperty('width')) 
            borderWidth = optBorder.width;
    }
//borderColor = d3.rgb(borderColor);
//options.borderColor = borderColor;
    svg.attr('border', borderWidth);
    if (borderWidth > 0)
        var borderPath = svg.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("height", height)
                    .attr("width", width)
                    .style("stroke", borderColor)
                    .style("fill", "none")
                    .style("stroke-width", borderWidth);
}

D3Chart.prototype.addClipPath = function addClipPath(svg,markerSize){
    if (typeof markerSize == 'undefined')
        markerSize = 1;
    /* define chart plot area (body) using clip path */
    var clipX = this.marginXleft;
    var clipY = this.margin;
    var svgClipPathID = clipPathPrefix + this.options.row + this.options.col +  Math.floor(Math.random()*1000);
    if (this.options && this.options.title && typeof this.options.title.hashCode == "function")
        svgClipPathID += this.options.title.hashCode().toString();
    if (markerSize != 1)
        svgClipPathID += markerSize.toString();
    svg.append("clipPath") // define a clip path
        .attr("id", svgClipPathID) // give the clipPath an ID
        .append("rect")    
        .attr("x",  clipX - 1) // position the x-centre
        .attr("y", clipY - 1)
        .attr("width", this.xAxisLength + markerSize * 2)            // set the x radius
        .attr("height", this.yAxisLength + markerSize * 2);  // position the y-centre
    return svgClipPathID;
}


D3Chart.prototype.calcYAxisTicksWidth = function calcYAxisTicksWidth(){
    var labs = this.gForAxisY.selectAll(".tick text");
    var wt = d3.max(d3.merge(labs), function(d) {
        var temp = d.getComputedTextLength();
        return temp;
      });
    return wt;
  }

D3Chart.prototype.calcXAxisTicksWidthSum = function calcXAxisTicksWidthSum(){
    var labs = this.gForAxisX.selectAll(".tick text");
    var wtSum = d3.sum(d3.merge(labs), function(d) {
        var temp = d.getComputedTextLength();
        return temp;
        });
    // TODO: вариант 2 - вернуть wt * ticksCount();
        // var wt = d3.max(d3.merge(labs), function(d) {
        //     var temp = d.getComputedTextLength();
        //     return temp;
        //   });
    return wtSum;
}
 

D3Chart.prototype.wrap = function (text, width, caller) {
    var fontSize = caller.labelFontSize,
        curFontSize = fontSize;
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em"),
            curFontSize = fontSize;
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                if (line.length == 1) {
                    var newFontSize = fontSize / (tspan.node().getComputedTextLength() / width);
                    if (newFontSize < curFontSize) {
                        curFontSize = newFontSize
                    }
                }
                else {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        }
        caller.element.selectAll("tspan").style("font-size", curFontSize + "pt")
    });
}

D3Chart.prototype.setInlineStyles = function setInlineStyles() {
    this.element.selectAll(".axis").attr("style", "width: 100%; height: 100%;background-color: white;");
    this.element.selectAll(".axis path").style("fill", "none").style("stroke", function () {
        return d3.select(this).style("stroke") !== "none" ? d3.select(this).style("stroke") : "#333"
    });
    this.element.selectAll(".axis line").style("fill", "none").style("stroke", function () {
        return d3.select(this).style("stroke") !== "none" ? d3.select(this).style("stroke") : "#333"
    });
    this.element.selectAll(".axis .grid-line").attr("style", "stroke: #e0e0e0;shape-rendering: crispedges;");
    this.setInlineStylesFont();
    this.element.selectAll(".axis .chart-title").attr("style", "font-size:" + 11 * this.zoom + "pt;font-weight:bold;font-family: Arial;text-anchor:middle;");
    this.element.selectAll(".axis .axis-label").attr("style", "font-size:" + 10 * this.zoom + "pt;font-weight:bold;font-family: Arial;text-anchor:middle;");
}

D3Chart.prototype.setInlineStylesFont = function setInlineStylesFont() {
    this.element.selectAll(".axis text").style("font-size", this.labelFontSize + "pt").style("font-family", "Verdana");
}

D3Chart.prototype.createLegend = function createLegend(svg, series, width, height) {
    var legendMarkSize = 10;
    var legendMargin = 4;
    var yPos = (height - this.margin - series.length * 15 * this.zoom) / 2
    var zoom = this.zoom;
    var legendTable = svg.append("g")
        .attr("transform", "translate(0, " + yPos + ")")
        .attr("class", "legendTable");
    var series_nonempty = series.filter(function(ser) { return (ser.label.trim().length > 0); });
    var legend = legendTable.selectAll(".legend")
        .data(series_nonempty)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(0, " + i * 20 * zoom + ")";
        });

    /* Removed: CREATE TIPS FOR LABEL <== */
    // var tip = d3.tip()
    //     .attr('class', 'd3-tip')
    //     .html(function(d){return d.label});
    // legend.call(tip);
    /* draw series marker in legend */
    //if (d.hasOwnProperty("markers") && d.markers.visible) *********** this.createPoints(svg, options.markers, data, options.markers.hasOwnProperty("color") ? options.markers.color : options.color, "seria" + options.label.hashCode(), tip);

    legend.append("rect")
        .attr("x", (width - 20) * this.zoom)
        .attr("y", 4 * this.zoom + legendMarkSize * this.zoom / 4 /*  + height/2.0 */ )
        .attr("width", legendMarkSize * this.zoom)
        .attr("height", legendMarkSize * this.zoom / 2)
        .style("fill",  function (d) {return d.color; } );
    // .on('mouseover', tip.show).on('mouseout', tip.hide);

    var r = legend.append("text")
        .attr("x", (width - 24) * this.zoom)
        .attr("y", 9 * this.zoom)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
         .text(
             function (d) { return d.label; });
    this.setInlineStylesFont();    
    

    this.legendWidth = legendTable.node().getBBox().width + (legendMarkSize + legendMargin)* this.zoom;
    if (this.legendWidth < 1 || this.legendWidth > width / 2) {
        this.legendWidth =  legendMargin;    
        legendTable.remove();
       return 0;
    }   else {
    // move boxes to left
    legendTable.selectAll(".legend rect").attr("x", width - this.legendWidth + legendMargin);
    // left align legend text
    legendTable.selectAll(".legend text").attr("x", width - this.legendWidth + 15 * this.zoom + legendMargin).style("text-anchor", "start");
    }
     return 1;
}

D3Chart.prototype.findDataRange = function findDataRange(options) {
    var temp;
    var isNullMaxY = this.maxY == null;
    for (var i = 0; i < options.series.length; i++) {
        if (options.series[i].x) {
            temp = d3.max(options.series[i].x);
            if (this.maxX == null || temp > this.maxX)
                this.maxX = temp;
            temp = d3.min(options.series[i].x);
            if (this.minX == null || temp < this.minX)
                this.minX = temp;
        }
        else {
            if (!this.minX || this.minX > 1)
                this.minX = 1;

            if (!this.maxX || this.maxX < options.series[i].y.length)
                this.maxX = options.series[i].y.length;
        }
        if (options.series[i].y) {
            temp = d3.max(options.series[i].y);
            if (this.maxY == null || temp > this.maxY)
                this.maxY = temp;
            temp = d3.min(options.series[i]);
            if (this.minY == null || temp < this.minY)
                this.minY = temp;
        }
    }
    /* exception: stacked bar charts - axis must fill max sum */
    if (isNullMaxY && options.series.find(function(series) { return ( seriesIsBar(series) && (series["bar-style"] == "stacked")) } ) ) {
        var bars = options.series.filter(function(series)  { return seriesIsBar(series) });
        var ylen = 0;
        bars.forEach(function(bar) { ylen = Math.max(ylen, bar.y.length) });
        var maxsumy = 0;
        for (var i = 0; i < ylen; i++) {
            var s = 0;
            bars.forEach(function(bar) { s += bar.y[i] ? bar.y[i] : 0 });
            if (s > maxsumy) maxsumy = s;
        }
        this.maxY = maxsumy;
    }
}

function seriesIsBar(options) {
    return options && (options.type == "bar");
}


D3Chart.prototype.createSeriesTip = function createSeriesTip(options, chartExtraType, categories) {
    return typeof d3.tip === "undefined" ? null : d3.tip()
    .attr('class', 'd3-tip' + this.tipExtraClassName)
    .offset([-10, 0])
    .html(function (d, i) {
          var valueText = "";
          var firstLine = (options.label && options.label.length > 0) ? "<strong>\"" + options.label + "\"</strong><br>" : "";
          /* correct index "i" for null/missing values pairwise*/
          var caseok = [];
          var xused = options.x && (options.x.length > 0);
          for (var fori = 0; fori < options.y.length; fori++)
          caseok[fori] = xused ? (options.x[fori] != undefined) && (options.y[fori] != undefined) : (options.y[fori] != undefined);
          var optionsX = xused ? options.x.filter(function(n,i){ return caseok[i];}) : null;
          var optionsY = options.y.filter(function(n,i){ return caseok[i];});
          
          /* handle special chart types */
          if (!!chartExtraType) {
          if (chartExtraType == 'boxplot' && optionsX) {
          var ii = parseInt(optionsX[i]);
          if (categories && !isNaN(ii) && ii < categories.length) {
          valueText = categories[ii] + ": " + formatFloat(optionsY[i]);
          }
          }
          } else {
          /* just regular chart types - show either Y value or both (X,Y) values */
          if (seriesIsBar(options) && optionsY[i])
          valueText = formatFloat(optionsY[i]);
          else if (optionsX)
          valueText = "(" + formatFloat(optionsX[i]) +", "+ formatFloat(optionsY[i])  + ")";
          }
          if (valueText != null && valueText.length > 0)
          return firstLine + "<span>" + valueText + "</span>";
          
          });
}

D3Chart.prototype.createSeriaBar = function createSeriaBar(svg, options, height,chartExtraType, groupi, allbars) {
    if (!seriesIsBar(options))
        return;
    var groupsn = allbars.length;
    options.x = null;
    var data = (this.yscaled && this.yscaled[groupi]) ||  this.scaleData(options.x, options.y);
    var zeroY = this.zeroY || this.scaleData([0], [0])[0].y;
    var categories  = this.categories;
    /* add tooltips */
    var tip = this.createSeriesTip(options, chartExtraType, categories);
    svg.call(tip);
    // was: if (options.type == "bar")
    var specialBar = (typeof options["bar-style"] == "string") && (options["bar-style"].length > 0);
    specialBar = specialBar && (groupsn > 1);
    var specialBar_Percent = false, specialBar_Stacked = false, specialBar_Clustered = false;
    if (specialBar) {
        specialBar_Percent = options["bar-style"] == "percentstack";
        specialBar_Stacked = options["bar-style"] == "stacked";
        specialBar_Clustered = !specialBar_Percent && !specialBar_Stacked;
    }
    
    var rangeBand = this.xAxisScale.rangeBand();
    var gapWidth = rangeBand * ((100 - options.width) / 100) / 2;
    var margin = this.margin;
    /* TODO remove and test */
    if (isNaN(gapWidth)) return;
    var barsvg;
    if (specialBar_Clustered) {
        /* clusted bar chart */
        var barwidthproportion = 1.0 / groupsn;
        /* TODO: 1 = some smalle space between clusters (groups) */
        var barextrapadding = 1;
        barsvg = svg.append("g")
            .attr("clip-path", "url(#"+this.clipPathID+")")
            .selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) {
                  var barshift = rangeBand * (options.width / 100) / groupsn * groupi;
                  return d.x  + gapWidth + barshift;
                  })
            .attr("width", this.xAxisScale.rangeBand() *  options.width / 100 * barwidthproportion - 2*barextrapadding )
            .attr("y", function (d) { return Math.min(d.y, zeroY); })
            .attr("height", function (d) { return Math.abs(d.y - zeroY); })
            .attr("fill", options.color);
    } else if (specialBar_Stacked || specialBar_Percent) {
        /* save scaled data for current bar chart */
        allbars[groupi].heights = data.map(function(di) {return  Math.abs(di.y - zeroY);});
        /* stacked bars */
        barsvg = svg.append("g")
        .attr("clip-path", "url(#"+this.clipPathID+")")
        .selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return d.x  + gapWidth; })
        .attr("width", this.xAxisScale.rangeBand() *  options.width / 100 )
        .attr("y", function (d, i) {
              var valy = 0;
              if (groupi > 0) {
                for (var bi = 0; bi < groupi; bi++)
                    valy -= allbars[bi].heights[i] ? allbars[bi].heights[i] : 0;
              }
              valy += Math.min(d.y, zeroY);
              return valy;
              })
        .attr("height", function (d) { return Math.abs(d.y - zeroY); })
        .attr("fill", options.color);
    //} else if (specialBar_Percent) {
    } else {
        /* regular bar chart */
        barsvg = svg.append("g")
        .attr("clip-path", "url(#"+this.clipPathID+")")
        .selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return d.x  + gapWidth; })
        .attr("width", this.xAxisScale.rangeBand() * (options.width / 100))
        .attr("y", function (d) { return Math.min(d.y, zeroY); })
        .attr("height", function (d) { return Math.abs(d.y - zeroY); })
        .attr("fill", options.color);
    }
    barsvg.on('mouseover', tip.show);
    barsvg.on('mouseout', tip.hide);
    return;
    // end plotting bar
}

D3Chart.prototype.createSeria = function createSeria(svg, options, height,chartExtraType) {
    /* all series except for bar charts */
    if (seriesIsBar(options))
        return;
     if (!options.x) {
        options.x = [];
        for (var i = this.minX; i <= this.maxX; i++) {
            options.x.push(i);
        }
    }

    var data = this.scaleData(options.x, options.y);
    var isDashed = options["line-style"] && options["line-style"] == "dash";
    var zeroY = this.scaleData([0], [0])[0].y;
    var categories  = this.categories;
    /* add tooltips */
    var tip = this.createSeriesTip(options, chartExtraType, categories);
    svg.call(tip);

    var pathDrawFunc;  
    if (options.type == "line")
        pathDrawFunc = d3.svg.line()
            .defined(function (d) { return d.y != null; })
            .x(function (d) { return d.x; })
            .y(function (d) { return d.y; });
    
    if (options.type == "spline")
        pathDrawFunc = d3.svg.line().interpolate("cardinal")
            .defined(function (d) { return d.y != null; })
            .x(function (d) { return d.x; })
            .y(function (d) { return d.y; });
    if (options.type == "step")
        pathDrawFunc = d3.svg.line().interpolate("step-after")
            .defined(function (d) { return d.y != null; })
            .x(function (d) { return d.x; })
            .y(function (d) { return d.y; });

    if (options.type != "scatter") {
        svg.append("g").append("path")
        .attr("clip-path", "url(#"+this.clipPathMarkersID+")")
            .attr("d", pathDrawFunc(data))
            .style("stroke", options.color)
            .style((isDashed ? "stroke-dasharray" : "stroke-width"), (isDashed ? "7pt," + options.width + "pt" : options.width + "pt"));
    }

    if (options.hasOwnProperty("markers") && options.markers.visible)
        this.createPoints(svg, options.markers, data, options.markers.hasOwnProperty("color") ? options.markers.color : options.color, "seria" + options.label.hashCode(), tip);
}

D3Chart.prototype.createPoints = function createPoints(svg, options, data, color, label, tip) {
    var r = options.hasOwnProperty("r") ? options.r : 5;
    r *= this.zoom;
    var type = options.hasOwnProperty("type") ? options.type : "circle";

    for (var i = 0; i < data.length; i++) {
        if (data[i].x == null || data[i].y == null) {
            data.splice(i, 1);
            i--;
        }
    }
    // Should markers be filled inside?
    var fillColor = color;
    if (typeof options.style === 'string') {
            if (options.style.indexOf("nofill") > -1)
                fillColor = "#ffffff";
            }
    // TODO: extra clipPath for markers with extended size
    if (type == "circle")
        svg.selectAll(".dot " + label)
            .data(data)
            .enter().append("circle")
            .attr("clip-path", "url(#"+this.clipPathMarkersID+")")
            .style("stroke", color)
            .style("fill", fillColor)
            .attr("class", "dot " + label)
            .attr("r", Math.ceil(r/2))
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
    if (type == "rect")
        svg.selectAll(".dot " + label)
            .data(data)
            .enter().append("rect")
            .attr("clip-path", "url(#"+this.clipPathMarkersID+")")
            .style("stroke", color)
            .style("fill", fillColor)
            .attr("class", "dot " + label)
            .attr("width", r)
            .attr("height", r)
            .attr("x", function (d) { return d.x - r / 2; })
            .attr("y", function (d) { return d.y - r / 2; })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
    if (type == "triangle") {
        svg.selectAll(".dot " + label)
            .data(data)
            .enter().append("polygon")
            .attr("clip-path", "url(#"+this.clipPathMarkersID+")")
            .style("fill", fillColor)
            .style("stroke", color)
            .attr("points", function (d) {
                return (d.x - r).toString() + ","
                    + (d.y - r).toString() + " "
                    + (d.x + r).toString() + ","
                    + (d.y - r).toString() + " "
                    + d.x.toString() + ","
                    + (d.y + r).toString();
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
    }
    if (type == "plus" || type == "star") {
        svg.selectAll(".dot " + label)
            .data(data)
            .enter().append("line")
            .attr("clip-path", "url(#"+this.clipPathMarkersID+")")
            .style("stroke", color)
            .attr("x1", function (d) { return d.x })
            .attr("y1", function (d) { return d.y + r })
            .attr("x2", function (d) { return d.x })
            .attr("y2", function (d) { return d.y - r })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        svg.selectAll(".dot " + label)
            .data(data)
            .enter().append("line")
            .attr("clip-path", "url(#"+this.clipPathMarkersID+")")
            .style("stroke", color)
            .attr("x1", function (d) { return d.x + r })
            .attr("y1", function (d) { return d.y })
            .attr("x2", function (d) { return d.x - r })
            .attr("y2", function (d) { return d.y })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
    }
    if (type == "star") {
        svg.selectAll(".dot " + label)
            .data(data)
            .enter().append("line")
            .attr("clip-path", "url(#"+this.clipPathMarkersID+")")
            .style("stroke", color)
            .attr("x1", function (d) { return d.x - r })
            .attr("y1", function (d) { return d.y + r })
            .attr("x2", function (d) { return d.x + r })
            .attr("y2", function (d) { return d.y - r })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        svg.selectAll(".dot " + label)
            .data(data)
            .enter().append("line")
            .attr("clip-path", "url(#"+this.clipPathMarkersID+")")
            .style("stroke", color)
            .attr("x1", function (d) { return d.x + r })
            .attr("y1", function (d) { return d.y + r })
            .attr("x2", function (d) { return d.x - r })
            .attr("y2", function (d) { return d.y - r })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
    }   
}

D3Chart.prototype.scaleData = function scaleData(rawDataX, rawDataY) {
    var scaleX, scaleY;
    if (rawDataX)
        scaleX = d3.scale.linear().domain([this.minX == null ? d3.min(rawDataX) : this.minX, this.maxX == null ? d3.max(rawDataX) : this.maxX]).range([0, this.xAxisLength]).nice();
    else {
        rawDataX = this.categories;
        scaleX = this.xAxisScale;
    }

    scaleY = d3.scale.linear().domain([this.maxY == null ? d3.max(rawDataY) : this.maxY, this.minY == null ? d3.min(rawDataY) : this.minY]).range([0, this.yAxisLength]).nice();

    var data = [];
    for (var i = 0; i < rawDataX.length; i++)
        data.push({
            x: rawDataX[i] == null ? null : scaleX(rawDataX[i]) + this.marginXleft,

            y: rawDataY[i] == null ? null : scaleY(rawDataY[i]) + this.margin
        });

    return data;
}

D3Chart.prototype.createGridlines = function createGridlines(svg) {
    // Create gridlines
    var showGridlinesX = this.optionsAxisX.hasOwnProperty("gridlines") && this.optionsAxisX.gridlines;    
    this.optionsAxisX.gridlines = showGridlinesX;
    if (showGridlinesX) {
        /* skip first grid line to prevent hiding Y axis line 
            Remove if Y axis is not shown.
         */
        const hasCategories = this.categories && this.categories.length > 0;
        svg.selectAll("g.x-axis g.tick")
            .filter(function(d, i) { return hasCategories || (i > 0) ; })
            .append("line")
            .classed("grid-line", true)
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", -this.yAxisLength);
    }
    var showGridlinesY = true;
    if (this.optionsAxisY.hasOwnProperty("gridlines") && ! this.optionsAxisY.gridlines)
            showGridlinesY = false;
    this.optionsAxisY.gridlines = showGridlinesY;        
    if (showGridlinesY) {
    svg.selectAll("g.y-axis g.tick")
        .append("line")
        .classed("grid-line", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", this.xAxisLength)
        .attr("y2", 0);
    }
}

D3Chart.prototype.createAxis = function createAxis(svg, gForX, gForY) {
    /* X axis */
  	var lastItem = Math.floor(this.axisX.ticksCount);

    this.xAxis = this.x_axis_d3();

    var yAxis = d3.svg.axis()
                 .scale(this.axisY.scale)
                 .orient("left")
                 .ticks(this.axisY.ticksCount);
    
    if (this.percentAxisY)
        yAxis.tickFormat(function(d) { return parseInt(d, 10) + "%"; });
    /*draw axis*/
    var xAxisPos;

    this.yAxis = yAxis;
    if (this.axisX.originline || this.axisX.originline == 0) {
        xAxisPos = this.scaleData([0], [this.axisX.originline])[0].y;
    }else{
        xAxisPos = this.height - this.marginBottom;
    }

    this.xAxisPos = xAxisPos;
     
    var x = this.axisTransform(gForX.attr("class", "x-axis"), this.xAxis,this.xAxisPos);
    this.axisTransform(gForY.attr("class", "y-axis"), yAxis, this.marginBottom);
    /* refactor as method */
    if (this.axisX.scale.rangeBand) x.selectAll(".tick text").call(this.wrap, this.axisX.scale.rangeBand(), this);
    /* gridlines */
    var tempBorderCheck = this.options.hasOwnProperty('gridlines');
    if(!tempBorderCheck){
        this.createGridlines(svg);
    } else if(this.options.gridlines === true){
        this.createGridlines(svg);
    }
    /* create labels */
    var xAxisTicksLabelHeight = 10;
    var g = svg.append("g");
    g.append("text")
        .attr("x", this.margin / 2)
        .attr("y", this.height / 2)
        .attr("class", "axis-label xaxislabel")
        .attr("transform", "rotate(-90, " + this.margin / 2 + ", " + this.height / 2 + ")")
        .text(this.axisY.label);
    g.append("text")
        .attr("x", (this.width / 2))
        .attr("y", this.height - this.marginBottom / 2 + xAxisTicksLabelHeight)
        .attr("class", "axis-label")
        .text(this.axisX.label);
}

D3Chart.prototype.scaleNumNice = function(range, toRound){
    var exponent = Math.floor(Math.log(range)/Math.LN10),
        fraction = range / Math.pow(10, exponent),
        niceFraction;

    if (toRound) {
        if (fraction < 1.5)
            niceFraction = 1;
        else if (fraction < 3)
            niceFraction = 2;
        else if (fraction < 7)
            niceFraction = 5;
        else
            niceFraction = 10;
    } else {
        if (fraction <= 1)
            niceFraction = 1;
        else if (fraction <= 2)
            niceFraction = 2;
        else if (fraction <= 5)
            niceFraction = 5;
        else
            niceFraction = 10;
    }

    return niceFraction * Math.pow(10, exponent);
}

D3Chart.prototype.axisTransform = function axisTransform(selector, axis, xAxisPos){
    return selector
        .attr("transform",  /* shift down and right */
        "translate(" + this.marginXleft + "," + xAxisPos + ")")
        .call(axis);
}

D3Chart.prototype.calcScaleX = function calcScaleX(optionsAxisX) {
var scaleX;
if (optionsAxisX.hasOwnProperty("categories")) {
    scaleX = d3.scale.ordinal().rangeRoundBands([0, this.xAxisLength], 0)
        .domain(optionsAxisX.categories);
    this.categories = optionsAxisX.categories;
}
else {
    scaleX = d3.scale.linear().domain([this.minX, this.maxX]).nice().range([0, this.xAxisLength]);
}
return scaleX;
}

D3Chart.prototype.init = function init(options) {
    var width = options.width,
        height = options.height;

    this.width = width;
    this.height = height;

    var optionsAxisX = new Object();
    if (options.hasOwnProperty("axis") && options.axis.hasOwnProperty("x"))
        optionsAxisX = options.axis.x;
    var optionsAxisY = new Object();
    if (options.hasOwnProperty("axis") && options.axis.hasOwnProperty("y"))
        optionsAxisY = options.axis.y;

    var revertX = options.hasOwnProperty("revertAxisX") && options.revertAxisX;
    var revertY = options.hasOwnProperty("revertAxisY") && options.revertAxisY;

    this.minX = optionsAxisX.hasOwnProperty("min") ? optionsAxisX.min : this.minX;
    this.maxX = optionsAxisX.hasOwnProperty("max") ? optionsAxisX.max : this.maxX;
    if (optionsAxisX.hasOwnProperty("majorunit")) {
        this.axisX.ticksCount = (this.maxX - this.minX) / optionsAxisX.majorunit;
        this.axisX.majorunit = optionsAxisX.majorunit;
    } else {
        /* TODO: scale ticks by calculating ticksCount as range
        var niceRange = this.scaleNumNice(Math.abs(this.maxX - this.minX),false);
        var niceMajorUnit = this.scaleNumNice(niceRange / (this.maxTicksX - 1), true);
        this.axisX.ticksCount = ceil(niceRange/niceMajorUnit);

        See example below:
        `
        maxTicks = Y:10, X: 20 (or less)
        range = niceNum(maxPoint - minPoint, false);
        tickSpacing = niceNum(range / (maxTicks - 1), true);
        niceMin = Math.floor(minPoint / tickSpacing) * tickSpacing;
        niceMax = Math.ceil(maxPoint / tickSpacing) * tickSpacing;
        `
        */ 
        this.axisX.ticksCount = this.scaleNumNice(this.maxTicksX, true);
    }

    if (revertX) {
        var mx = this.maxX;
        this.maxX = this.minX;
        this.minX = mx;
    }

    this.optionsAxisX = optionsAxisX;
    this.optionsAxisY = optionsAxisY;

    var scaleX = this.calcScaleX(optionsAxisX);

    this.xAxisScale = scaleX;

    this.axisX.scale = scaleX;
    this.axisX.label = optionsAxisX.label;

    var optionsAxisY = new Object();
    if (options.hasOwnProperty("axis") && options.axis.hasOwnProperty("y"))
        optionsAxisY = options.axis.y;
    if (optionsAxisY.hasOwnProperty("categories")) {
        var scaleY = d3.scale.ordinal().range([0, this.yAxisLength])
            .domain(optionsAxisY.categories.map(function (d) { return d; }));
        this.minY = null;
        this.maxY = null;
    }
    else {
        this.maxY = optionsAxisY.hasOwnProperty("max") ? optionsAxisY.max : this.maxY;
        this.minY = optionsAxisY.hasOwnProperty("min") ? optionsAxisY.min : this.minY;

        if (revertY) {
            var my = this.maxY;
            this.maxY = this.minY;
            this.minY = my;
        }
        scaleY = d3.scale.linear().domain([this.maxY, this.minY]).nice().range([0, this.yAxisLength]);
    }
    if (optionsAxisY.hasOwnProperty("majorunit")) {    
        this.axisY.ticksCount = Math.abs(this.maxY - this.minY) / optionsAxisY.majorunit;
    } else 
        this.axisY.ticksCount = this.scaleNumNice(this.maxTicksY, true);
    this.axisY.scale = scaleY;
    this.axisY.label = optionsAxisY.label;
    this.axisX.originline = parseFloat(optionsAxisY.originline);
}

function wrappedText(text, width) {
    text.each(function() {
              var text = d3.select(this),
              words = text.text().split(/\s+/).reverse(),
              word,
              line = [],
              lineNumber = 0,
              lineHeight = 1.1,
              y = text.attr("y"),
              dy = parseFloat(text.attr("dy")),
              tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
              while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join(" "));
              if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
              }
              }
              });
}
