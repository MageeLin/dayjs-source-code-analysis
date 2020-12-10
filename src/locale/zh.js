// Chinese [zh]
import dayjs from 'dayjs'

// locale 对象
const locale = {
  name: 'zh', // 对象的名，关键
  // 数组都是用 split 实现
  // weekdays 数组
  weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
  // 可选，简写 weekdays 数组，没有就用前 3 个字符
  weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
  // 可选，最简写 weekdays 数组，没有就用前 2 个字符
  weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
  // months 数组
  months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
  // 可选，简写 months 数组，没有就用前 3 个字符
  monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
  /**
   * @description: 返回例如3周，2日
   * @param {Number} number 第几个
   * @param {String} period 单位标志
   * @return {String}
   */
  ordinal: (number, period) => {
    switch (period) {
      case 'W':
        return `${number}周`
      default:
        return `${number}日`
    }
  },
  // 可选，设置一周的开始，默认周日，1 代表周一
  weekStart: 1,
  // 可选，设置一年的开始周，包含1月4日的那一周作为第一周
  yearStart: 4,
  // 格式化模板
  formats: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'YYYY/MM/DD',
    LL: 'YYYY年M月D日',
    LLL: 'YYYY年M月D日Ah点mm分',
    LLLL: 'YYYY年M月D日ddddAh点mm分',
    // 小写或者简写
    l: 'YYYY/M/D',
    ll: 'YYYY年M月D日',
    lll: 'YYYY年M月D日 HH:mm',
    llll: 'YYYY年M月D日dddd HH:mm'
  },
  // 相对时间的格式化模板，保正 %s %d 相同
  relativeTime: {
    future: '%s后',
    past: '%s前',
    s: '几秒',
    m: '1 分钟',
    mm: '%d 分钟',
    h: '1 小时',
    hh: '%d 小时',
    d: '1 天',
    dd: '%d 天',
    M: '1 个月',
    MM: '%d 个月',
    y: '1 年',
    yy: '%d 年'
  },
  /**
   * @description: 根据时和分返回当前的时间阶段
   * @param {Number} hour 时
   * @param {Number} minute 分
   * @return {String} 时间阶段
   */
  meridiem: (hour, minute) => {
    const hm = (hour * 100) + minute
    if (hm < 600) {
      return '凌晨'
    } else if (hm < 900) {
      return '早上'
    } else if (hm < 1130) {
      return '上午'
    } else if (hm < 1230) {
      return '中午'
    } else if (hm < 1800) {
      return '下午'
    }
    return '晚上'
  }
}

// 把 locale 对象加载到locale的 Ls 中
dayjs.locale(locale, null, true)

// 使用时如下操作
// dayjs.locale('zh-cn') // 全局使用
// dayjs().locale('zh-cn').format() // 当前实例使用

export default locale
