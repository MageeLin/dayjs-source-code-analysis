/**
 * @description: plugin 添加min max api
 * @param {Object} o option
 * @param {Class} c Dayjs类
 * @param {Function} d dayjs函数对象
 */
export default (o, c, d) => {
  /**
   * @description: 给实例数组排序，返回筛选出来的实例
   * @param {String} method 筛选用的方法名
   * @param {[Dayjs]} dates 实例组成的数组
   * @return {Dayjs} 返回指定的方式筛选出来的实例
   */
  const sortBy = (method, dates) => {
    if (!dates || !dates.length || !dates[0] || (dates.length === 1 && !dates[0].length)) {
      return null
    }
    if (dates.length === 1 && dates[0].length > 0) {
      [dates] = dates
    }
    let result
    // result是dates[0]
    [result] = dates
    // 迭代
    for (let i = 1; i < dates.length; i += 1) {
      // 挨个比较，result始终放置得是最大或者最小的
      if (!dates[i].isValid() || dates[i][method](result)) {
        result = dates[i]
      }
    }
    return result
  }

  /**
   * @description: 在参数中挑选出时间最大的实例
   * @param {Dayjs} 任意数量的Dayjs数组
   * @return {Dayjs} 返回时间最晚的参数实例
   */
  d.max = function () {
    const args = [].slice.call(arguments, 0)
    return sortBy('isAfter', args)
  }
  /**
   * @description: 在参数中挑选出时间最小的实例
   * @param {Dayjs} 任意数量的Dayjs数组
   * @return {Dayjs} 返回时间最早的参数实例
   */
  d.min = function () {
    const args = [].slice.call(arguments, 0)
    return sortBy('isBefore', args)
  }
}

