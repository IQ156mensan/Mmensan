
/////
var module = {};
module.exports = {};
var mclone = function(obj) {
    if (obj === null || typeof(obj) !== 'object')
        return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
            copy[attr] = obj[attr];
        }
    }
    return copy;
}

module.exports.clone = mclone
var mid = function(txt) {
    return document.getElementById(txt);
}
module.exports.id = mid
var mname = function(txt) {
    return document.getElementsByName(txt);
}

module.exports.name = mname
var mdistance = function(x, y, x1, y1, value) {
    var dx = x - x1;
    var dy = y - y1;
    var distance = Math.sqrt(dx * dx + dy * dy);
    if (typeof value == 'undefined')
        return distance;
    else {
        if (distance < value)
            return true
        else
            return false
    }
}
module.exports.distance = mdistance

var mbox = function(x, y, w, h, x1, y1, w1, h1) {
    if (x < x1 + w1 && x + w > x1 && y < y1 + h1 && y + h > y1) {
        return true;
    }
}
module.exports.box = mbox

var mjson = function(v) {
    return JSON.stringify(v);
}
module.exports.json = mjson
var mnullTest = function(obj, name) {
    var tag = false;
    for (var o in obj) {
        if (o == name) {
            tag = true
        }
    }
    return tag
}
module.exports.nullTest = mnullTest

var mTracking = function(cv, value, noise, callback) {
    this.canvas = cv;
    this.ctx = this.canvas.getContext("2d")
    this.dd = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    this.imgData = this.dd.data;

    var option;

    var noisefilter = 3;
    if (typeof value == "string")
        option = parseInt(value);

    if (typeof noise == "string")
        noisefilter = parseInt(noise);
    var i, j, iColorValue;
    var width = this.canvas.width;
    var height = this.canvas.height;
    // 라프라시안 필터
    var iFilter = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
    //   iFilter = [0, -1, 0, -1, 5, -1, 0, -1, 0]
    //  iFilter = [-1, -1, -1, 2, 2, 2, -1, -1, -1]
    var iArrayValue = [];

    var pixel = [];
    var cArrayColor = []; // 색정보의 배열 중간점을 기준으로
    //라프라시안 필터링 적용할 픽셀들
    for (i = 0; i < width; i++) {
        for (j = 0; j < height; j++) {
            if (!pixel[i])
                pixel[i] = [];
            if (!iArrayValue[i])
                iArrayValue[i] = [];
            iArrayValue[i][j] = 0
            pixel[i][j] = this.imgData[(j * width + i) * 4] * .3 + this.imgData[(j * width + i) * 4 + 1] * .59 + this.imgData[(j * width + i) * 4 + 2] * .11;
        }
    }
    this.sq = {
        x: this.canvas.width,
        y: this.canvas.height,
        ex: 0,
        ey: 0,
        width: 0,
        height: 0
    }
    // 화상에 대한 필터 처리
    // 각각 너비와 길이에 대하여 -1을 하는 이유는 맨 마지막 pixel을
    // 기준으로 잡을 수 없기 때문
    for (i = 1; i < width - 1; i++)
        for (j = 1; j < height - 1; j++) {
            cArrayColor[0] = pixel[i - 1][j - 1];
            cArrayColor[1] = pixel[i - 1][j];
            cArrayColor[2] = pixel[i - 1][j + 1];
            cArrayColor[3] = pixel[i][j - 1];
            cArrayColor[4] = pixel[i][j];
            cArrayColor[5] = pixel[i][j + 1];
            cArrayColor[6] = pixel[i + 1][j - 1];
            cArrayColor[7] = pixel[i + 1][j];
            cArrayColor[8] = pixel[i + 1][j + 1];

            // 필터 처리
            iColorValue = iFilter[0] * cArrayColor[0] + iFilter[1] * cArrayColor[1] + iFilter[2] * cArrayColor[2] + iFilter[3] *
                cArrayColor[3] + iFilter[4] * cArrayColor[4] +
                iFilter[5] * cArrayColor[5] + iFilter[6] *
                cArrayColor[6] + iFilter[7] * cArrayColor[7] +
                iFilter[8] * cArrayColor[8];

            //출력 레벨에 따라서 각기 다른 결과물이 나올 수 있다.
            iColorValue = option * iColorValue; // 출력 레벨의 설정
            // iColorValue가 0보다 작은 경우
            if (iColorValue < 0)
                iColorValue = -iColorValue; // 정의값에 변환
            // iColorValue가255보다 클 경우
            if (iColorValue > 255) {

                iColorValue = 255; // iColorValue를 255으로 설정

            }
            else
                iColorValue = 0
            iArrayValue[i][j] = iColorValue; // iColorValue의 설정
        }
    for (i = 1; i < width - 1; i++) {
        for (j = 1; j < height - 1; j++) {
            var tmp = 0;
            if (iArrayValue[i - 1][j - 1] == 0)
                tmp++;
            if (iArrayValue[i - 1][j] == 0)
                tmp++;
            if (iArrayValue[i - 1][j + 1] == 0)
                tmp++;
            if (iArrayValue[i][j - 1] == 0)
                tmp++;
            if (iArrayValue[i][j + 1] == 0)
                tmp++;
            if (iArrayValue[i + 1][j - 1] == 0)
                tmp++;
            if (iArrayValue[i + 1][j] == 0)
                tmp++;
            if (tmp > noisefilter)
                iArrayValue[i][j] = 0
            else {
                if (this.sq.x > i)
                    this.sq.x = i;
                if (this.sq.y > j)
                    this.sq.y = j
                if (this.sq.ex < i)
                    this.sq.ex = i;

                if (this.sq.ey < j)
                    this.sq.ey = j;
            }
        }
    }
    for (i = 0; i < width; i++) {
        for (j = 0; j < height; j++) {
            if (i == 0 || j == 0 || i == width - 1 || j == height - 1) {
                this.imgData[(j * width + i) * 4] = 0;
                this.imgData[(j * width + i) * 4 + 1] = 0;
                this.imgData[(j * width + i) * 4 + 2] = 0;
            }
            else {
                this.imgData[(j * width + i) * 4] = iArrayValue[i][j];
                this.imgData[(j * width + i) * 4 + 1] = iArrayValue[i][j];
                this.imgData[(j * width + i) * 4 + 2] = iArrayValue[i][j];
            }
        }
    }

    this.sq.width = this.sq.ex - this.sq.x;
    this.sq.height = this.sq.ey - this.sq.y
    noisefilter
    if (typeof option == "function") {
        option(this.sq, this.dd)
    }
    if (typeof noisefilter == "function") {
        noisefilter(this.sq, this.dd)
    }
    if (typeof callback == "function") {
        callback(this.sq, this.dd)
    }
}

