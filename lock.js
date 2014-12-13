/*
    生成一个解锁的canvas
*/
var lock = (function(){
    /* --- 定义公用变量和方法 --- */
    var _isAndroid = navigator.userAgent.match(/android/i);
    var _androidVersion = 0;
    if(_isAndroid) {
        _androidVersion = parseFloat(navigator.userAgent.slice(navigator.userAgent.indexOf("Android")+8));
    }
    var _isTouch = document.hasOwnProperty("ontouchstart");
    var _touchstart = _isTouch ? 'touchstart' : 'mousedown',
        _touchmove = _isTouch  ? 'touchmove' : 'mousemove',
        _touchend = _isTouch ? 'touchend' : 'mouseup';
    var getPosition = function(o){ //获取元素相对屏幕的位置
        var temp = {
            x : 0,
            y : 0,
        };
        while(o != document.body){
            temp.x += o.offsetLeft;
            temp.y += o.offsetTop;
            o = o.offsetParent;
        }
        return temp;
    }
    var circle = function(x,y,index,hasChoose){ //圆的实体类
        return {
            x : x,
            y : y,
            index : index,
            hasChoose : hasChoose
        }
    }
    return function(config){
        var that = this;
        config = config || {};
        config.callback = config.callback || function(){that.reDrawPanel()};
        var r = config.r || 30,
            lineColor = config.lineColor || "#46c017",
            size = config.size || 3,
            wrap = config.wrap || document.body ,
            _offsetTop = config.offsetTop || 0 ,
            _offsetLeft = config.offsetLeft || 0,
            gap  = config.gap || 15,
            center = [], //储存圆心位置的实体{x:'',y:'',index '' ,has:Choose''}
            circleTouchList = [] , //被选中的圆的下标数组
            canvas = document.createElement("canvas"),
            boxSize = (r + gap) * 2 * size,
            r_temp = r + gap,
            ctx,
            canvasPos,
            disable = false; //是否启动解锁
        /**
         * 初始化canvas
         */
        var initUnlockPanel = function(){
            //生成基本圆
            var index,
                x,
                y,
                hasChoose = false;
            canvas.width = boxSize;
            canvas.height = boxSize;

            ctx = canvas.getContext('2d');

            for(var i = 0 ; i < size ; i++){ //rows
                for(var j = 0; j < size ; j++){ //cols
                    x = r_temp + j * r_temp * 2;
                    y = r_temp + i * r_temp * 2;
                    index = center.length;
                    center.push(new circle(x,y,index,hasChoose));
                    drawEmptyCircle(index);
                }
            }
            /* 启用硬件加速,同时也是解决某些andriod机上重影的bug  */
            wrap.style.overflow = "visible" ;
            wrap.style.webkitTransform = "translateZ(0)";
            /* ------ */

            /* 阻止滑动时屏幕跟随移动 */
            canvas.addEventListener(_touchmove,function(e){
                e.preventDefault();
            });
            wrap.appendChild(canvas);
            addChooseListener();
        }
        /**
         * 画正在移动的线
         * @param startX 起始点的X
         * @param startY 起始点的Y
         * @param posX 结束点的X
         * @param posY 结束点的Y
         */
        var drawMoveLine = function(startX,startY,posX,posY){
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(posX,posY);
            ctx.lineWidth = 3.0;
            ctx.strokeStyle = lineColor;
            ctx.stroke();
            ctx.closePath();
        }
        /**
         * 生成一条线连接两个圆
         * @param startIndex起始圆的位置
         * @param endIndex结束圆的位置
         */
         var connectCircle = function(startIndex,endIndex,color){
            var x1 = center[startIndex].x,
                y1 = center[startIndex].y,
                x2 = center[endIndex].x,
                y2 = center[endIndex].y;
            ctx.beginPath(); // 开始路径绘制
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = 3.0; // 设置线宽
            ctx.strokeStyle = color || lineColor ; // 设置线的颜色
            ctx.stroke();  // 进行线的着色，这时整条线才变得可见
            ctx.closePath();
        }
         /**
         * 判断某个点在不在某个圆内
         * @param x该点的X坐标
         * @param y该店的Y坐标
         * @returns 如果在返回该圆的位置，否则返回空
         */
         var checkInCircle = function(x,y){
            var col = Math.floor(x  / r_temp / 2);
            var row = Math.floor(y  / r_temp / 2);
            if(col >= size || row >= size || col < 0 || row < 0){
                return null;
            }
            var circle = center[row * size + col];
            if( x <= circle.x + r && x >= circle.x - r && y <= circle.y + r && y >= circle.y - r){
                return circle.index;
            }else
                return null;
        }
         /**
         * 画一个空心圆
         * @param index圆的位置
         */
         var drawEmptyCircle = function(index){
            ctx.beginPath();
            var x = center[index].x;
            var y = center[index].y;
            ctx.arc(x,y,r,0,Math.PI*2,true); //Math.PI*2是JS计算方法，是圆
            ctx.lineWidth = 1.0;
            ctx.strokeStyle = "#868686";
            ctx.stroke();
            ctx.closePath();
        }

        /**
         *画实心圆
         * @param index圆的位置
         * @param config圆的颜色配置
         */
        var drawSolidCircle = function(index,config){
            config = config || {};
            var x = center[index].x,
                y = center[index].y,
                c1 = config.c1 || "#46c017",
                c2 = config.c2 || "#cbeac0";
            //画外面的圆
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI*2, true);
            ctx.fillStyle = c2;
            ctx.fill();
            ctx.lineWidth = 1.0;
            ctx.strokeStyle = c1 ;
            ctx.stroke();
            ctx.closePath();
            //画小圆
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI*2, true);
            ctx.fillStyle = c1;
            ctx.fill();
            ctx.closePath();
        }

        /**
         * 该方法会将选中的圆变为‘错误时’的样式
         */
        var drawErrorCircle = function(){
            for(var i = 0; i < circleTouchList.length ; i ++){
                drawSolidCircle(circleTouchList[i],{
                    c1: '#f7574b',
                    c2: '#f8d0cd'
                });
            }
            for(var i = 0; i < circleTouchList.length - 1 ; i ++){
                connectCircle(circleTouchList[i],circleTouchList[i+1],'#f7574b');
            }
        }
        /**
         * 清空canvas画布的内容
         */
        var clearCanvas = function(){
            ctx.clearRect(0, 0, boxSize, boxSize);
            if(_isAndroid ) { /* 安卓下clearRect无效时的hack */
                canvas.style.display = 'none';// Detach from DOM
                canvas.offsetHeight; // Force the detach
                canvas.style.display = 'inherit'; // Reattach to DOM
            }
        }
        /**
         * 根据当前的circleTouchList的数据，显示对应的解锁图像
         */
        var showCurrentLockBg = function(){
            clearCanvas();
            for(var i = 0 ; i < center.length ;i++){
                if(center[i].hasChoose){
                    drawSolidCircle(i);
                }else{
                    drawEmptyCircle(i);
                }
            }
            for(var i = 0 ; i < circleTouchList.length - 1 ; i ++){
                connectCircle(circleTouchList[i],circleTouchList[i + 1]);
            }
        }

        var addChooseListener = function(){
            var startX,
                startY,
                posX,
                posY,
                drawing = false
            function initMoveParam(){
                startX = null;
                startY = null;
                posX = null;
                posY = null;
                drawing = false;
                for(var i = 0;i < circleTouchList.length ; i++ ){
                    center[circleTouchList[i]].hasChoose = false;
                }
                circleTouchList = []; //被选中的圆的下标数组
            }
            canvas.addEventListener(_touchstart,startListener);
            function startListener(e){
                if(drawing || disable){
                    return ;
                }
                canvasPos = getPosition(canvas); //这个应该放到scroll后去计算
                startX = e.touches[0].pageX - canvasPos.x + _offsetLeft;
                startY = e.touches[0].pageY - canvasPos.y + _offsetTop;
                var index = checkInCircle(startX,startY);
                if(index !== null){
                    drawing = true;
                    circleTouchList.push(index);
                    center[index].hasChoose = true;
                    showCurrentLockBg();
                    canvas.addEventListener(_touchmove,moveListener);
                    canvas.addEventListener(_touchend,endListener);
                    e.stopPropagation();
                }
            }
            var  moveListener = function(e){
                if(!drawing || disable){
                    return ;
                }
                e.stopPropagation();
                posX = e.touches[0].pageX - canvasPos.x + _offsetLeft;
                posY = e.touches[0].pageY - canvasPos.y + _offsetTop;
                var index = checkInCircle(posX,posY);
                showCurrentLockBg();
                if(index === null || center[index].hasChoose ){
                    drawMoveLine(startX, startY,posX,posY);
                }else{
                    startX = center[index].x;
                    startY = center[index].y;
                    drawSolidCircle(index);
                    connectCircle(circleTouchList[circleTouchList.length - 1],index);
                    circleTouchList.push(index);
                    center[index].hasChoose = true;
                }

            }
            var  endListener = function(e){
                if(!drawing || disable){
                    return ;
                }
                e.stopPropagation();
                showCurrentLockBg();
                config.callback(circleTouchList);
                drawing = false;
                canvas.removeEventListener(_touchmove,moveListener);
                canvas.removeEventListener(_touchend,endListener);
            }
        }

        /* 定义特权方法方法 */
        this.setCircleTouchList = function(data){
            circleTouchList = data;
        }
        this.getCircleTouchList = function(){
            return circleTouchList;
        }
        this.reDrawPanel = function(){
            clearCanvas();
            for(var i = 0; i< center.length ; i++){
                center[i].hasChoose = false;
                drawEmptyCircle(center[i].index);
            }
            circleTouchList = [];
        }
        this.drawLastChoose = function(){
            ctx.putImageData(imageData.choose, 0, 0);
        }
        this.disable =function(){
            disable = true;
        }
        this.enable = function(){
            disable = false;
        }
        this.drawErrorPanel = function(callback){
            callback = callback || new Function();
            var that = this;
            that.disable();
            drawErrorCircle();
            setTimeout(function(){
                that.reDrawPanel();
                that.enable();
                callback();
            },200);
        }
        this.setOffsetTop = function(value){
            _offsetTop = value;
        }
        this.setOffsetLeft = function(value){
            _offsetLeft = value;
        }
        initUnlockPanel();
    }
})();
