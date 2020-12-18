import { D, W, Y } from '../../constant'

const isoWeekPrettyUnit = 'isoweek'

// 以下四个条件满足一个既可以，等价的
// 本年度第一个星期四所在的星期；
// 1月4日所在的星期；
// 本年度第一个至少有4天在同一星期内的星期；
// 星期一在去年12月29日至今年1月4日以内的星期；

/**
 * @description: plugin ISO-8601 基于周的日历
 * @param {Object} o option
 * @param {Class} c Dayjs类
 * @param {Function} d dayjs函数对象
 */
export default (o, c, d) => {
  /**
   * @description: 获取指定年的第一个星期四
   * @param {Number} year 年
   * @param {Boolean} isUtc 是否使用UTC模式
   * @return {Dayjs}
   */
  const getYearFirstThursday = (year, isUtc) => {
    const yearFirstDay = (isUtc ? d.utc : d)().year(year).startOf(Y)
    // 4 减 一月一号的星期几
    let addDiffDays = 4 - yearFirstDay.isoWeekday()
    if (yearFirstDay.isoWeekday() > 4) {
      addDiffDays += 7
    }
    // 获得了指定年的第一个星期四的实例
    return yearFirstDay.add(addDiffDays, D)
  }

  /**
   * @description: 获取离实例日期最近的星期四
   * @param {Dayjs} ins 实例
   * @return {Dayjs} 返回新实例
   */
  // 4 减 今天的星期几
  const getCurrentWeekThursday = ins => ins.add((4 - ins.isoWeekday()), D)

  const proto = c.prototype

  /**
   * @description: 获取实例所在的 ISO 周所在的年
   * @return {Number}
   */
  proto.isoWeekYear = function () {
    // 获取最近的星期四所在的年
    const nowWeekThursday = getCurrentWeekThursday(this)
    return nowWeekThursday.year()
  }

  /**
   * @description: 获取或设置年度的第 ISO 周数
   * @param {Number} week ISO周数
   * @return {Number|Dayjs}
   */
  proto.isoWeek = function (week) {
    // setter 算出周差，再加上
    if (!this.$utils().u(week)) {
      return this.add((week - this.isoWeek()) * 7, D)
    }
    // getter
    // 最近周四的实例
    const nowWeekThursday = getCurrentWeekThursday(this)
    // 今年第一个周四的实例
    const diffWeekThursday = getYearFirstThursday(this.isoWeekYear(), this.$u)
    // 算出周差后加一就是周数
    return nowWeekThursday.diff(diffWeekThursday, W) + 1
  }

  /**
   * @description: 获取或设置一周的第 ISO 日，范围是 1-7
   * @param {Number} week 有值则为setter，无值则为getter
   * @return {Number|Dayjs}
   */
  proto.isoWeekday = function (week) {
    // setter时，用this.day()除7取余
    if (!this.$utils().u(week)) {
      return this.day(this.day() % 7 ? week : week - 7)
    }
    // getter时，直接返回 this.day(), 0的时候就是7
    return this.day() || 7
  }

  const oldStartOf = proto.startOf
  /**
   * @description: 扩展 .startOf .endOf APIs 支持单位 isoWeek
   * @param {String} units 单位
   * @param {Boolean} startOf 标志，true:startOf, false: endOf
   * @return {Dayjs} 返回新的 Dayjs 实例，cfg与原实例相同
   */
  proto.startOf = function (units, startOf) {
    const utils = this.$utils()
    const isStartOf = !utils.u(startOf) ? startOf : true
    // 处理下单位 isoWeek
    const unit = utils.p(units)
    if (unit === isoWeekPrettyUnit) {
      // 获取本周一的开始
      return isStartOf ? this.date(this.date() - (this.isoWeekday() - 1)).startOf('day') :
        // 获取本周末的结束
        this.date((this.date() - 1 - (this.isoWeekday() - 1)) + 7).endOf('day')
    }
    // 普通情况还是用老版本的 oldStartOf 处理
    return oldStartOf.bind(this)(units, startOf)
  }
}
