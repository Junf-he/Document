### typescript中枚举的位运算——分配权限案例

枚举的位运算（位枚举），只针对数字枚举

**位运算指的是把两个数字转换成二进制之后按照二进制的每一位进行的运算。**

```
enum Permission{
	Read,//可读权限
	Write,//可写权限
	Create,//可创建权限
	Delete//可删除权限
}
```

假如某个资源，具有可读、可写权限，但是不具备创建和删除权限，这种权限可以由这四个基本权限组合而成。

当然我们也可以把这些权限直接罗列出来：

```
enum Permission{
	Read,//可读权限
	Write,//可写权限
	Create,//可创建权限
	Delete,//可删除权限
	ReadAndWrite,//可读可写权限
	ReadAndCreate,//可读可创建权限
	...
}
```

显然，这样罗列是不合理的，因为这种组合有很多种，一一罗列出来非常浪费时间，并且如果其中某个权限需要修改，那么和它有关的所有权限都需要修改。我们可以这样做：

```
enum Permission{
	Read = 1,//可读权限     2^0 转换为二进制：0001
	Write = 2,//可写权限    2^1             0010
	Create = 4,//可创建权限  2^2            0100
	Delete = 8//可删除权限   2^3            1000
}
```

我们可以通过判断某一位上是否有1来判断是否有对应权限。如3这个数字，转换为二进制为0011，有可读、可写权限，但是没有创建和删除权限。这样我们就可以用这四个基础权限来组合新的权限：



- 组合权限，使用位运算 “|”：

  ```
  let p = Permission.Read | Permission.Write;
  ```

  将Read的值1转换为二进制为0001，Write转换为二进制为0010，将两个数字放在一起每一位进行比较，只要有一位结果为1，结果中这一位就是1，否则就是0。

  ```
  //0001
  //0010
  //—————
  //0011
  ```

  还可以算超过两个数字的位运算：

  ```
  let p = Permission.Read | Permission.Write | Permission.Create;
  //或 let a = p | Permission.Create;
  //0001
  //0010
  //0100
  //—————
  //0111
  ```



- 判断是否拥有该权限（且运算：&）：

  ```
  function hasPermission(target,per){
  	return (target & per) === per;
  }
  hasPermission(p,Permission.Read);//判断p是否有可读权限
  ```

  两个数字转换为二进制之后，每一位比较，如果两个数字的这一位相同，结果就为1，如果两个数字数字这一位不同，结果就为0。代码中，将指定权限与Read权限进行且运算，如果结果和Read权限完全一样，说明具有Read权限。



- 删除权限（异或运算^）：

  ```
  let p = Permission.Read | Permission.Write | Permission.Create;
  p = p ^ Permission.Write;
  ```

  两个数字转换为二进制之后，相同取0，不同取1。

  ```
  //0111
  //0010
  //——————
  //0101
  ```

  这样就能删除这一权限了。



