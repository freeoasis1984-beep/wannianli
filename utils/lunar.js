// 農曆計算工具：1900-2100 年範圍
// 資料表來源為常見的開源農曆算法

const lunarInfo = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, // 1900-1909
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, // 1910-1919
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, // 1920-1929
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, // 1930-1939
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, // 1940-1949
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, // 1950-1959
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, // 1960-1969
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, // 1970-1979
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, // 1980-1989
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0, // 1990-1999
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, // 2000-2009
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, // 2010-2019
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, // 2020-2029
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, // 2030-2039
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, // 2040-2049
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, // 2050-2059
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, // 2060-2069
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, // 2070-2079
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, // 2080-2089
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252, // 2090-2099
  0x0d520  // 2100
];

const Gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const Zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const Animals = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];
const lunarMonth = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '臘'];
const lunarDay1 = ['初', '十', '廿', '三'];
const lunarDay2 = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

const solarFestival = {
  '0101': '元旦',
  '0214': '情人節',
  '0308': '婦女節',
  '0312': '植樹節',
  '0401': '愚人節',
  '0501': '勞動節',
  '0504': '青年節',
  '0601': '兒童節',
  '0701': '建黨節',
  '0801': '建軍節',
  '0910': '教師節',
  '1001': '國慶節',
  '1031': '萬聖節',
  '1224': '平安夜',
  '1225': '聖誕節'
};

const lunarFestival = {
  '0101': '春節',
  '0115': '元宵節',
  '0202': '龍頭節',
  '0505': '端午節',
  '0707': '七夕節',
  '0715': '中元節',
  '0815': '中秋節',
  '0909': '重陽節',
  '1208': '臘八節',
  '1223': '小年',
  '0100': '除夕'
};

function lYearDays(y) {
  let i,
    sum = 348;
  for (i = 0x8000; i > 0x8; i >>= 1) {
    sum += lunarInfo[y - 1900] & i ? 1 : 0;
  }
  return sum + leapDays(y);
}

function leapMonth(y) {
  return lunarInfo[y - 1900] & 0xf;
}

function leapDays(y) {
  if (leapMonth(y)) {
    return lunarInfo[y - 1900] & 0x10000 ? 30 : 29;
  }
  return 0;
}

function monthDays(y, m) {
  if (m > 12 || m < 1) return -1;
  return lunarInfo[y - 1900] & (0x10000 >> m) ? 30 : 29;
}

function ganZhiYear(lYear) {
  const ganKey = (lYear - 4) % 10;
  const zhiKey = (lYear - 4) % 12;
  return Gan[ganKey] + Zhi[zhiKey];
}

function getAnimal(lYear) {
  return Animals[(lYear - 4) % 12];
}

function toGanZhi(offset) {
  return Gan[offset % 10] + Zhi[offset % 12];
}

function getLunarDayName(d) {
  let s = '';
  switch (d) {
    case 10:
      s = '初十';
      break;
    case 20:
      s = '二十';
      break;
    case 30:
      s = '三十';
      break;
    default:
      s = lunarDay1[Math.floor(d / 10)] + lunarDay2[(d % 10) - 1];
  }
  return s;
}

function getLunarMonthName(m, isLeap) {
  return (isLeap ? '閏' : '') + lunarMonth[m - 1] + '月';
}

// 公曆 -> 農曆
function solar2lunar(yy, mm, dd) {
  if (yy < 1900 || yy > 2100) return null;
  const baseDate = new Date(1900, 0, 31);
  const objDate = new Date(yy, mm - 1, dd);
  let offset = Math.round((objDate - baseDate) / 86400000);
  let i,
    temp = 0;
  let year;
  for (i = 1900; i < 2101 && offset > 0; i++) {
    temp = lYearDays(i);
    offset -= temp;
  }
  if (offset < 0) {
    offset += temp;
    i--;
  }
  year = i;
  const leap = leapMonth(i);
  let isLeap = false;
  let month;
  for (i = 1; i < 13 && offset > 0; i++) {
    if (leap > 0 && i === leap + 1 && !isLeap) {
      --i;
      isLeap = true;
      temp = leapDays(year);
    } else {
      temp = monthDays(year, i);
    }
    if (isLeap && i === leap + 1) isLeap = false;
    offset -= temp;
  }
  if (offset === 0 && leap > 0 && i === leap + 1) {
    if (isLeap) {
      isLeap = false;
    } else {
      isLeap = true;
      --i;
    }
  }
  if (offset < 0) {
    offset += temp;
    --i;
  }
  month = i;
  const day = offset + 1;
  return {
    lYear: year,
    lMonth: month,
    lDay: day,
    isLeap: isLeap,
    ganZhiYear: ganZhiYear(year),
    animal: getAnimal(year),
    monthName: getLunarMonthName(month, isLeap),
    dayName: getLunarDayName(day)
  };
}

function getFestival(month, day) {
  const key = pad(month) + pad(day);
  return solarFestival[key] || '';
}

function getLunarFestival(lMonth, lDay, isLeap, lYear) {
  if (isLeap) return '';
  const key = pad(lMonth) + pad(lDay);
  if (lunarFestival[key]) return lunarFestival[key];
  // 除夕：臘月最後一天
  if (lMonth === 12) {
    const lastDay = monthDays(lYear, 12);
    if (lDay === lastDay) return '除夕';
  }
  return '';
}

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

module.exports = {
  solar2lunar,
  getFestival,
  getLunarFestival,
  getLunarDayName,
  getLunarMonthName
};
