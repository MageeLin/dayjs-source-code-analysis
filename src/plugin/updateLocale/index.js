/**
 * @description: plugin
 * @param {Object} option option
 * @param {Class} Dayjs Dayjs类
 * @param {Function} dayjs dayjs函数对象
 */
export default (option, Dayjs, dayjs) => {
  /**
   * @description: 指定语言的任何属性将会被更新，而其他属性将会保持不变 
   * @param {String} locale 指定语言
   * @param {Object} customConfig 自定义配置
   * @return {Object} 返回更新后的语言全部配置
   */
  dayjs.updateLocale = function (locale, customConfig) {
    const localeList = dayjs.Ls
    const localeConfig = localeList[locale]
    if (!localeConfig) return
    // 只需要递归两层深度，覆盖即可
    const customConfigKeys = customConfig ? Object.keys(customConfig) : []
    customConfigKeys.forEach((c) => {
      localeConfig[c] = customConfig[c]
    })
    return localeConfig // eslint-disable-line consistent-return
  }
}

