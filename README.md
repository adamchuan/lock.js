# Lock.js
> 基于canvas模拟的手势解锁的插件，支持PC和移动端。
## How To Use
 1.首先你需要引入lock.js，然后在你的代码中。
 2.实例化一个lock。(2ez4u)
```javascript
var config = {
	callback : function(touchList){  //touchend 抬手时的回调 传入的参数为 手势的数组
		alert(touchList);
	}
}
var ul = new lock(callback);
```
## Config 
> 你可以自定义该插件的一些设置，但暂时不支持颜色改变。
 - `wrap` 需要添加插件的dom元素 默认为document.body
 - `size` 解锁键的行列数 默认为3（边长描述是不是要准确些）
 - `r` 解锁键的半径 默认为30
 - `gap` 锁键之间的距离 默认为15
 - 'callback' 抬手后的回调(一般情况就是检查手势密码是否正确)

## API
> lock对象内置了一些方法，供你设置或改变lock的状态

 - `drawErrorPanel()` 显示错误样式。密码输入错误时，调用他
 - `reDrawPanel()`   重绘解锁界面。  
 - `disable()` 禁止输入
 - `enable()` 允许输入
 - `drawLastChoose` 恢复上一次输入的状态
 - `getCircleTouchList` 获取解锁顺序数组


&copy; By Adam Chuan