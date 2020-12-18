/**
 * @description: plugin
 * @param {Object} o option
 * @param {Class} c Dayjs类
 * @param {Function} f dayjs函数对象
 */
export default (o, c, f) => {
  /**
   * @description: 指示对象是不是Dayjs的实例
   * @param {Object} input
   * @return {Boolean} 
   */
  f.isMoment = function (input) {
    // 最终用的是判断是不是Dayjs的实例😂
    return f.isDayjs(input)
  }
}

