## Dayjs 源码解析

插播一个新系列：时间库 `dayjs` 的源码解析。

用官方的描述 “`Day.js` 是 `Moment.js` 的 2kB 轻量化方案，拥有同样强大的 `API`”。优点是如下三个：

- 简易：`Day.js` 是一个轻量的处理时间和日期的 `JavaScript` 库，和 `Moment.js` 的 `API` 设计保持完全一样。
- 不可变：所有的 `API` 操作都将返回一个新的 `Dayjs` 实例。这种设计能避免 `bug` 产生，节约调试时间。
- 国际化：`Day.js` 对国际化支持良好。但除非手动加载，多国语言默认是不会被打包到工程里的。

总的来说，`dayjs` 的优点就是 `plugin` 和 `locale` 手动按需加载，减少打包体积。

`dayjs` 是饿了么的大佬 [iamkun](https://github.com/iamkun) 开发维护的，大佬同时也是 `ElementUI` 的开发者。解析之前先从[dayjs 源代码仓库](https://github.com/iamkun/dayjs) `fork` 了一份：[https://github.com/MageeLin/dayjs-source-code-analysis](https://github.com/MageeLin/dayjs-source-code-analysis) 。

时间是 2020 年 12 月 7 日，`commitID` 是 `eb5fbc4c`。解析时从 `master` 分支拉了一个新分支 `analysis`。

<!-- more -->

可配合博客食用，分五章完成，目录如下：

1. [dayjs 源码解析（一）：概念、locale、constant、utils](https://linjingyi.cn/posts/23c2cdd0.html)
2. [dayjs 源码解析（二）：Dayjs 类](https://linjingyi.cn/posts/f281eaca.html)
3. [dayjs 源码解析（三）：插件（上）](https://linjingyi.cn/posts/19fc094a.html)
4. [dayjs 源码解析（四）：插件（中）](https://linjingyi.cn/posts/24199ecd.html)
5. [dayjs 源码解析（五）：插件（下）](https://linjingyi.cn/posts/a1406e2f.html)


---

前端记事本，不定期更新，欢迎关注！

- 微信公众号： 林景宜的记事本
- 博客：[林景宜的记事本](https://linjingyi.cn)
- 掘金专栏：[林景宜的记事本](https://juejin.im/user/404232342875966/posts)
- 知乎专栏： [林景宜的记事本](https://www.zhihu.com/column/linjy-note)
- Github: [MageeLin](https://github.com/MageeLin)

---
