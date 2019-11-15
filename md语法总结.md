# 标题:
一个#表示一级标题,最多六级标题
>\# h1
>\## h2
>\### h3
>\#### h4
>\##### h5
>\###### h6
# h1
## h2
### h3
#### h4
##### h5
###### h6
注意:#和标题的文字之间要加一个空格,否则不会生效

# 列表:
* 无序列表,用* + -都可(不同级别之间加四个空格分级)
>\*列表
>    \+次级
>    \-次级
>\*列表
* 列表
    + 次级
    - 次级
* 列表
注意:*+-和文字之间要加一个空格,否则不会生效
* 有序列表,用数字+"."表示(不同级别之间可以用四个空格分级),可以自动纠正顺序
>1\.列表1
>3\.列表2
>4\.列表3
>    1\.次级1
>    2\.次级2
1. 列表1
3. 列表2
4. 列表3
    1. 次级1
    2. 次级2
注意:.和文字之间要加一个空格,否则不会生效

# 区块:
用>表示引用，多层引用就用多个>
\>一级引用
\>>二级引用
\>>>三级引用
> 一级引用
>> 二级引用
>>> 三级引用
注意:>和文字之间要加一个空格,否则不会生效

# 分割线
用三个*或-或_表示
>\***
>\---
>\___

# 链接
* 链接文字放到中括号[]里，链接地址放到小括号里，
比如:\[链接文字](http://baidu.com) 
结果就是这样：[链接文字](http://baidu.com)
* 链接地址放到<>里，
比如：\<http://baidu.com> 
结果就是这样: <http://baidu.com>
引用，通常用于注解
\[1]: http://google.com/ "google"
\[2]: http://yahoo.com/ "yahoo"
\[3]: http://msn.com/ "msn"

# 图片
\![图片文字](url)
与链接一样只是在开头多了个！
比如：\![百度](http://baidu.com/....)
![百度](http://www.baidu.com/img/bd_logo1.png?qua=high&where=super)

# 代码框
开头结尾用`，单行用一个`，多行用三个```
1. 单行：开头结尾用一个反引号`
>\` console.log('talk is cheap, show me the code') `
` console.log('talk is cheap, show me the code') `
2. 多行：开头与结尾分别用三个反引号```单独占一行,可指定或不指定语言，比如javascript
>\``` javascript
>for(let i in skills){
>    console.log('wanderful skill: ' + skills[I]);
>}
>```
``` javascript
for(let i in skills){
    console.log('wanderful skill: ' + skills[I]);
}
```
>\```
>npm install sftp-client-promise
>```
```
npm install sftp-client-promise
```

# 表格
用:的不同位置来改变对齐方式，默认左对齐(:-)，右对齐(-:)，居中对齐(:-:)
* 方式一
>\|head\|head\|head\|
>\|\:\-\-\-\-\:\|\:\-\-\-\-\|\-\-\-\-\:\|
>\|center\|left\|right\|
>\|center\|left\|right\|
>\|center\|left\|right\|
|head|head|head|
|:----:|:----|----:|
|center|left|right|
|center|left|right|
|center|left|right|
* 方式二
>head\|head\|head
>\-\-\-\:\|\:\-\-\-\:\|\-\-\-\|
>right\|center\|left
>right\|center\|left
head|head|head
---:|:---:|---|
right|center|left
right|center|left
* 方式三
>head\|head\|head
>\-|\-:\|\:\-\:\|
>left\|right\|center
>left\|right\|center
head|head|head
-|-:|:-:|
left|right|center
left|right|center

# 强调
开头结尾用*(或者_)，* 表示斜体,** 表示加粗，***表示斜体加粗
>\*em*
>\**strong**
>\***斜体加粗***
*em*
**strong**
***斜体加粗***

# 删除线
开头结尾用~~
>\~~删除线~~
~~删除线~~

# 转义
如果描述中需要用到markdown中的符号，比如*、#，但是不想它被转义，就可以在这些符号前面加反斜杠，如\*、\#

# 颜色
颜色表示复杂一点：$\color{颜色}{内容}$
$开头$结尾，第一个{}填颜色，第二个{}填写内容
>\$\color{red}{颜色}$没有颜色, $\color{rgba(0,255,0,.8)}{颜色}$没有颜色 $\color{#ff0000}{颜色}$
$\color{red}{颜色}$没有颜色, $\color{rgba(0,255,0,.8)}{show}$没有颜色 $\color{#ff0000}{颜色}$
>\$\color{#00CED1}{颜色}$
$\color{#00CED1}{颜色}$