var mDetection = function(cv, option, callback) {
    this.canvas = cv;
    this.ctx = this.canvas.getContext("2d")
    this.dd = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    this.imgData = this.dd.data;
    this.sq = {
        x: this.canvas.width,
        y: this.canvas.height,
        width: 0,
        height: 0
    }
    this.opvalue = 0;
    if (typeof option == "string")
        this.opvalue = option;
    var ev = 0;
    for (var i = 0; i < this.imgData.length; i += 4) {
        var result = this.imgData[i] + this.imgData[i + 1] + this.imgData[i + 2];
        ev += result;
    }
    ev = ev / (this.canvas.width * this.canvas.height)

    for (var i = 0; i < this.imgData.length; i += 4) {
        var result = this.imgData[i] + this.imgData[i + 1] + this.imgData[i + 2] + (765 - ev);

        this.imgData[i] = result
        this.imgData[i + 1] = result
        this.imgData[i + 2] = result
        //if (result < max * 10 - option) {
        if (result < ev - this.opvalue) {
            if (this.sq.x > (i / 4) % this.canvas.width)
                this.sq.x = (i / 4) % this.canvas.width;
            if (this.sq.y > Math.round((i / 4) / this.canvas.width))
                this.sq.y = Math.round((i / 4) / this.canvas.width)
            if (this.sq.width < (i / 4) % this.canvas.width - this.sq.x)
                this.sq.width = (i / 4) % this.canvas.width - this.sq.x;
            if (this.sq.height < Math.round((i / 4) / this.canvas.width) - this.sq.y)
                this.sq.height = Math.round((i / 4) / this.canvas.width) - this.sq.y
            this.imgData[i] = 0
            this.imgData[i + 1] = 0
            this.imgData[i + 2] = 0
        }
        else {
            this.imgData[i] = 255
            this.imgData[i + 1] = 255
            this.imgData[i + 2] = 255
        }
    }
    if (typeof option == "function") {
        option(this.sq, this.dd)
    }
    if (typeof callback == "function") {
        callback(this.sq, this.dd)
    }
    return this.sq;
}

function mPutImageData(ctx, imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
    var data = imageData.data;
    var height = imageData.height;
    var width = imageData.width;
    dirtyX = dirtyX || 0;
    dirtyY = dirtyY || 0;
    dirtyWidth = dirtyWidth !== undefined ? dirtyWidth : width;
    dirtyHeight = dirtyHeight !== undefined ? dirtyHeight : height;
    var limitBottom = Math.min(dirtyHeight, height);
    var limitRight = Math.min(dirtyWidth, width);
    for (var y = dirtyY; y < limitBottom; y++) {
        for (var x = dirtyX; x < limitRight; x++) {
            var pos = y * width + x;
            ctx.fillStyle = 'rgba(' + data[pos * 4 + 0] +
                ',' + data[pos * 4 + 1] +
                ',' + data[pos * 4 + 2] +
                ',' + (data[pos * 4 + 3] / 255) + ')';
            ctx.fillRect(x + dx, y + dy, 1, 1);
        }
    }
}

var mIsin(array,item,option){
	var tmp = false;
	for(var i = 0; i < array.length; i++)
		if(array[i] == item)
			tmp = i
	return tmp
}

var mDelsame(array){
	var deltmp = []
	for(var i = 0; i < array.length; i++){
		for(var j = i; j< array.length; j++){
			if(array[i] == array[j])
				deltmp.push(i)
		}
	}
	deltmp.reverse()
	console.log(deltmp)
}
