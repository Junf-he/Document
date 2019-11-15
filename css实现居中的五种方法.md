#css实现元素居中
##html内容:
```html
<div class="wrapper">
<div class="box"></div>
</div>
```
***
##确定了元素宽高 有三种方法:
**第一种方法：**

```css
.box {
	position:absolute;
	top:50%;
	left:50%;
	margin-top:-100px;/*减去自身高度的一半*/
	margin-left:-100px;/*减去自身宽度的一半*/
}
```
**第二种方法：**

```css
.box{
	position:absolute;
	top:calc(50% - 100px);/*减去自身高度的一半*/
	left:calc(50% - 100px);/*减去自身宽度的一半*/
}
```
**第三种方法：**

```css
.box{
	position:absolute;
	margin:auto;
	top:0;
	left:0;
	right:0;
	bottom:0;
}
```
***
##不确定元素的宽高  有两种方法
**第一种方法：**

```css
.box {
	position:absolute;
	left:50%;
	top:50%;
	transform:translate(-50%, -50%);
}
```
**第二种方法：**

```css
.wrapper {	
	display:flex;
	justify-content:center;
	align-items:center;
	height:200px;
}
```
