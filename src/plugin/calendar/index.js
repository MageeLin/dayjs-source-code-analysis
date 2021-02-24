/**
 * @description: plugin  
 * @param {Object} o option
 * @param {Class} c Dayjs类
 * @param {Function} d dayjs函数对象
 */
export default (o, c, d) => {
  const LT = 'h:mm A'
  const L = 'MM/DD/YYYY'
  const calendarFormat = {
    lastDay: `[Yesterday at] ${LT}`,
    sameDay: `[Today at] ${LT}`,
    nextDay: `[Tomorrow at] ${LT}`,
    nextWeek: `dddd [at] ${LT}`,
    lastWeek: `[Last] dddd [at] ${LT}`,
    sameElse: L
  }
  const proto = c.prototype
  /**
   * @description: 增加了 .calendar API 返回一个 string 来显示日历时间。
   * dayjs().calendar(dayjs('2008-01-01'))
   * dayjs().calendar(null, {
   *   sameDay: '[Today at] h:mm A', // The same day ( Today at 2:30 AM )
   *   nextDay: '[Tomorrow at] h:mm A', // The next day ( Tomorrow at 2:30 AM )
   *   nextWeek: 'dddd [at] h:mm A', // The next week ( Sunday at 2:30 AM )
   *   lastDay: '[Yesterday at] h:mm A', // The day before ( Yesterday at 2:30 AM )
   *   lastWeek: '[Last] dddd [at] h:mm A', // Last week ( Last Monday at 2:30 AM )
   *   sameElse: 'DD/MM/YYYY' // Everything else ( 17/10/2011 )
   * })
   * @param {Dayjs|Date} referenceTime
   * @param {String} formats
   * @return {*}
   */
  proto.calendar = function (referenceTime, formats) {
    const format = formats || this.$locale().calendar || calendarFormat
    // 把参考的时刻实例化，默认为今天的开始
    const referenceStartOfDay = d(referenceTime || undefined).startOf('d')
    // diff是参考时刻和实例的天数差
    const diff = this.diff(referenceStartOfDay, 'd', true)
    const sameElse = 'sameElse'
    // 太早了直接显示 DD/MM/YYYY
    const retVal = diff < -6 ? sameElse :
      // 之前 1 周内，
      diff < -1 ? 'lastWeek' :
        // 昨天
        diff < 0 ? 'lastDay' :
          // 同一天
          diff < 1 ? 'sameDay' :
            // 明天
            diff < 2 ? 'nextDay' :
              // 之后 1 周内
              // 太晚了也直接显示DD/MM/YYYY
              diff < 7 ? 'nextWeek' : sameElse
    const currentFormat = format[retVal] || calendarFormat[retVal]
    // 如果定义的format是个函数，就返回函数返回值
    if (typeof currentFormat === 'function') {
      return currentFormat.call(this, d())
    }
    // 普通的模板字符串就执行模板格式化
    return this.format(currentFormat)
  }
}

