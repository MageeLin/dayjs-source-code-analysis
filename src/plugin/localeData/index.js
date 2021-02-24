import { t } from '../localizedFormat/utils'

/**
 * @description: plugin 增加了 dayjs().localeData API 来提供本地化数据。
 * @param {Object} o option
 * @param {Class} c Dayjs类
 * @param {Function} d dayjs函数对象
 */
export default (o, c, dayjs) => {
  const proto = c.prototype
  /**
   * @description: 获取locale的部分属性
   * @param {String} part 键名
   * @return {Any} 返回locale的属性
   */
  const getLocalePart = part => (part && (part.indexOf ? part : part.s))
  /**
   * @description: 获取locale星期月份的不同程度的缩写
   * @param {Dayjs|Locale} ins Dayjs实例或Locale对象
   * @param {String} target 目标对哪个单位，举例 months或monthsShort
   * @param {String} full 全称 monthsShort对应的month
   * @param {Number} num 保留几位
   * @param {Boolean} localeOrder 是否按本地星期排序
   * @return {Array} 返回locale星期月份的不同程度的缩写 举例 ["Jan", "Feb", "Mar"...]
   */
  const getShort = (ins, target, full, num, localeOrder) => {
    const locale = ins.name ? ins : ins.$locale()
    const targetLocale = getLocalePart(locale[target])
    const fullLocale = getLocalePart(locale[full])
    const result = targetLocale || fullLocale.map(f => f.substr(0, num))
    if (!localeOrder) return result
    const { weekStart } = locale
    return result.map((_, index) => (result[(index + (weekStart || 0)) % 7]))
  }
  /**
   * @description: 获取当前语言环境对应的 Locale 对象
   * @return {Locale} 返回 Locale对象
   */
  const getDayjsLocaleObject = () => dayjs.Ls[dayjs.locale()]
  /**
   * @description: 返回对应的格式化模板
   * @param {Locale} l 本地正在使用的locale对象
   * @param {String} format key
   * @return {String} 返回格式化模板
   */
  const getLongDateFormat = (l, format) =>
    l.formats[format] || t(l.formats[format.toUpperCase()])

  /**
   * @description: 获取localData对象
   * @return {Object} 返回localData对象
   */  
  const localeData = function () {
    return {
      months: instance =>
        (instance ? instance.format('MMMM') : getShort(this, 'months')),
      monthsShort: instance =>
        (instance ? instance.format('MMM') : getShort(this, 'monthsShort', 'months', 3)),
      firstDayOfWeek: () => this.$locale().weekStart || 0,
      weekdays: instance => (instance ? instance.format('dddd') : getShort(this, 'weekdays')),
      weekdaysMin: instance =>
        (instance ? instance.format('dd') : getShort(this, 'weekdaysMin', 'weekdays', 2)),
      weekdaysShort: instance =>
        (instance ? instance.format('ddd') : getShort(this, 'weekdaysShort', 'weekdays', 3)),
      longDateFormat: format => getLongDateFormat(this.$locale(), format),
      meridiem: this.$locale().meridiem
    }
  }
  /**
   * @description: 实例绑定localeData方法
   * @return {Object} 返回实例的localeData
   */
  proto.localeData = function () {
    return localeData.bind(this)()
  }

  /**
   * @description: 下面的几个方法都是一个作用，给dayjs函数对象添加localeData方法
   * @param {*}
   * @return {*}
   */
  dayjs.localeData = () => {
    const localeObject = getDayjsLocaleObject()
    return {
      firstDayOfWeek: () => localeObject.weekStart || 0,
      weekdays: () => dayjs.weekdays(),
      weekdaysShort: () => dayjs.weekdaysShort(),
      weekdaysMin: () => dayjs.weekdaysMin(),
      months: () => dayjs.months(),
      monthsShort: () => dayjs.monthsShort(),
      longDateFormat: format => getLongDateFormat(localeObject, format),
      meridiem: localeObject.meridiem
    }
  }

  dayjs.months = () => getShort(getDayjsLocaleObject(), 'months')

  dayjs.monthsShort = () => getShort(getDayjsLocaleObject(), 'monthsShort', 'months', 3)

  dayjs.weekdays = localeOrder => getShort(getDayjsLocaleObject(), 'weekdays', null, null, localeOrder)

  dayjs.weekdaysShort = localeOrder => getShort(getDayjsLocaleObject(), 'weekdaysShort', 'weekdays', 3, localeOrder)

  dayjs.weekdaysMin = localeOrder => getShort(getDayjsLocaleObject(), 'weekdaysMin', 'weekdays', 2, localeOrder)
}
