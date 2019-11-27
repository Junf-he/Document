### git 常用命令

git add 文件 : 追踪指定文件
git add . :追踪所有的文件
git commit -m "注释" : 提交报本地仓库
git push : 推送远程仓库
git pull : 拉取
git status : 查看当前的提交状态
.gitignore : 忽略文件夹
git checkout -b xiao_a : 创建xiao_a分支,并且切换到xiao_a分支
git branch 分支名 : 创建分支,不切换
git checkout 分支名 : 切换到某个分支
git branch: 查看分支
git branch -d 分支名 : 删除分支
git merge 要合并的分支名称 : 合并分支
git reset HEAD test2 : git add 后 撤销文件
git reflog : 查看所有操作的日志
git reset --hard HEAD : 版本回退
git stash : 讲文件放入暂存区
git stash list : 查看缓存区文件
git stash applly 缓存区id : 将指定的文件从缓存区拿出来
git stash pop : 将文件从缓存区拿出来,并删除缓存区的文件
git stash clear : 清除缓存区
git diff 文件名: 比较的事工作目录和暂存区的不同
git diff --cached 文件名 : 比较暂存区还远程仓库的不同
git diff commitID 文件名: 比较工作目录和远程仓库的不同
git stash branch 分子名称: 暂存区创建分支
git tag -a 标签名称 -m "注释" : 创建标签
git tag : 查看标签
git push origin 标签名称 : 推送标签到远程仓库
git push origin --tags : 推送所有的标签到远程仓库