/**
 * @description: plugin
 * @param {Object} o option
 * @param {Class} c Dayjs类
 */
export default (o, c) => {
  const proto = c.prototype
  /**
   * @description: 返回一个 boolean 来展示一个 Day.js 对象的年份是不是闰年。
   * @return {Boolean} 
   */
  proto.isLeapYear = function () {
    // 判断闰年需要满足的两种情况，1.能被4整除且不能被100整除 2.能被400整除
    return ((this.$y % 4 === 0) && (this.$y % 100 !== 0)) || (this.$y % 400 === 0)
  }
}

