/**
 * 状态转颜色
 */
export const getStatusColor = placeStatus => {
  const statusColorSet = {
    'PASS': 'green',
    'FAIL': 'red',
    'STANDBY': 'grey',
    'SERVICE': 'purple',
    'IR': 'orange',
  }

  let statusColor = 'black' // 默认状态颜色为黑色
  if (placeStatus in statusColorSet) {
    statusColor = statusColorSet[placeStatus]
  }
  
  return statusColor
}

/**
 * 端口类型
 */
export const portType = {
  '9': '手圈',
  '8': '高阻',
  '12': '低阻',
  '10': '平衡电压',
  '11': '温度',
  '13': '湿度',
  '16': '电烙铁漏电压',
  '17': '电烙铁对地电阻',
  '18': '电批漏电压',
  '19': '电批对地电阻'
}


/**
 * 参数单位类型
 */
export const unitTypes = ['MΩ', 'Ω', 'V', '%', '℃']
 /*
 * 端口代号转单位
 */
export const toADUnit = {
  '9': 'MΩ',
  '8': 'MΩ',
  '12': 'Ω',
  '10': 'V',
  '11': '℃',
  '13': '%',
  '16': 'V',
  '17': 'Ω',
  '18': 'V',
  '19': 'Ω'
}

/**
 * 端口类型转单位
 */
export const typeToADUnit = {
  'WS': 'MΩ',
  'GND-H': 'MΩ',
  'GND-L': 'Ω',
  'VB': 'V',
  'TEMP': '℃',
  'HUMI': '%',
}

/**
 * 端口中文类型转单位
 */
export const typeCNToADUnit = {
  '手圈': 'MΩ',
  '高阻': 'MΩ',
  '低阻': 'Ω',
  '平衡电压': 'V',
  '温度': '℃',
  '湿度': '%',
  '电烙铁漏电压': 'V',
  '电烙铁对地电阻': 'Ω',
  '电批漏电压': 'V',
  '电批对地电阻': 'Ω',
}

// 合法列号列表

// export const slots = [1, 2, 3, 4, 5, 6]
export const slots = [1, 2, 3, 4]

// 合法端口号列表

// export const ports = [0, 1, 2, 3, 4, 5]
export const ports = [0, 1, 2, 3]
//breakdownUnits
export const breakDownUnits = ['工厂','车间', '区域', '线体', '工位']


// export const trend_units =['day','week']
export const trend_units = [
  {
    text: '天',
    value: 'day',  
  },
  {
    text: '周',
    value: 'week',
  }
]
//Top issue 统计单位
export const topCountUnits = ['工厂','车间', '区域', '线体', '工位']
// export const topCountUnits = [0, 1, 2, 3, 4, 5]
//Top issue 统计前几位
export const topCounts = [1, 2, 3, 4, 5]
//报警次数时间趋势统计单位
export const trendUnits = [
  {
    text: '周',
    value: 'week'
  },
  {
    text: '天',
    value: 'day'
  }
]
//failure handle state

export const handleStates = [
  {
    text: '全部',
    value: '0'
  },
  {
    text: '已处理',
    value: '1'
  },
  {
    text: '未处理',
    value: '2'
  }
]

export const handleStatus = {
  "0": "全部",
  "1": "已处理",
  "2": "未处理",
}

/**
 * IP的正则表达式
 */
export const ipRegExp = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/

/**
 * 根据时间戳获取`yyyy-mm--dd hh:mm:ss`格式时间
 * @param timestamp 时间戳（单位秒）
 */
export const getFormatTimeByTimestamp = (timestamp) => {
  // 时区设置？？？？？

  var date = new Date(timestamp * 1000)
  var formatTime = ''
  formatTime += date.getFullYear() + '-'
  formatTime += (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-'
  formatTime += (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' '
  formatTime += (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
  formatTime += (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
  formatTime += (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())

  return formatTime
}

/**
 * 根据时间戳获取`yyyy-mm--dd`格式时间
 * @param timestamp 时间戳（单位秒）
 */
export const getFormatDateByTimestamp = (timestamp) => {
  // 时区设置？？？？？

  var date = new Date(timestamp * 1000)
  var formatTime = ''
  formatTime += date.getFullYear() + '-'
  formatTime += (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-'
  formatTime += (date.getDate() < 10 ? '0' + date.getDate() : date.getDate())

  return formatTime
}

/**
 * 正则判断
 */
export const isPattern = (str, regExp) => {
  if (typeof(str) == 'string')
  {
    var result = str.match(regExp)
    if (result == null) {
      return false
    }

    return true
  } else {
    return false
  }
}

/**
 * 判断是否为"yyyy-mm-dd hh:mm:ss"日期时间
 */
export const isDatetime = (str) => {
  var regExp = /^((([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29))\s(([01]?\d|2[0-3]):[0-5]?\d:[0-5]?\d)$/

  return isPattern(str, regExp)
}

/**
* 判断是否为"yyyy-mm-dd"日期
*/
export const isDate = (str) => {
  var regExp = /^((([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29))$/

  return isPattern(str, regExp)
}


/**
 * 字符时间转换为时间戳（秒为单位unix时间戳）
 */
export const toTimestamp = (timeStr) => {
  var timestamp = ''

  if (isDatetime(timeStr) || isDate(timeStr)) // 要求格式为'Y-m-d H:m:s'或'Y-m-d'
    timestamp = Date.parse(new Date(timeStr + ' UTC+0800')) / 1000 // 注意时区(时区设为东8区)

  return timestamp
}

/**
 * js模拟form表单请求
 * @param url 要访问的链接
 * @param requestType {'get' | 'post'}
 * @param conditions Object
 */
export function formRequest(url, requestType, conditions)
{
  // 定义一个form表单
  const form = document.createElement('form') 
  form.setAttribute('style', 'display: none')
  form.setAttribute('target', '')
  form.setAttribute('method', requestType)
  form.setAttribute('action', url)

  document.body.appendChild(form)

  for (let prop in conditions) {
    let input = document.createElement('input')
    input.setAttribute('type', 'hidden')
    input.setAttribute('name', prop)
    input.setAttribute('value', conditions[prop])

    form.appendChild(input) //将查询参数控件提交到表单上
  }

  form.submit() //表单提交
  document.body.removeChild(form)
}

export const level2type = level => {
  switch (level) {
    case 1:
      return 'plant'
    case 2:
      return 'workshop'
    case 3:
      return 'region'
    case 4:
      return 'line'
    case 5:
      return 'station'
    default:
      return ''
  }
}
