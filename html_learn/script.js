/* ============================================================
   岁时记 · 传统黄历
   ------------------------------------------------------------
   第 1 部分：历法数据与纯函数（农历 / 节气 / 节日 / 日干支）
   第 2 部分：水墨背景画（程序绘制，隔日自动更换）
   第 3 部分：页面交互（时钟 / 黄历查询 / 月历印记 / 卷轴详情）
============================================================ */

/* ==================== 1-1. 农历换算 ==================== */

/* 农历数据表：1900-2100 年，每年一个十六进制数。
   低 4 位    = 闰月月份（0 表示无闰月）
   第 5~16 位 = 1~12 月的大小月（1 = 大月 30 天，0 = 小月 29 天）
   第 17 位   = 闰月大小（1 = 大 30 天，0 = 小 29 天） */
const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, // 1900-1909
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, // 1910-1919
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, // 1920-1929
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, // 1930-1939
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, // 1940-1949
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, // 1950-1959
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, // 1960-1969
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6, // 1970-1979
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
  0x0d520, // 2100
];

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
const WEEK_FULL = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const WEEK_SHORT = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const LUNAR_MONTH = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
const LUNAR_DAY = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
];
/* 十二时辰：每时辰 2 小时，从 23:00 的子时开始 */
const SHICHEN = [
  ['子时', '23:00-00:59'], ['丑时', '01:00-02:59'], ['寅时', '03:00-04:59'],
  ['卯时', '05:00-06:59'], ['辰时', '07:00-08:59'], ['巳时', '09:00-10:59'],
  ['午时', '11:00-12:59'], ['未时', '13:00-14:59'], ['申时', '15:00-16:59'],
  ['酉时', '17:00-18:59'], ['戌时', '19:00-20:59'], ['亥时', '21:00-22:59'],
];

/* 某年的闰月月份（0 = 没有闰月） */
function leapMonthOf(year) {
  return LUNAR_INFO[year - 1900] & 0xf;
}

/* 闰月有多少天 */
function leapDaysOf(year) {
  if (!leapMonthOf(year)) return 0;
  return LUNAR_INFO[year - 1900] & 0x10000 ? 30 : 29;
}

/* 某农历年某月（1~12）有多少天 */
function monthDaysOf(year, month) {
  return LUNAR_INFO[year - 1900] & (0x10000 >> month) ? 30 : 29;
}

/* 某农历年一共有多少天 */
function lunarYearDays(year) {
  let days = 348; // 12 个月 × 29 天
  for (let bit = 0x8000; bit > 0x8; bit >>= 1) {
    if (LUNAR_INFO[year - 1900] & bit) days += 1; // 大月补 1 天
  }
  return days + leapDaysOf(year);
}

/* 公历 → 农历（核心换算函数） */
function solarToLunar(y, m, d) {
  // 与 1900-01-31（庚子年正月初一）相差的天数
  let offset = Math.round(
    (Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 31)) / 86400000
  );

  // 第一步：按整年扣
  let year = 1900;
  let daysInYear = 0;
  while (offset > 0 && year < 2101) {
    daysInYear = lunarYearDays(year);
    offset -= daysInYear;
    year++;
  }
  if (offset < 0) {
    offset += daysInYear; // 扣过头了，退回来
    year--;
  }

  // 第二步：按月扣（闰月插在它下一月的正常月之前处理）
  const lYear = year;
  const leapMonth = leapMonthOf(lYear);
  let isLeap = false;
  let month = 1;
  let daysInMonth = 0;

  while (offset > 0 && month <= 12) {
    if (leapMonth > 0 && month === leapMonth + 1 && !isLeap) {
      month--;                    // 先扣闰月
      isLeap = true;
      daysInMonth = leapDaysOf(lYear);
    } else {
      daysInMonth = monthDaysOf(lYear, month);
    }
    if (isLeap && month === leapMonth + 1) isLeap = false; // 闰月扣完，恢复正常
    offset -= daysInMonth;
    month++;
  }

  // 边界：刚好扣到闰月下一天，即闰月初一
  if (offset === 0 && leapMonth > 0 && month === leapMonth + 1) {
    if (isLeap) isLeap = false;
    else { isLeap = true; month--; }
  }

  // 多扣了一个月，回退
  if (offset < 0) {
    offset += daysInMonth;
    month--;
  }

  return { year: lYear, month, day: offset + 1, isLeap };
}

/* 农历 → 公历（用于推算农历节日），返回 Date 或 null */
function lunarToSolar(lYear, lMonth, lDay, isLeap) {
  const leap = leapMonthOf(lYear);
  if (isLeap && leap !== lMonth) return null;

  let offset = 0;
  for (let i = 1; i < lMonth; i++) {
    offset += monthDaysOf(lYear, i);
    if (i === leap) offset += leapDaysOf(lYear);
  }
  if (isLeap) offset += monthDaysOf(lYear, lMonth);
  offset += lDay - 1;

  // 1900-01-31 为农历 1900 年正月初一
  let years = 0;
  for (let y = 1900; y < lYear; y++) years += lunarYearDays(y);
  const t = new Date(1900, 0, 31);
  t.setDate(t.getDate() + years + offset);
  return t;
}

/* 干支纪年，如 2024 → 甲辰 */
function ganzhiOf(year) {
  return GAN[(year - 4) % 10] + ZHI[(year - 4) % 12];
}

/* 生肖，如 2024 → 龙 */
function zodiacOf(year) {
  return ZODIAC[(year - 4) % 12];
}

/* 干支纪日：以 2000-01-01（戊午日，六十甲子序 54）为基准 */
const GZ_DAY_EPOCH = Date.UTC(2000, 0, 1);

function dayGanzhiOf(ts) {
  const days = Math.round((ts - GZ_DAY_EPOCH) / 86400000);
  const idx = ((54 + days) % 60 + 60) % 60;
  return GAN[idx % 10] + ZHI[idx % 12];
}

/* 时辰（0~23 点 → 十二时辰） */
function shichenOf(hour) {
  return SHICHEN[Math.floor(((hour + 1) % 24) / 2)];
}

/* 格式化农历日期，如：正月初一 / 闰六月十五 */
function formatLunar(lunar) {
  const monthName = (lunar.isLeap ? '闰' : '') + LUNAR_MONTH[lunar.month - 1] + '月';
  return monthName + LUNAR_DAY[lunar.day - 1];
}

/* ==================== 1-2. 二十四节气 ==================== */

const SOLAR_TERMS = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
  '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑',
  '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至',
];

/* 节气分钟表（寿星公式），与 1900-01-06 02:05 起算 */
const TERM_INFO = [
  0, 21208, 42467, 63836, 85337, 107014, 128867, 150921,
  173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033,
  353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758,
];

const TERM_DESC = {
  '小寒': '二十四节气之第二十三个，冬至之后寒气积久，自此进入一年中最寒冷的日子，民间有「小寒大寒，冷成冰团」之说。此时正值「三九」前后，万物敛藏。习俗：腊祭祈福、食糯米饭、画九消寒。',
  '大寒': '二十四节气的最后一个，寒气之逆极，是一年中最冷的时节，也是冬去春来的转折点。此时农闲岁尾，人们忙着除旧布新、腌制年肴。习俗：尾牙祭、除尘糊窗、备办年货。',
  '立春': '二十四节气之首，春季自此开始，东风解冻，万物复苏，古称「打春」。立春是新岁的开始，旧时官府有迎春之礼。习俗：咬春吃春饼、鞭打春牛、贴宜春字。',
  '雨水': '立春之后，气温回升，冰雪消融、降雨渐增，故称雨水。此时万物萌动，春意初现。习俗：回娘家省亲、拉保保（认干亲）、占稻色。',
  '惊蛰': '春雷始鸣，惊醒蛰伏于地下越冬的昆虫，故称惊蛰。此时春耕渐忙，百虫复苏。习俗：食梨润燥、祭白虎、蒙鼓皮。',
  '春分': '昼夜平分、寒暑均衡之日，正当春季九十日之半。此后北半球白昼渐长。习俗：竖蛋、放风筝、春祭。',
  '清明': '气清景明、万物皆显，既是节气又是传统节日，与春节、端午、中秋并称中国四大传统节日。习俗：扫墓祭祖、踏青郊游、插柳戴柳。',
  '谷雨': '雨生百谷，春季最后一个节气。此时降水充足，秧苗初插、作物新种，最需雨水滋润。习俗：饮谷雨茶、赏牡丹、祭仓颉。',
  '立夏': '夏季自此开始，斗指东南，万物繁茂。旧时帝王有迎夏之礼，民间以新尝之物迎夏。习俗：尝三新、称人、斗蛋。',
  '小满': '麦类等夏熟作物籽粒渐满而未熟，故称小满。此时南涝北旱之势渐显。习俗：祭车神、食苦菜、抢水灌田。',
  '芒种': '有芒之谷类作物成熟可种，南方种稻、北方收麦，是一年中最忙碌的时节，所谓「芒种忙忙种」。习俗：送花神、煮梅、安苗祭祀。',
  '夏至': '白昼最长、日影最短之日，古称「日北至」。夏至一阴生，此后阳气渐收。习俗：食面（冬至饺子夏至面）、祭神祀祖、消夏避伏。',
  '小暑': '暑气渐盛而未至最热，正值初伏前后，雷暴增多、作物进入生长旺季。习俗：食新尝新米、晒书画衣裳（晒伏）、吃藕。',
  '大暑': '一年中最炎热的时节，「湿热交蒸」于此时达到顶点，也是农作物生长最快的时期。习俗：饮伏茶、烧伏香、晒伏姜、吃仙草。',
  '立秋': '秋季自此开始，暑去凉来，禾谷成熟。立秋后仍有一伏，暑气未消，故有「秋老虎」之说。习俗：贴秋膘、啃秋吃瓜、晒秋。',
  '处暑': '处者，止也，暑气至此而止，炎热渐退、秋意初显。此时昼夜温差加大，庄稼加速成熟。习俗：放河灯、吃鸭子、开渔节。',
  '白露': '天气转凉，清晨露水凝白，故称白露。古人以四时配五行，秋属金、金色白，故以白形容秋露。习俗：收清露、饮白露茶、食龙眼。',
  '秋分': '昼夜再度平分，秋色正浓。自 2018 年起，此日被定为中国农民丰收节。习俗：祭月（后移至中秋）、送秋牛图、粘雀子嘴。',
  '寒露': '露水将凝为霜，气温骤降，北方深秋景象已现，鸿雁南飞、菊有黄华。习俗：登高赏菊、饮菊花酒、食芝麻。',
  '霜降': '秋季最后一个节气，初霜出现，草木黄落、蛰虫咸俯，为秋收冬藏做最后的准备。习俗：食柿子、赏红叶、进补。',
  '立冬': '冬季自此开始，水始冰、地始冻，万物收藏。古时此日为重要节日，天子率百官迎冬。习俗：吃饺子、补冬、酿黄酒。',
  '小雪': '天气渐寒，开始降雪但雪量尚小，故称小雪。此时北方腌菜、南方晒腊味正当时。习俗：腌腊肉、吃糍粑、晒鱼干。',
  '大雪': '雪量渐增，隆冬已至，「大雪封河」，北方千里冰封。此时进补最为相宜。习俗：观赏封河、腌肉、进补养生。',
  '冬至': '白昼最短之日，古称「日短至」。冬至一阳生，自古有「冬至大如年」之说，是重要的祭祀与团圆节日。习俗：北方吃饺子、南方食汤圆、数九消寒。',
};

/* 某年第 n 个节气（n = 0~23，自小寒起）的公历日期 */
function termDateOf(y, n) {
  const ms = 31556925974.7 * (y - 1900) + TERM_INFO[n] * 60000 + Date.UTC(1900, 0, 6, 2, 5);
  const d = new Date(ms);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/* 某日期所处的节气与下一节气 */
function termsAround(date) {
  const y = date.getFullYear();
  const list = [];
  for (let yy = y - 1; yy <= y + 1; yy++) {
    for (let n = 0; n < 24; n++) {
      const t = termDateOf(yy, n);
      list.push({ name: SOLAR_TERMS[n], ts: t.getTime() });
    }
  }
  list.sort((a, b) => a.ts - b.ts);

  const ts = date.getTime();
  let cur = null, next = null;
  for (let i = 0; i < list.length; i++) {
    if (list[i].ts <= ts) cur = list[i];
    else { next = list[i]; break; }
  }
  return {
    cur,
    next,
    daysToNext: next ? Math.round((next.ts - ts) / 86400000) : null,
  };
}

/* ==================== 1-3. 传统养生 ==================== */

/* 每个节气：宜 / 忌 + 起居、饮食、运动、情志 四个方面的顺应天时之建议 */
const WELLNESS = {
  '小寒': {
    yi: '进补、泡脚、早睡晚起',
    ji: '受寒、大汗、熬夜',
    items: {
      '起居': '早睡晚起，待日光而出。注意头、颈、腰、腹保暖，睡前以热水泡脚，可温通经络、安神助眠。',
      '饮食': '以温补为主，宜食羊肉、核桃、桂圆，晨起饮一杯姜枣茶暖身散寒，忌生冷之物。',
      '运动': '宜在日出后练习八段锦、慢跑等温和运动，微微汗出即止，切忌大汗淋漓、耗伤阳气。',
      '情志': '静神少虑，多晒太阳，收敛心神，避免情绪大起大落，安然度过三九寒天。',
    },
  },
  '大寒': {
    yi: '平补、保暖、养阴',
    ji: '过补、贪凉、急躁',
    items: {
      '起居': '早睡晚起以养阳气，居室常通风换气，注意足部保暖，洗浴水温不宜过高、时间不宜过长。',
      '饮食': '进补宜减量，转入平补，宜食糯米、红枣、山药，少食辛辣以防上火，为立春打底。',
      '运动': '运动前充分热身，宜散步、太极等舒缓运动，避免清晨过早外出锻炼。',
      '情志': '岁末诸事繁多，勿操劳过度，保持心境平和，从容辞旧迎新，静待春来。',
    },
  },
  '立春': {
    yi: '踏青、食辛甘、舒展筋骨',
    ji: '骤减衣物、动怒、熬夜',
    items: {
      '起居': '夜卧早起，广步于庭，舒展形体。春寒料峭，仍需「春捂」，不宜骤减衣物。',
      '饮食': '宜食辛甘发散之品，如韭菜、豆芽、春笋、萝卜，少酸多甘以养脾气。',
      '运动': '宜踏青、放风筝、缓步慢行，舒展筋骨，助阳气生发，忌剧烈运动。',
      '情志': '春属木，通于肝，戒怒养肝，保持心情舒畅，使精神如春日般欣欣向荣。',
    },
  },
  '雨水': {
    yi: '健脾祛湿、春捂、缓行',
    ji: '生冷、油腻、过早晨练',
    items: {
      '起居': '春寒未了，注意下肢保暖，居室防潮，睡前可顺时针摩腹，助脾胃运化。',
      '饮食': '健脾祛湿，宜食山药、薏米、莲子、红枣，少食油腻生冷，护好脾胃。',
      '运动': '宜慢跑、八段锦等温和运动，微微汗出为宜，晨练不宜过早，避清晨寒湿。',
      '情志': '肝气渐旺，宜舒缓情绪，听曲、品茶、莳花弄草，皆是养心怡情之方。',
    },
  },
  '惊蛰': {
    yi: '开窗通风、食梨、散步',
    ji: '辛辣、生气、懒卧',
    items: {
      '起居': '早睡早起，万物复苏，勤开窗通风，惊蛰后虫菌活跃，注意预防春季流行病。',
      '饮食': '饮食宜清淡，多食梨润肺、菠菜养肝，少酸多甘，忌辛辣刺激。',
      '运动': '春雷动而阳气升，宜户外散步、登山、放风筝，舒展身体，勿久坐久卧。',
      '情志': '疏肝理气，戒躁戒怒，与万物一同生发，保持舒展昂扬的精神面貌。',
    },
  },
  '春分': {
    yi: '踏青、放风筝、饮食均衡',
    ji: '过寒过热、偏食、熬夜',
    items: {
      '起居': '昼夜均分，宜早睡早起，注意随时增减衣物，谨防「倒春寒」。',
      '饮食': '阴阳平衡之时，饮食亦当寒热均衡，宜食时令春菜，忌过寒过热、偏嗜厚味。',
      '运动': '宜放风筝、踏青、打太极，舒展身姿，吐故纳新，与天地同步。',
      '情志': '心境平和，不偏不倚，正是调心养性的好时节，忌大喜大怒。',
    },
  },
  '清明': {
    yi: '踏青祭扫、食时令、登山',
    ji: '悲伤过度、淋雨、劳累',
    items: {
      '起居': '春和景明，宜踏青郊游，扫墓寄托哀思。花粉渐多，过敏者出行宜防护。',
      '饮食': '宜食青团、荠菜、香椿、菠菜等时令之物，清淡养肝，忌油腻发物。',
      '运动': '宜登山、郊游、放风筝，动而不累，微微汗出，使气血畅达。',
      '情志': '追思先人而不沉溺悲伤，哀而不伤，与亲友结伴同行，以自然之美抚慰心怀。',
    },
  },
  '谷雨': {
    yi: '祛湿、品新茶、赏花',
    ji: '湿冷、贪睡、暴食',
    items: {
      '起居': '雨水增多，防湿邪入体，居室通风除湿，早晚注意保暖，勿久处湿地。',
      '饮食': '健脾祛湿，宜食薏米、赤小豆、冬瓜、山药，饮谷雨新茶清火明目。',
      '运动': '宜慢跑、瑜伽、太极，微微汗出以排湿，避免淋雨受寒。',
      '情志': '春夏之交易生烦躁，宜静心养神，赏牡丹、品香茗，怡情悦性。',
    },
  },
  '立夏': {
    yi: '午休、食清淡、晨练',
    ji: '贪凉、大汗、动怒',
    items: {
      '起居': '夜卧早起，午间小憩以养心。天气转热，不宜贪凉露宿、久吹冷风。',
      '饮食': '清淡为主，宜食蛋、豆制品与时令蔬果，饮酸梅汤生津止渴，少油腻厚味。',
      '运动': '宜晨起锻炼，慢跑、游泳、八段锦皆宜，避免大汗淋漓、损伤心阳。',
      '情志': '夏气通于心，戒躁戒怒，静养心神，心平则气和，气和则身安。',
    },
  },
  '小满': {
    yi: '清热利湿、通风、缓动',
    ji: '生冷、暑热暴晒、烦躁',
    items: {
      '起居': '湿热渐盛，居室勤通风，勤换衣被，午后可小憩片刻以养精神。',
      '饮食': '清热利湿，宜食苦菜、黄瓜、绿豆、赤小豆，忌过食生冷伤及脾胃。',
      '运动': '宜清晨或傍晚运动，散步、太极皆宜，避开正午暑热，防中暑。',
      '情志': '防暑先防躁，保持心情舒畅，勿大喜大悲，静可生凉。',
    },
  },
  '芒种': {
    yi: '午休、祛湿、补水',
    ji: '久吹空调、急躁、厚味',
    items: {
      '起居': '昼长夜短，晚睡早起加午休。勤洗澡防暑湿，勿贪凉久吹空调风扇。',
      '饮食': '清淡祛湿，宜食青梅、冬瓜、扁豆、薏米，饮绿豆汤解暑，忌油腻厚味。',
      '运动': '宜温和运动，如散步、八段锦，大汗之后及时补水，勿立即冲凉。',
      '情志': '农忙心亦忙，宜静心调息，遇事勿急躁上火，忙中偷闲养心神。',
    },
  },
  '夏至': {
    yi: '午休、清补、静心',
    ji: '冰饮过量、暴晒、动怒',
    items: {
      '起居': '阳气最盛，宜晚睡早起，午间小憩。避暑纳凉有度，勿贪凉露宿。',
      '饮食': '清补为主，宜食面、瓜果、绿豆汤，忌冰饮过量、损伤脾胃之阳。',
      '运动': '宜游泳、清晨慢跑，运动之后忌立即冲凉，待汗收再沐浴。',
      '情志': '静以养心，可静坐、品茶、纳凉观星，「心静自然凉」是为至理。',
    },
  },
  '小暑': {
    yi: '尝新、游泳、饮茶',
    ji: '正午外出、油腻、烦躁',
    items: {
      '起居': '暑气渐盛，避免正午外出，居室通风，午后小憩养神，出汗后及时更衣。',
      '饮食': '宜「食新」尝新米，多食莲藕、绿豆、西瓜，多饮水，忌油腻厚味。',
      '运动': '宜早晚锻炼，游泳最宜，运动后注意补充水分与盐分。',
      '情志': '心静自然凉，忌烦躁动怒，宜读书、静坐，涵养心神。',
    },
  },
  '大暑': {
    yi: '解暑、补水、静养',
    ji: '高温作业、贪凉、劳累',
    items: {
      '起居': '一年最热，谨防中暑，居室注意降温通风，避免高温时段户外活动。',
      '饮食': '清热解暑，宜食绿豆、苦瓜、冬瓜、仙草，多饮温水，忌贪凉饮冷。',
      '运动': '宜游泳、早晚散步，运动量减半，注意防晒补水，量力而行。',
      '情志': '酷暑易心烦，宜静养，听琴、品茗、静坐皆可安心，安然度夏。',
    },
  },
  '立秋': {
    yi: '润燥、早卧早起、适度锻炼',
    ji: '贴膘过度、辛辣、悲秋',
    items: {
      '起居': '暑去凉来，早卧早起，适时增减衣物，谨防「秋老虎」反扑。',
      '饮食': '宜滋阴润燥，「贴秋膘」宜适度，多食梨、银耳、百合、蜂蜜，少辛辣。',
      '运动': '秋高气爽，宜登山、慢跑，运动量可逐渐加大，为秋冬蓄力。',
      '情志': '秋季养肺亦养心，宜收敛神气，勿生悲秋之感，乐观豁达。',
    },
  },
  '处暑': {
    yi: '养阴、食鸭、散步',
    ji: '贪凉露宿、辛辣、劳累',
    items: {
      '起居': '暑气渐止，昼夜温差加大，夜里注意腹部保暖，早睡早起，勿贪凉露宿。',
      '饮食': '润燥养阴，宜食鸭子、梨、蜂蜜、百合，少食辛辣，忌暴饮暴食。',
      '运动': '宜晨起散步、太极，运动后及时擦汗更衣，谨防感冒。',
      '情志': '秋意初显，宜平和从容，登高望远以舒胸怀，淡泊宁静。',
    },
  },
  '白露': {
    yi: '添衣、润肺、泡脚',
    ji: '赤膊贪凉、寒凉、晨雾出行',
    items: {
      '起居': '「白露身不露」，早晚添衣，勿赤膊贪凉，睡前温水泡脚，暖身安神。',
      '饮食': '润肺生津，宜食龙眼、梨、银耳、山药，饮白露茶，忌寒凉伤肺。',
      '运动': '宜慢跑、太极、登山，微微汗出，晨雾浓时减少外出，防呼吸道不适。',
      '情志': '秋思渐起，宜亲友相聚，品茶赏月，以人间温情暖清秋。',
    },
  },
  '秋分': {
    yi: '温润平补、登山、早睡',
    ji: '燥热、辛辣、熬夜',
    items: {
      '起居': '昼夜均而寒暑平，早睡早起，注意腹部与足部保暖，勿露腹露足。',
      '饮食': '温润平补，宜食山药、南瓜、秋梨、银耳，忌燥热辛辣，防秋燥。',
      '运动': '宜登山、慢跑、骑行，秋高气爽正是锻炼好时节，动而不疲。',
      '情志': '收敛神气，心平气和，赏秋色、观云霞，怡情养性。',
    },
  },
  '寒露': {
    yi: '足部保暖、登高、食芝麻',
    ji: '寒从脚起、熬夜、悲秋',
    items: {
      '起居': '露寒而凝，足部保暖最要紧，早睡以养阴，勿熬夜晚归，晨起护颈肩。',
      '饮食': '润肺益胃，宜食芝麻、蜂蜜、梨、菊花茶，少辛多酸，防秋燥。',
      '运动': '宜登高、散步、太极，晨练不宜太早，避开寒露湿气，动前先热身。',
      '情志': '深秋易悲秋，宜多晒太阳，与友登高谈笑，心怀暖意。',
    },
  },
  '霜降': {
    yi: '平补、赏红叶、泡脚',
    ji: '受寒、辛辣、大汗',
    items: {
      '起居': '初霜现身，昼夜温差大，注意保暖防寒，早卧早起，睡前泡脚驱寒。',
      '饮食': '平补为宜，宜食柿子、栗子、白萝卜、羊肉汤，忌辛辣，护胃养肺。',
      '运动': '宜慢跑、登山、八段锦，运动前充分热身，微微汗出即止。',
      '情志': '秋末易生萧瑟之感，宜赏红叶、与亲友团聚，暖意融融以慰秋心。',
    },
  },
  '立冬': {
    yi: '进补、早睡晚起、静养',
    ji: '熬夜、大汗、过补',
    items: {
      '起居': '冬藏之始，早睡晚起，待日光而出，注意背部与腹部保暖。',
      '饮食': '宜进补，食饺子、羊肉、萝卜，温而不燥，忌盲目过补、虚不受补。',
      '运动': '宜室内太极、八段锦，或午后散步，避免大汗淋漓、扰动阳气。',
      '情志': '闭藏神气，静养为要，少思虑、勿劳心，蓄积精神以待来年。',
    },
  },
  '小雪': {
    yi: '温补、泡脚、晒太阳',
    ji: '受寒、生冷、忧郁',
    items: {
      '起居': '天寒地冻将至，注意头部保暖，居室保暖与通风兼顾，睡前热水泡脚。',
      '饮食': '温补防寒，宜食牛羊肉、糍粑、黑芝麻、核桃，忌生冷伤阳。',
      '运动': '宜温和运动，午后阳光时散步、打太极，外出防寒防滑。',
      '情志': '冬日昼短易生低落，宜多晒太阳，亲友围炉闲话，暖身亦暖心。',
    },
  },
  '大雪': {
    yi: '温补养肾、室内锻炼、早睡',
    ji: '受寒、大汗、熬夜',
    items: {
      '起居': '隆冬封藏，早睡晚起，注意防寒保暖，居室保持适宜湿度，防燥防火。',
      '饮食': '温补养肾，宜食羊肉、红薯、萝卜、核桃，忌生冷，护脾胃。',
      '运动': '以室内锻炼为主，八段锦、太极皆宜，外出锻炼注意防滑防寒。',
      '情志': '静养心神，读书、听曲、围炉闲话，安度寒冬，蓄精养锐。',
    },
  },
  '冬至': {
    yi: '团圆、温补、静守',
    ji: '受寒、劳累、动怒',
    items: {
      '起居': '一阳初生，早睡晚起养阳气，注意保暖，可艾灸、泡脚，温养元阳。',
      '饮食': '北方饺子、南方汤圆，宜温补，羊肉、红枣、桂圆皆宜，忌生冷。',
      '运动': '宜缓慢运动，八段锦、散步皆可，避免大汗伤阳，动静有度。',
      '情志': '冬至大如年，阖家团圆，静心守岁，蓄势待春，安然度过最长之夜。',
    },
  },
};

/* ==================== 1-4. 节日 ==================== */

function nthWeekdayDate(y, month, weekday, n) {
  // y 年 month 月第 n 个 weekday（0 = 周日）
  const first = new Date(y, month - 1, 1);
  const firstW = first.getDay();
  const day = 1 + ((weekday - firstW + 7) % 7) + (n - 1) * 7;
  return new Date(y, month - 1, day);
}

const FESTIVALS = {
  lunar: [
    [1, 1, '春节', '中华民族最隆重的传统节日，农历新年的开始。春节源于上古时代的岁首祈年祭祀，承载着辞旧迎新、阖家团圆的美好祝愿，凝聚着中华文化的精华。习俗：贴春联、放鞭炮、拜年、发压岁钱、守岁。'],
    [1, 15, '元宵节', '农历新年第一个月圆之夜，又称上元节、灯节。正月十五闹元宵，赏灯猜谜，热闹非凡，是春节庆祝活动的尾声与高潮。习俗：赏花灯、猜灯谜、吃元宵（汤圆）。'],
    [2, 2, '龙抬头', '又称春耕节、青龙节。传说此日龙王抬头，行云布雨，春耕自此开始。民间有「二月二，龙抬头」的谚语。习俗：剃龙头（理发）、食龙须面等「龙食」、引龙回。'],
    [3, 3, '上巳节', '古时以三月上旬巳日为「上巳」，后定为三月初三。此日临水洗濯以祓除不祥，后演变为郊游踏青、曲水流觞的雅集之日。习俗：祓禊沐浴、踏青郊游、曲水流觞。'],
    [5, 5, '端午节', '五月初五，又称端阳节、龙舟节，中国首个入选世界非遗的节日。相传为纪念爱国诗人屈原，亦有驱疫辟邪之俗。习俗：赛龙舟、吃粽子、挂艾草菖蒲、佩香囊、饮雄黄酒。'],
    [7, 7, '七夕节', '七月初七，又称乞巧节、女儿节。源于牛郎织女的传说，此夜女子向织女乞求心灵手巧，如今被视作中国的「情人节」。习俗：乞巧、穿针引线、拜织女、观星。'],
    [7, 15, '中元节', '七月十五，又称盂兰盆节、鬼节。佛教与道教于此日祭祀亡灵，民间祭祖、放河灯，慎终追远。习俗：祭祖、烧纸钱、放河灯、做普度。'],
    [8, 15, '中秋节', '八月十五，又称团圆节，与春节、清明、端午并称四大传统节日。中秋月圆，人盼团圆，自古有赏月吟诗之俗。习俗：赏月、吃月饼、祭月、饮桂花酒。'],
    [9, 9, '重阳节', '九月初九，两九相重，故曰重阳。九九谐音「久久」，寓意长寿，1989 年被定为老人节。习俗：登高望远、插茱萸、赏菊、敬老。'],
    [10, 1, '寒衣节', '十月初一，又称十月朝、祭祖节。此日天气转寒，民间为逝去亲人焚烧纸衣，谓之「送寒衣」，与清明、中元并称三大鬼节。习俗：烧寒衣、祭祖、包饺子。'],
    [10, 15, '下元节', '十月十五，道教水官解厄之日，与上元、中元合称三元。此日民间祭祖祈福，祈求消灾解厄。习俗：祭祖、祈福、做糍粑。'],
    [12, 8, '腊八节', '腊月初八，古时腊祭与佛成道日相合而成。过了腊八就是年，此日喝腊八粥，年味自此渐浓。习俗：喝腊八粥、泡腊八蒜、祭祀。'],
    [12, 23, '小年（北方）', '腊月廿三（南方为廿四），又称祭灶节，是春节庆祝活动的序曲。此日送灶王爷上天言好事，之后开始扫尘备年。习俗：祭灶、吃糖瓜、扫尘。'],
    [12, 24, '小年（南方）', '腊月廿四，南方部分地区过小年，祭灶扫尘、备办年货，年味自此渐浓。习俗：祭灶、扫尘、做年糕。'],
  ],
  solar: [
    [1, 1, '元旦', '公历新年第一天，即「初始之日」。古代元旦指正月初一，辛亥革命后改行公历，始以 1 月 1 日为元旦。习俗：跨年庆祝、放假迎新。'],
    [2, 14, '情人节', '西方传统节日，又称圣瓦伦丁节，如今已成为世界各地情侣互赠礼物、表达爱意的日子。习俗：互赠鲜花、巧克力、共度浪漫时光。'],
    [3, 8, '妇女节', '国际劳动妇女节，纪念各国妇女百余年来争取和平、平等与发展的斗争。习俗：致敬女性、赠送礼物。'],
    [3, 12, '植树节', '为倡导植树造林而设立的节日，纪念孙中山先生逝世之日（3 月 12 日）。习俗：植树造林、绿化家园。'],
    [5, 1, '劳动节', '国际劳动节，全世界劳动者的共同节日，纪念劳动者争取权益的斗争。习俗：放假休息、表彰劳动模范。'],
    [5, 4, '青年节', '纪念 1919 年五四爱国运动而设立的节日，五四精神核心为「爱国、进步、民主、科学」。习俗：青年活动、纪念表彰。'],
    [6, 1, '儿童节', '国际儿童节，为保障儿童权益、纪念二战中受难儿童而设立。习俗：亲子活动、赠送礼物。'],
    [7, 1, '建党节', '中国共产党建党纪念日。1921 年 7 月，中国共产党第一次全国代表大会召开，中国革命面貌自此焕然一新。习俗：纪念活动、红色教育。'],
    [8, 1, '建军节', '中国人民解放军建军纪念日，纪念 1927 年 8 月 1 日南昌起义。习俗：拥军爱民、纪念活动。'],
    [9, 10, '教师节', '为尊师重教而设立的节日，感念师恩、致敬园丁。习俗：送花祝福、慰问教师。'],
    [10, 1, '国庆节', '中华人民共和国成立纪念日。1949 年 10 月 1 日，开国大典在天安门广场举行，新中国宣告成立。习俗：升国旗、阅兵、庆典、放假出游。'],
    [12, 25, '圣诞节', '西方传统节日，纪念耶稣诞生，如今已是全球性的节日。习俗：装饰圣诞树、互赠礼物、圣诞大餐。'],
  ],
  floating: [
    { name: '母亲节', calc: (y) => nthWeekdayDate(y, 5, 0, 2), desc: '每年 5 月的第二个星期日，感谢母亲的养育之恩，源于美国安娜·贾维斯的倡议，现已风靡全球。习俗：赠送康乃馨、陪伴母亲。' },
    { name: '父亲节', calc: (y) => nthWeekdayDate(y, 6, 0, 3), desc: '每年 6 月的第三个星期日，感恩父爱的节日，与母亲节相呼应。习俗：赠送礼物、陪伴父亲。' },
  ],
};

const FEST_DESC_QINGMING = '既是二十四节气之一，也是慎终追远的传统节日，又称踏青节、祭祖节。此时春和景明，人们扫墓祭祖、郊游踏青，追思先人、亲近自然。习俗：扫墓、踏青、放风筝、插柳。';
const FEST_DESC_CHUXI = '岁末最后一夜，旧岁至此而除，明日另换新岁。游子归乡，阖家团聚，是中国人最重要的团圆时刻。习俗：吃年夜饭、贴春联、守岁、发压岁钱。';

/* 'YYYY-MM-DD' → 节日列表（页面加载时一次性建好，覆盖 1900-2101） */
const FEST_MAP = new Map();
/* 'YYYY-MM-DD' → 节气名（供月历标记节气日） */
const TERM_MAP = new Map();

function buildCalendars() {
  for (let y = 1900; y <= 2101; y++) {
    // 农历节日
    for (const [m, d, name, desc] of FESTIVALS.lunar) {
      const t = lunarToSolar(y, m, d, false);
      if (!t) continue;
      const key = fmtDate(t);
      if (!FEST_MAP.has(key)) FEST_MAP.set(key, []);
      FEST_MAP.get(key).push({ name, desc, kind: '农历' });
    }
    // 除夕 = 腊月最后一天
    {
      const t = lunarToSolar(y, 12, monthDaysOf(y, 12), false);
      const key = fmtDate(t);
      if (!FEST_MAP.has(key)) FEST_MAP.set(key, []);
      FEST_MAP.get(key).push({ name: '除夕', desc: FEST_DESC_CHUXI, kind: '农历' });
    }
    // 公历节日
    for (const [m, d, name, desc] of FESTIVALS.solar) {
      const key = y + '-' + pad(m) + '-' + pad(d);
      if (!FEST_MAP.has(key)) FEST_MAP.set(key, []);
      FEST_MAP.get(key).push({ name, desc, kind: '公历' });
    }
    // 浮动节日（母亲节 / 父亲节）
    for (const f of FESTIVALS.floating) {
      const key = fmtDate(f.calc(y));
      if (!FEST_MAP.has(key)) FEST_MAP.set(key, []);
      FEST_MAP.get(key).push({ name: f.name, desc: f.desc, kind: '公历' });
    }
    // 清明（节气日，公历日期随年份变动）
    {
      const key = fmtDate(termDateOf(y, 6));
      if (!FEST_MAP.has(key)) FEST_MAP.set(key, []);
      FEST_MAP.get(key).push({ name: '清明节', desc: FEST_DESC_QINGMING, kind: '节气' });
    }
  }
  for (let y = 1900; y <= 2101; y++) {
    for (let n = 0; n < 24; n++) {
      TERM_MAP.set(fmtDate(termDateOf(y, n)), SOLAR_TERMS[n]);
    }
  }
}

/* 某日期之后（含当日）最近的节日列表，最多取 3 个 */
function upcomingFestivals(date) {
  const out = [];
  const t0 = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  for (let i = 0; i <= 370 && out.length < 3; i++) {
    const d = new Date(t0 + i * 86400000);
    const list = FEST_MAP.get(fmtDate(d));
    if (list) {
      for (const f of list) {
        out.push({ name: f.name, desc: f.desc, kind: f.kind, days: i, date: fmtDate(d) });
      }
    }
  }
  return out;
}

/* ==================== 1-5. 工具 ==================== */

function pad(n) {
  return String(n).padStart(2, '0');
}

function fmtDate(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function fmtShort(dateStr) {
  const [, m, d] = dateStr.split('-');
  return Number(m) + '月' + Number(d) + '日';
}

/* 允许在 Node 里单独测试换算逻辑（浏览器中自动跳过） */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { solarToLunar, lunarToSolar, ganzhiOf, zodiacOf, shichenOf, formatLunar, dayGanzhiOf, termDateOf, termsAround, upcomingFestivals, FEST_MAP, buildCalendars, fmtDate };
}

/* ==================== 2. 水墨背景画 ==================== */

/* 六幅程序绘制的水墨画，按「隔日」轮换：第 1、2 天第一幅，第 3、4 天第二幅……
   以今日是今年的第几天除以 2 取整，再对幅数取余 */

const PAINT_DEFS = `
  <linearGradient id="gSkyWarm" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#faf5e8"/>
    <stop offset="1" stop-color="#efe6cf"/>
  </linearGradient>
  <radialGradient id="gSun">
    <stop offset="0" stop-color="#d29a72" stop-opacity="0.95"/>
    <stop offset="0.55" stop-color="#d29a72" stop-opacity="0.4"/>
    <stop offset="1" stop-color="#d29a72" stop-opacity="0"/>
  </radialGradient>
  <filter id="fRough" x="-15%" y="-15%" width="130%" height="130%">
    <feTurbulence type="fractalNoise" baseFrequency="0.04 0.14" numOctaves="2" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="7"/>
  </filter>
  <filter id="fBlurL" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="16"/></filter>
  <filter id="fBlurM" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7"/></filter>
  <filter id="fBlurS" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.5"/></filter>
`;

function paintSvg(inner) {
  return `<svg class="paint" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs>${PAINT_DEFS}</defs>${inner}</svg>`;
}

/* 梅花一朵 */
function plumFlower(x, y, s, o) {
  let g = `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}">`;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    g += `<circle cx="${(Math.cos(a) * 8).toFixed(1)}" cy="${(Math.sin(a) * 8).toFixed(1)}" r="6.5" fill="#b0442e"/>`;
  }
  g += `<circle r="3.4" fill="#7a5a2e"/></g>`;
  return g;
}

/* 竹叶一片 */
function bambooLeaf(x, y, rot, s, o) {
  return `<path d="M0 0 C ${16 * s} ${-13 * s} ${34 * s} ${-12 * s} ${46 * s} ${-3 * s} C ${30 * s} ${6 * s} ${14 * s} ${8 * s} 0 0 Z" transform="translate(${x} ${y}) rotate(${rot})" fill="#3a4330" opacity="${o}"/>`;
}

/* 飞鸟 */
function bird(x, y, s, o) {
  return `<path d="M${x} ${y} q ${13 * s} ${-15 * s} ${26 * s} 0 q ${13 * s} ${-15 * s} ${26 * s} 0" stroke="#45423a" fill="none" stroke-width="${3 * s}" stroke-linecap="round" opacity="${o}"/>`;
}

/* 1. 远山叠翠 */
function paintYuanShan() {
  return paintSvg(`
    <rect width="1600" height="900" fill="url(#gSkyWarm)"/>
    <circle cx="1170" cy="235" r="95" fill="url(#gSun)"/>
    <g fill="#47443a">
      <path d="M-40 560 Q180 380 400 470 T820 440 T1240 470 T1680 420 L1680 900 L-40 900 Z" opacity="0.13" filter="url(#fBlurL)"/>
      <path d="M-40 640 Q220 470 520 560 T1020 520 T1680 570 L1680 900 L-40 900 Z" opacity="0.2" filter="url(#fBlurM)"/>
    </g>
    <g fill="#3c3931">
      <path d="M-40 760 Q260 590 600 690 T1200 640 T1680 700 L1680 900 L-40 900 Z" opacity="0.36" filter="url(#fBlurS)"/>
      <path d="M-40 830 Q300 700 700 780 T1680 760 L1680 900 L-40 900 Z" opacity="0.46"/>
    </g>
    <g filter="url(#fBlurL)">
      <rect x="120" y="590" width="820" height="120" fill="#f7f1e2" opacity="0.6"/>
      <rect x="880" y="640" width="700" height="110" fill="#f7f1e2" opacity="0.52"/>
    </g>
    <g stroke="#3f3b33" fill="none" stroke-linecap="round" filter="url(#fRough)">
      <path d="M1430 900 C1430 800 1418 730 1390 640" stroke-width="11" opacity="0.85"/>
      <path d="M1405 710 C1360 690 1330 672 1295 645" stroke-width="5" opacity="0.7"/>
      <path d="M1400 760 C1350 740 1315 715 1290 685" stroke-width="4" opacity="0.6"/>
      <g stroke-width="3" opacity="0.75">
        <path d="M1295 645 q-16 -14 -6 -30 M1295 645 q-4 -20 12 -28 M1295 645 q8 -18 26 -18 M1295 645 q20 -10 30 4 M1295 645 q26 -2 30 12"/>
        <path d="M1290 685 q-16 -12 -8 -28 M1290 685 q-2 -18 14 -26 M1290 685 q10 -16 26 -14 M1290 685 q20 -8 28 6 M1290 685 q24 2 28 14"/>
      </g>
      <path d="M1395 860 C1345 845 1300 830 1260 800" stroke-width="3.5" opacity="0.55"/>
    </g>
    ${bird(330, 190, 1, 0.8)}
    ${bird(430, 140, 0.75, 0.7)}
    ${bird(520, 240, 0.65, 0.65)}
  `);
}

/* 2. 寒梅映月 */
function paintHanMei() {
  const flowers = [
    [640, 420, 1.15, 0.9], [700, 300, 1, 0.85], [740, 360, 0.8, 0.8], [560, 470, 1, 0.85],
    [460, 540, 0.85, 0.8], [400, 590, 0.7, 0.75], [330, 630, 0.6, 0.7], [260, 665, 0.5, 0.65],
    [620, 350, 0.6, 0.7], [520, 410, 0.55, 0.65],
  ];
  const buds = [[680, 260], [760, 320], [490, 520], [370, 610], [300, 655]];
  return paintSvg(`
    <rect width="1600" height="900" fill="url(#gSkyWarm)"/>
    <g filter="url(#fBlurL)"><circle cx="1150" cy="215" r="150" fill="#efe6cf" opacity="0.5"/></g>
    <circle cx="1150" cy="215" r="105" fill="#f2e9d3"/>
    <circle cx="1120" cy="195" r="10" fill="#e3d7ba" opacity="0.7"/>
    <circle cx="1180" cy="240" r="7" fill="#e3d7ba" opacity="0.6"/>
    <g stroke="#2f2b25" fill="none" stroke-linecap="round" filter="url(#fRough)">
      <path d="M-30 800 C260 770 400 660 530 540 C590 486 650 430 710 335" stroke-width="17" opacity="0.88"/>
      <path d="M350 660 C420 620 470 590 530 560" stroke-width="6" opacity="0.72"/>
      <path d="M430 625 C500 640 570 650 650 638" stroke-width="5" opacity="0.66"/>
      <path d="M550 505 C630 490 700 495 770 525" stroke-width="4" opacity="0.6"/>
      <path d="M600 450 C640 415 660 385 668 352" stroke-width="4" opacity="0.6"/>
    </g>
    ${flowers.map((f) => plumFlower(...f)).join('')}
    ${buds.map((b) => `<circle cx="${b[0]}" cy="${b[1]}" r="5" fill="#a63a2a" opacity="0.8"/>`).join('')}
    <g fill="#4a463d" opacity="0.5">
      <circle cx="1470" cy="820" r="3"/><circle cx="1492" cy="808" r="2.5"/><circle cx="1452" cy="800" r="2"/>
    </g>
  `);
}

/* 3. 竹影清风 */
function paintZhuYing() {
  let g = '';
  const stalks = [
    [150, 10, 760, 0.75], [260, 13, 860, 0.6], [420, 8, 700, 0.8], [560, 12, 820, 0.55],
    [690, 6, 620, 0.7], [880, 10, 760, 0.5], [1240, 8, 680, 0.65], [1420, 12, 800, 0.5],
  ];
  for (const [x, w, h, o] of stalks) {
    const topX = x + (x % 23) - 8;
    g += `<path d="M${x} 920 C ${x - 16} ${920 - h * 0.45} ${x + 18} ${920 - h * 0.72} ${topX} ${920 - h}" stroke="#39422f" stroke-width="${w}" fill="none" opacity="${o}" stroke-linecap="round"/>`;
    for (let i = 1; i < Math.floor(h / 130); i++) {
      const yy = 920 - i * 130 - ((i * i) % 18);
      g += `<path d="M${x - 2 - w * 0.55} ${yy} q ${w * 0.55 + 2} 3 ${(w * 1.1 + 4)} 0" stroke="#2f3626" stroke-width="3" fill="none" opacity="${Math.min(1, o + 0.15)}"/>`;
      if (i % 2 === 1) {
        g += bambooLeaf(x - w * 0.5, yy - 8, -35, 0.9, o)
          + bambooLeaf(x - w * 0.5, yy - 20, -70, 0.7, o)
          + bambooLeaf(x + w * 0.5, yy - 4, 145, 0.9, o)
          + bambooLeaf(x + w * 0.5, yy - 16, 110, 0.7, o);
      }
    }
  }
  return paintSvg(`
    <rect width="1600" height="900" fill="url(#gSkyWarm)"/>
    <g filter="url(#fRough)">${g}</g>
    <ellipse cx="1040" cy="905" rx="260" ry="55" fill="#4a453c" opacity="0.4" filter="url(#fBlurS)"/>
    <ellipse cx="1040" cy="895" rx="210" ry="40" fill="#4a453c" opacity="0.5"/>
    ${bird(330, 160, 0.85, 0.6)}
  `);
}

/* 4. 孤舟蓑笠 */
function paintGuZhou() {
  return paintSvg(`
    <rect width="1600" height="900" fill="url(#gSkyWarm)"/>
    <g fill="#49463c">
      <path d="M-40 430 Q300 250 640 400 T1240 380 T1680 340 L1680 900 L-40 900 Z" opacity="0.12" filter="url(#fBlurL)"/>
      <path d="M-40 520 Q360 360 760 480 T1680 460 L1680 900 L-40 900 Z" opacity="0.18" filter="url(#fBlurM)"/>
    </g>
    <g filter="url(#fBlurL)"><rect x="80" y="430" width="900" height="90" fill="#f7f1e2" opacity="0.55"/></g>
    <g stroke="#4a463c" fill="none" stroke-width="2.5" opacity="0.22" stroke-linecap="round">
      <path d="M60 640 q60 7 120 0 t120 0"/>
      <path d="M420 660 q60 7 120 0 t120 0"/>
      <path d="M980 600 q60 7 120 0 t120 0"/>
      <path d="M1080 660 q60 7 120 0 t120 0"/>
      <path d="M560 720 q70 8 140 0 t140 0"/>
      <path d="M1200 740 q70 8 140 0 t140 0"/>
      <path d="M180 780 q70 8 140 0 t140 0"/>
      <path d="M900 800 q70 8 140 0 t140 0"/>
    </g>
    <g filter="url(#fRough)">
      <path d="M480 700 L760 700 L735 748 L512 748 Z" fill="#332f28" opacity="0.9"/>
      <path d="M520 748 C600 738 690 736 735 748 Z" fill="#232019"/>
      <circle cx="640" cy="664" r="13" fill="#3a352c"/>
      <path d="M600 660 L682 660 L660 640 Q640 630 620 640 Z" fill="#4c463a"/>
      <path d="M640 677 C638 690 636 696 634 706" stroke="#3a352c" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M634 706 C626 714 616 716 604 714" stroke="#3a352c" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M700 690 L760 850" stroke="#332f28" stroke-width="4" fill="none"/>
    </g>
    <g stroke="#3c382f" fill="none" stroke-linecap="round" opacity="0.75" filter="url(#fRough)">
      <path d="M1050 900 C1055 820 1058 780 1070 730" stroke-width="5"/>
      <path d="M1120 900 C1122 830 1120 795 1108 755" stroke-width="4"/>
      <path d="M1180 900 C1184 840 1190 810 1200 775" stroke-width="4"/>
      <path d="M1230 900 C1228 850 1225 820 1218 790" stroke-width="3"/>
    </g>
    <g fill="#3c382f" opacity="0.8">
      <ellipse cx="1070" cy="722" rx="7" ry="14" transform="rotate(-12 1070 722)"/>
      <ellipse cx="1108" cy="748" rx="6" ry="12" transform="rotate(8 1108 748)"/>
      <ellipse cx="1200" cy="768" rx="6" ry="12" transform="rotate(-8 1200 768)"/>
      <ellipse cx="1218" cy="783" rx="5" ry="10" transform="rotate(6 1218 783)"/>
    </g>
  `);
}

/* 5. 山间飞瀑 */
function paintFeiPu() {
  return paintSvg(`
    <rect width="1600" height="900" fill="url(#gSkyWarm)"/>
    <g filter="url(#fBlurL)"><circle cx="700" cy="240" r="90" fill="#e8dcc2" opacity="0.8"/></g>
    <g fill="#3e3a31" filter="url(#fRough)">
      <path d="M-40 900 L-40 470 Q160 430 300 500 Q420 560 470 900 Z" opacity="0.5"/>
      <path d="M1680 900 L1680 420 Q1500 380 1360 460 Q1240 530 1180 900 Z" opacity="0.5"/>
      <path d="M-40 640 Q200 560 400 640 Q520 690 560 900 L-40 900 Z" opacity="0.3"/>
      <path d="M1680 620 Q1460 540 1300 620 Q1220 660 1180 900 L1680 900 Z" opacity="0.3"/>
    </g>
    <g filter="url(#fBlurS)">
      <path d="M700 470 C690 560 700 640 690 720 C685 760 690 800 680 900" stroke="#f6f0e2" stroke-width="34" fill="none" opacity="0.8" stroke-linecap="round"/>
      <path d="M755 500 C745 570 752 620 746 700 C742 760 748 810 740 900" stroke="#f6f0e2" stroke-width="16" fill="none" opacity="0.6" stroke-linecap="round"/>
    </g>
    <g filter="url(#fBlurL)">
      <ellipse cx="720" cy="850" rx="240" ry="70" fill="#f7f1e2" opacity="0.65"/>
    </g>
    <g stroke="#3a362c" fill="none" stroke-linecap="round" filter="url(#fRough)">
      <path d="M340 460 C350 400 380 370 430 350" stroke-width="9" opacity="0.85"/>
      <g stroke-width="3" opacity="0.7">
        <path d="M430 350 q-16 -14 -6 -30 M430 350 q-4 -20 12 -28 M430 350 q8 -18 26 -18 M430 350 q20 -10 30 4"/>
        <path d="M390 380 q-14 -12 -6 -26 M390 380 q-2 -16 12 -22 M390 380 q10 -14 24 -12"/>
      </g>
    </g>
    ${bird(1050, 260, 1, 0.8)}
    ${bird(1140, 220, 0.75, 0.7)}
  `);
}

/* 6. 荷塘清趣 */
function paintHeTang() {
  const leafP = (x, y, r, rot, o) => `<g transform="translate(${x} ${y}) rotate(${rot})" opacity="${o}">
    <path d="M0 0 L ${-r * 0.95} ${-r * 0.3} A ${r} ${r * 0.32} 0 1 0 ${r * 0.95} ${-r * 0.3} Z" fill="#414a37"/>
    <path d="M0 0 L ${-r * 0.95} ${-r * 0.3}" stroke="#2f3626" stroke-width="2.5" fill="none"/>
    <g stroke="#2f3626" stroke-width="1.6" opacity="0.7">
      <path d="M0 0 L ${-r * 0.35} ${-r * 0.3}"/>
      <path d="M0 0 L ${r * 0.35} ${-r * 0.3}"/>
      <path d="M0 0 L ${-r * 0.75} ${-r * 0.15}"/>
      <path d="M0 0 L ${r * 0.75} ${-r * 0.15}"/>
    </g></g>`;
  const lotus = (x, y, s, o) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}">
    <path d="M0 0 C-14 -26 -22 -58 -8 -78 C2 -60 2 -34 0 0 Z" fill="#d9a89b"/>
    <path d="M0 0 C-2 -30 4 -60 18 -76 C16 -50 12 -28 0 0 Z" fill="#d9a89b"/>
    <path d="M0 0 C12 -28 20 -54 10 -74 C4 -52 -2 -30 0 0 Z" fill="#e3b8ab"/>
    <path d="M0 0 C26 -20 40 -40 30 -60 C18 -42 6 -24 0 0 Z" fill="#e9c4b6"/>
    <path d="M0 0 C-24 -18 -36 -36 -28 -54 C-14 -38 -4 -20 0 0 Z" fill="#e9c4b6"/>
    <circle r="5" fill="#c98f6b"/></g>`;
  return paintSvg(`
    <rect width="1600" height="900" fill="url(#gSkyWarm)"/>
    <g filter="url(#fRough)">
      ${leafP(400, 760, 150, -8, 0.85)}
      ${leafP(680, 800, 190, 4, 0.7)}
      ${leafP(1050, 750, 170, -5, 0.8)}
      ${leafP(1330, 800, 130, 10, 0.6)}
      ${leafP(220, 850, 110, 12, 0.5)}
      <g stroke="#39422f" stroke-width="5" fill="none" opacity="0.7">
        <path d="M420 760 C415 690 425 640 450 590"/>
        <path d="M680 800 C685 720 675 660 660 610"/>
      </g>
      ${lotus(450, 585, 1.15, 0.9)}
      ${lotus(662, 605, 0.9, 0.8)}
      <g transform="translate(880 560)" opacity="0.85">
        <path d="M0 0 L42 10" stroke="#3a352c" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="4" fill="#3a352c"/>
        <ellipse cx="12" cy="-2" rx="16" ry="5" fill="#8fa3a8" opacity="0.6" transform="rotate(-18 12 -2)"/>
        <ellipse cx="12" cy="2" rx="16" ry="5" fill="#8fa3a8" opacity="0.6" transform="rotate(18 12 2)"/>
        <ellipse cx="28" cy="2" rx="13" ry="4" fill="#8fa3a8" opacity="0.5" transform="rotate(16 28 2)"/>
        <ellipse cx="28" cy="9" rx="13" ry="4" fill="#8fa3a8" opacity="0.5" transform="rotate(-16 28 9)"/>
      </g>
    </g>
    <g stroke="#4a463c" fill="none" stroke-width="2" opacity="0.2" stroke-linecap="round">
      <path d="M120 640 q60 6 120 0 t120 0"/>
      <path d="M700 560 q60 6 120 0 t120 0"/>
      <path d="M1180 620 q60 6 120 0 t120 0"/>
    </g>
  `);
}

const PAINTINGS = [
  { name: '远山叠翠', build: paintYuanShan },
  { name: '寒梅映月', build: paintHanMei },
  { name: '竹影清风', build: paintZhuYing },
  { name: '孤舟蓑笠', build: paintGuZhou },
  { name: '山间飞瀑', build: paintFeiPu },
  { name: '荷塘清趣', build: paintHeTang },
];

/* 隔日一换：今天是今年的第几天 ÷ 2 取整，再对幅数取余 */
function paintingIndexFor(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const doy = Math.floor((date - start) / 86400000);
  return Math.floor(doy / 2) % PAINTINGS.length;
}

/* ==================== 3. 页面交互 ==================== */

if (typeof document !== 'undefined') {

  /* ---- 获取元素 ---- */
  const dateInput   = document.getElementById('dateInput');
  const timeInput   = document.getElementById('timeInput');
  const queryBtn    = document.getElementById('queryBtn');
  const todayBtn    = document.getElementById('todayBtn');
  const calBtn      = document.getElementById('calBtn');
  const copyBtn     = document.getElementById('copyBtn');
  const result      = document.getElementById('result');
  const weekdayEl   = document.getElementById('weekday');
  const lunarEl     = document.getElementById('lunar');
  const chipYearGz  = document.getElementById('chipYearGanzhi');
  const chipDayGz   = document.getElementById('chipDayGanzhi');
  const chipZodiac  = document.getElementById('chipZodiac');
  const chipShichen = document.getElementById('chipShichen');
  const chipOffset  = document.getElementById('chipOffset');
  const markNoteEl  = document.getElementById('markNote');
  const termCard    = document.getElementById('termCard');
  const termName    = document.getElementById('termName');
  const termSub     = document.getElementById('termSub');
  const festCard    = document.getElementById('festCard');
  const festName    = document.getElementById('festName');
  const festSub     = document.getElementById('festSub');
  const festToday   = document.getElementById('festToday');
  const festMore    = document.getElementById('festMore');
  const yangCard    = document.getElementById('yangCard');
  const yangName    = document.getElementById('yangName');
  const yangSub     = document.getElementById('yangSub');
  const markCard    = document.getElementById('markCard');
  const markBody    = document.getElementById('markBody');
  const clockTimeEl = document.getElementById('clockTime');
  const clockDateEl = document.getElementById('clockDate');
  const inkBg       = document.getElementById('inkBg');
  const bgHint      = document.getElementById('bgHint');
  const sealBtn     = document.getElementById('sealBtn');
  const calModal    = document.getElementById('calModal');
  const detailModal = document.getElementById('detailModal');
  const calGrid     = document.getElementById('calGrid');
  const calLunarT   = document.getElementById('calLunarTitle');
  const calSolarT   = document.getElementById('calSolarTitle');
  const calPrev     = document.getElementById('calPrev');
  const calNext     = document.getElementById('calNext');
  const calTodayBtn = document.getElementById('calTodayBtn');
  const calSelInfo  = document.getElementById('calSelInfo');
  const markInput   = document.getElementById('markInput');
  const markAddBtn  = document.getElementById('markAddBtn');
  const markDelBtn  = document.getElementById('markDelBtn');
  const calLegend   = document.getElementById('calLegend');
  const detailTitle = document.getElementById('detailTitle');
  const detailMeta  = document.getElementById('detailMeta');
  const detailBody  = document.getElementById('detailBody');
  const userBtn     = document.getElementById('userBtn');
  const userModal   = document.getElementById('userModal');
  const userClose   = document.getElementById('userClose');
  const userInput   = document.getElementById('userInput');
  const userRegBtn  = document.getElementById('userRegBtn');
  const userErr     = document.getElementById('userErr');
  const userNow     = document.getElementById('userNow');
  const userList    = document.getElementById('userList');
  const userListTitle = document.getElementById('userListTitle');
  const eventList     = document.getElementById('eventList');
  const eventListTitle = document.getElementById('eventListTitle');

  /* ---- 状态 ---- */
  let weekModeShort = false;   // false = 星期一，true = 周一
  let lastResultText = '';     // 复制用的汇总文本
  let state = null;            // 当前查询结果（供详情弹窗使用）
  let bgOverride = null;       // 手动换画（随名号保存）
  let calView = { y: new Date().getFullYear(), m: new Date().getMonth() };

  /* 印记等数据随「名号」保存，见下方名号存储区 */
  let marks = {};

  const MIN_DATE = new Date(1900, 0, 31);
  const MAX_DATE = new Date(2100, 11, 31);

  function saveMarks() {
    if (userData) {
      userData.marks = marks;
      saveUserData();
    }
  }

  /* ---- 名号（用户）存储：注册 / 切换 / 事件记录 ---- */
  const USERS_KEY = 'suishiji.users';
  const CUR_USER_KEY = 'suishiji.currentUser';
  const LEGACY_MARKS_KEY = 'suishiji.marks';
  const MAX_EVENTS = 300;

  let users = [];          // 全部名号（不可重复）
  let currentUser = null;  // 当前名号
  let userData = null;     // 当前名号的数据 { name, created, marks, events, lastDate, lastTime, weekMode, bgOverride }
  let userLocked = false;  // 首访时的入册弹窗不可关闭

  function loadUsers() {
    try { users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { users = []; }
  }

  function saveUsers() {
    try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch {}
  }

  function userDataKey(name) {
    return 'suishiji.user.' + name;
  }

  function loadUserData(name) {
    try {
      const raw = localStorage.getItem(userDataKey(name));
      if (raw) {
        const d = JSON.parse(raw);
        d.marks = d.marks || {};
        d.events = d.events || [];
        return d;
      }
    } catch {}
    return {
      name,
      created: Date.now(),
      marks: {},
      events: [],
      lastDate: null,
      lastTime: null,
      weekMode: false,
      bgOverride: null,
    };
  }

  function saveUserData() {
    if (!userData) return;
    try { localStorage.setItem(userDataKey(userData.name), JSON.stringify(userData)); } catch {}
  }

  /* 记录一名用户的所行之事（事件日志） */
  function logEvent(act) {
    if (!userData) return;
    const now = new Date();
    userData.events.push({
      t: `${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
      act,
    });
    if (userData.events.length > MAX_EVENTS) {
      userData.events.splice(0, userData.events.length - MAX_EVENTS);
    }
    saveUserData();
  }

  /* 恢复该名号的选择与印记（不是每次都是新界面） */
  function applyUserData() {
    marks = userData.marks || {};
    weekModeShort = !!userData.weekMode;
    bgOverride = (userData.bgOverride === undefined || userData.bgOverride === null)
      ? null : userData.bgOverride;
    if (userData.lastDate && /^\d{4}-\d{2}-\d{2}$/.test(userData.lastDate)) {
      dateInput.value = userData.lastDate;
    }
    if (userData.lastTime && /^\d{2}:\d{2}$/.test(userData.lastTime)) {
      timeInput.value = userData.lastTime;
    }
  }

  /* 以某个名号登入 */
  function enterUser(name) {
    currentUser = name;
    try { localStorage.setItem(CUR_USER_KEY, name); } catch {}
    userData = loadUserData(name);
    applyUserData();
    userBtn.textContent = '名号 · ' + name;
    renderPainting();
    render();
  }

  /* 注册新名号：不可为空、不可重复 */
  function registerUser() {
    const name = userInput.value.trim();
    if (!name) { userErr.textContent = '名号不可为空'; return; }
    if (name.length > 12) { userErr.textContent = '名号过长（最多 12 字）'; return; }
    if (users.includes(name)) { userErr.textContent = '此名号已有人用了，换一个吧'; return; }

    // 首名入册时，承接旧版本留下的无主印记
    const legacy = localStorage.getItem(LEGACY_MARKS_KEY);
    const d = loadUserData(name);
    if (legacy && users.length === 0) {
      try { d.marks = { ...d.marks, ...JSON.parse(legacy) }; } catch {}
      try { localStorage.removeItem(LEGACY_MARKS_KEY); } catch {}
    }

    users.push(name);
    saveUsers();
    userData = d;
    currentUser = name;
    try { localStorage.setItem(CUR_USER_KEY, name); } catch {}
    logEvent('入册');
    applyUserData();

    userLocked = false;
    userClose.hidden = false;
    userModal.hidden = true;
    userBtn.textContent = '名号 · ' + name;
    renderPainting();
    render();
  }

  /* 渲染名号弹窗内容 */
  function renderUserModal() {
    userNow.textContent = currentUser ? `当前名号 · ${currentUser}` : '尚未入册，请取名号';
    userErr.textContent = '';
    userInput.value = '';

    userListTitle.textContent = `已有名号（${users.length}）`;
    userList.innerHTML = '';
    if (!users.length) {
      const empty = document.createElement('div');
      empty.className = 'event-item';
      empty.textContent = '尚无他人名号，入册后名号将长留此页';
      userList.appendChild(empty);
    } else {
      for (const u of users) {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'user-row' + (u === currentUser ? ' current' : '');
        const nm = document.createElement('span');
        nm.className = 'user-name';
        nm.textContent = u;
        const tag = document.createElement('span');
        tag.className = 'user-tag';
        tag.textContent = u === currentUser ? '当前' : '进入 ›';
        row.append(nm, tag);
        row.addEventListener('click', () => {
          if (u === currentUser) return;
          userLocked = false;
          userClose.hidden = false;
          enterUser(u);
          renderUserModal();
        });
        userList.appendChild(row);
      }
    }

    const evs = userData ? userData.events : [];
    eventListTitle.textContent = `所行之事（共 ${evs.length} 条）`;
    eventList.innerHTML = '';
    if (!evs.length) {
      const empty = document.createElement('div');
      empty.className = 'event-item';
      empty.textContent = '暂无记录';
      eventList.appendChild(empty);
    } else {
      for (const ev of [...evs].reverse().slice(0, 30)) {
        const item = document.createElement('div');
        item.className = 'event-item';
        const t = document.createElement('span');
        t.className = 'event-time';
        t.textContent = ev.t;
        const a = document.createElement('span');
        a.textContent = ev.act;
        item.append(t, a);
        eventList.appendChild(item);
      }
    }
  }

  /* 印记按日期排序 */
  function sortedMarks() {
    return Object.entries(marks)
      .map(([date, note]) => ({ date, note }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /* 距今天数（今天 = 0，未来为正，过去为负） */
  function daysFromToday(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = dateStr.split('-').map(Number);
    return Math.round((new Date(y, m - 1, d).getTime() - today.getTime()) / 86400000);
  }

  /* 倒计时文案 */
  function markCountdown(dateStr) {
    const diff = daysFromToday(dateStr);
    if (diff === 0) return '正是今日';
    if (diff === 1) return '明天';
    if (diff > 1) return diff + ' 天后';
    if (diff === -1) return '昨天';
    return '已过 ' + (-diff) + ' 天';
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---- 实时时钟 ---- */
  function tick() {
    const now = new Date();
    clockTimeEl.textContent =
      pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
    clockDateEl.textContent =
      now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) +
      ' · ' + WEEK_FULL[now.getDay()];
  }

  /* ---- 水墨背景 ---- */
  function currentPaintingIndex() {
    return bgOverride === null ? paintingIndexFor(new Date()) : bgOverride;
  }

  function renderPainting() {
    const idx = currentPaintingIndex();
    inkBg.innerHTML = PAINTINGS[idx].build();
    bgHint.textContent = `今日丹青 · ${PAINTINGS[idx].name}｜点击印章换画 · 隔日自动更换`;
  }

  sealBtn.addEventListener('click', () => {
    bgOverride = (currentPaintingIndex() + 1) % PAINTINGS.length;
    if (userData) userData.bgOverride = bgOverride;
    renderPainting();
    logEvent('更换背景画 · ' + PAINTINGS[bgOverride].name);
  });

  /* ---- 查询与渲染 ---- */
  function render() {
    const dateVal = dateInput.value; // "2026-10-26"
    const timeVal = timeInput.value; // "12:00"

    if (!dateVal) {
      showError('请选择一个日期');
      return;
    }

    const [y, m, d] = dateVal.split('-').map(Number);
    const date = new Date(y, m - 1, d);

    if (date < MIN_DATE || date > MAX_DATE) {
      showError('超出换算范围（1900-01-31 ~ 2100-12-31）');
      return;
    }

    result.classList.remove('error');

    const lunar = solarToLunar(y, m, d);
    const week = date.getDay();
    const terms = termsAround(date);
    const ups = upcomingFestivals(date);

    // 星期（点击文字可切换 星期X / 周X 格式）
    weekdayEl.textContent = weekModeShort ? WEEK_SHORT[week] : WEEK_FULL[week];

    // 农历日期（点击看详情）
    lunarEl.textContent = '农历 ' + ganzhiOf(lunar.year) + '年 ' + formatLunar(lunar);

    // 信息标签
    chipYearGz.textContent = '年干支 ' + ganzhiOf(lunar.year);
    chipDayGz.textContent = '日干支 ' + dayGanzhiOf(date.getTime());
    chipZodiac.textContent = '生肖 ' + zodiacOf(lunar.year);

    const hour = timeVal && /^\d{2}:\d{2}$/.test(timeVal)
      ? Number(timeVal.slice(0, 2))
      : null;
    if (hour === null) {
      chipShichen.textContent = '时辰 未选择';
      chipShichen.removeAttribute('title');
    } else {
      const [name, range] = shichenOf(hour);
      chipShichen.textContent = '时辰 ' + name;
      chipShichen.title = range;
    }

    // 距离今天
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
    chipOffset.textContent = '距今 ' +
      (diff === 0 ? '今天' : (diff > 0 ? diff + ' 天后' : -diff + ' 天前'));

    // 节气
    if (terms.cur) {
      termName.textContent = terms.cur.name;
      const onTermDay = dateVal === fmtDate(new Date(terms.cur.ts)) ? ' · 今日入节' : '';
      termSub.textContent = terms.next
        ? `距「${terms.next.name}」还有 ${terms.daysToNext} 天${onTermDay}`
        : onTermDay;
    }

    // 养生之道（随节气而变）
    if (terms.cur && WELLNESS[terms.cur.name]) {
      const w = WELLNESS[terms.cur.name];
      yangName.textContent = `${terms.cur.name} · 顺时养生`;
      yangSub.textContent = `宜：${w.yi}｜忌：${w.ji}`;
    }

    // 最近节日
    if (ups.length) {
      festName.textContent = ups[0].name;
      festSub.textContent = ups[0].days === 0
        ? '正是今日 · 点击查看详情'
        : `还有 ${ups[0].days} 天 · ${fmtShort(ups[0].date)}`;
      const rest = ups.slice(1);
      festMore.textContent = rest.length
        ? '其后 · ' + rest.map((f) => `${f.name}（${f.days} 天后）`).join(' · ')
        : '';
    } else {
      festName.textContent = '--';
      festSub.textContent = '';
      festMore.textContent = '';
    }

    // 当日节日（可点击）
    const todays = FEST_MAP.get(dateVal) || [];
    festToday.innerHTML = '';
    if (todays.length) {
      const label = document.createElement('span');
      label.className = 'fest-today-label';
      label.textContent = '当日佳节';
      festToday.appendChild(label);
      for (const f of todays) {
        const tag = document.createElement('button');
        tag.type = 'button';
        tag.className = 'fest-tag';
        tag.textContent = f.name;
        tag.addEventListener('click', () =>
          openFestDetail({ ...f, date: dateVal, days: 0 }));
        festToday.appendChild(tag);
      }
    }

    // 该日的印记
    const mark = marks[dateVal];
    markNoteEl.hidden = !mark;
    markNoteEl.textContent = mark || '';

    // 重要日期卡（临近七日直接显示倒计时）
    fillMarkCard();

    // 记住用户的选择（下次打开仍是此界面）
    if (userData) {
      userData.lastDate = dateVal;
      userData.lastTime = timeVal;
      userData.weekMode = weekModeShort;
      saveUserData();
    }

    // 记录状态与复制文本
    state = { dateVal, date, lunar, week, terms, ups, hour };
    lastResultText = [
      `【${dateVal} ${weekdayEl.textContent}】`,
      `农历 ${ganzhiOf(lunar.year)}年 ${formatLunar(lunar)}`,
      `年干支 ${ganzhiOf(lunar.year)} · 日干支 ${dayGanzhiOf(date.getTime())} · 生肖 ${zodiacOf(lunar.year)}` +
        (hour === null ? '' : ` · ${shichenOf(hour)[0]}`),
      terms.cur
        ? `节气 ${terms.cur.name}${terms.next ? `（距「${terms.next.name}」${terms.daysToNext} 天）` : ''}`
        : '',
      ups.length
        ? `最近节日 ${ups[0].name}${ups[0].days ? `（还有 ${ups[0].days} 天）` : '（正是今日）'}`
        : '',
      mark ? `印记：${mark}` : '',
    ].filter(Boolean).join('\n');
  }

  function showError(msg) {
    result.classList.add('error');
    weekdayEl.textContent = '出错了';
    lunarEl.textContent = msg;
    festToday.innerHTML = '';
    festMore.textContent = '';
    markNoteEl.hidden = true;
    state = null;
    lastResultText = '';
  }

  /* ---- 详情弹窗 ---- */
  function openLunarDetail() {
    if (!state) return;
    const s = state;
    const shichen = s.hour === null ? null : shichenOf(s.hour);
    const rows = [
      ['公历', s.dateVal],
      ['农历', `${ganzhiOf(s.lunar.year)}年 ${formatLunar(s.lunar)}${s.lunar.isLeap ? '（闰月）' : ''}`],
      ['年干支', `${ganzhiOf(s.lunar.year)}年 · 生肖${zodiacOf(s.lunar.year)}`],
      ['日干支', dayGanzhiOf(s.date.getTime()) + '日'],
      ['时辰', shichen ? `${shichen[0]}（${shichen[1]}）` : '未选择'],
    ];
    detailTitle.textContent = '农历 · 干支纪法';
    detailMeta.textContent = `${s.dateVal} · ${WEEK_FULL[s.week]}`;
    detailBody.innerHTML =
      `<table class="detail-table">${rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>` +
      `<p>农历又称阴历、夏历，是中华民族沿用数千年的历法。它以月相盈亏圆缺为一月，即「朔望月」；又通过设置闰月，使一年的平均长度接近太阳回归年，故实为「阴阳合历」。农历之中，初一为「朔」，十五为「望」，月相由朔至望再至朔，周而复始。</p>` +
      `<p>干支纪法源远流长，以十天干（甲乙丙丁戊己庚辛壬癸）与十二地支（子丑寅卯辰巳午未申酉戌亥）依次相配，六十次而成一循环，是为「六十甲子」。古人以干支纪年、纪月、纪日、纪时，构成四柱八字。纪日之法自上古延续至今，从未中断，是世界上使用时间最长的连续纪日系统。</p>` +
      `<p>生肖又称属相，以十二地支配十二种动物，十二年一轮回。民间认为生肖与人的性格命运相关，本命年又有穿红辟邪之俗。</p>`;
    detailModal.hidden = false;
  }

  function openTermDetail() {
    if (!state || !state.terms.cur) return;
    const t = state.terms;
    const curStart = new Date(t.cur.ts);
    const nextStart = t.next ? new Date(t.next.ts) : null;
    const range = nextStart
      ? `${fmtDate(curStart)} ~ ${fmtDate(new Date(nextStart.getTime() - 86400000))}`
      : fmtDate(curStart);
    detailTitle.textContent = t.cur.name;
    detailMeta.textContent = range;
    detailBody.innerHTML =
      `<p>${TERM_DESC[t.cur.name]}</p>` +
      (t.next
        ? `<p>下一节气「${t.next.name}」在 ${fmtDate(nextStart)}，距今还有 ${t.daysToNext} 天。</p>`
        : '') +
      `<p>二十四节气是上古农耕文明的产物，是古人顺应农时、观察天体运行而订立的补充历法：以太阳在黄道上的位置为准，每十五度为一节，一年二十四节。2016 年，「二十四节气」被正式列入联合国教科文组织人类非物质文化遗产代表作名录。</p>`;
    detailModal.hidden = false;
  }

  function openFestDetail(fest) {
    detailTitle.textContent = fest.name;
    detailMeta.textContent = `${fest.date} · ${fest.kind}节日`;
    detailBody.innerHTML =
      (fest.days === 0
        ? `<p>今日恰逢此节，宜随俗而行，共襄其时。</p>`
        : `<p>距离此节还有 ${fest.days} 天，可早做准备。</p>`) +
      `<p>${fest.desc}</p>`;
    detailModal.hidden = false;
  }

  /* 养生详情：宜忌 + 起居/饮食/运动/情志 标签页 */
  function openYangDetail() {
    if (!state || !state.terms.cur) return;
    const t = state.terms;
    const w = WELLNESS[t.cur.name];
    if (!w) return;

    const curStart = new Date(t.cur.ts);
    const nextStart = t.next ? new Date(t.next.ts) : null;
    const range = nextStart
      ? `${fmtDate(curStart)} ~ ${fmtDate(new Date(nextStart.getTime() - 86400000))}`
      : fmtDate(curStart);

    detailTitle.textContent = `养生 · ${t.cur.name}`;
    detailMeta.textContent = range;

    const tabs = ['起居', '饮食', '运动', '情志'];
    detailBody.innerHTML =
      `<div class="yiji"><span class="yi">宜：${w.yi}</span><span class="ji">忌：${w.ji}</span></div>` +
      `<div class="tabs">${tabs
        .map((tb, i) => `<button type="button" class="tab${i === 0 ? ' active' : ''}" data-tab="${tb}">${tb}</button>`)
        .join('')}</div>` +
      tabs
        .map((tb, i) => `<div class="tab-panel${i === 0 ? ' active' : ''}" data-panel="${tb}"><p>${w.items[tb]}</p></div>`)
        .join('') +
      `<p class="yang-note">《黄帝内经》云：「夫四时阴阳者，万物之根本也，所以圣人春夏养阳，秋冬养阴，以从其根。」养生之道，贵在顺应天时，法于阴阳，和于术数。</p>`;

    detailBody.querySelectorAll('.tab').forEach((tb) => {
      tb.addEventListener('click', () => {
        detailBody.querySelectorAll('.tab')
          .forEach((x) => x.classList.toggle('active', x === tb));
        detailBody.querySelectorAll('.tab-panel')
          .forEach((p) => p.classList.toggle('active', p.dataset.panel === tb.dataset.tab));
      });
    });

    detailModal.hidden = false;
  }

  /* ---- 重要日期：卡片与印记簿 ---- */
  /* 卡片上一行小字：· 备注 · 倒计时 */
  function markLineEl(m, isNear) {
    const line = document.createElement('div');
    line.className = 'mark-line' + (isNear ? ' near' : '');
    line.title = m.date;
    const note = document.createElement('span');
    note.textContent = '· ' + m.note;
    const days = document.createElement('span');
    days.className = 'mark-line-days';
    days.textContent = markCountdown(m.date);
    line.append(note, days);
    return line;
  }

  function fillMarkCard() {
    const entries = sortedMarks();
    markBody.innerHTML = '';

    if (!entries.length) {
      const empty = document.createElement('div');
      empty.className = 'mark-empty';
      empty.textContent = '尚未落印 · 打开月历为重要日子落印';
      markBody.appendChild(empty);
      return;
    }

    const near = entries.filter((m) => {
      const df = daysFromToday(m.date);
      return df >= 0 && df <= 7;
    });
    const far = entries.filter((m) => daysFromToday(m.date) > 7);
    const past = entries.filter((m) => daysFromToday(m.date) < 0);

    // 七日之内（含今日）：小字直接列出
    const nearBox = document.createElement('div');
    nearBox.className = 'mark-lines';
    if (near.length) {
      for (const m of near) nearBox.appendChild(markLineEl(m, true));
    } else {
      const empty = document.createElement('div');
      empty.className = 'mark-line faint';
      empty.textContent = '· 七日内暂无印记';
      nearBox.appendChild(empty);
    }
    markBody.appendChild(nearBox);

    // 其余（七日之外 + 已过）：默认收起，按下展开
    const restCount = far.length + past.length;
    if (restCount) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'mark-toggle';
      toggle.textContent = `其余印记（${restCount}）▾`;

      const hiddenBox = document.createElement('div');
      hiddenBox.className = 'mark-lines';
      hiddenBox.hidden = true;
      for (const m of far) hiddenBox.appendChild(markLineEl(m, false));
      for (const m of past) {
        const line = document.createElement('div');
        line.className = 'mark-line past';
        line.title = m.date;
        const note = document.createElement('span');
        note.textContent = `· ${m.note} · ${fmtShort(m.date)}`;
        const days = document.createElement('span');
        days.className = 'mark-line-days';
        days.textContent = '已过';
        line.append(note, days);
        hiddenBox.appendChild(line);
      }

      toggle.addEventListener('click', (e) => {
        e.stopPropagation(); // 不触发整卡点击（印记簿）
        const open = hiddenBox.hidden;
        hiddenBox.hidden = !open;
        toggle.textContent = open ? '收起 ▴' : `其余印记（${restCount}）▾`;
      });

      markBody.appendChild(toggle);
      markBody.appendChild(hiddenBox);
    }
  }

  function openMarksDetail() {
    const entries = sortedMarks();
    detailTitle.textContent = '重要日期 · 印记簿';
    detailMeta.textContent = `共 ${entries.length} 枚印记 · 存于本机`;

    if (!entries.length) {
      detailBody.innerHTML =
        `<p>还没有任何印记。打开「月历」，点选一个日期、写下备注，即可落下朱印。</p>` +
        `<button type="button" class="btn ghost small" id="goCalBtn">前往月历</button>`;
      document.getElementById('goCalBtn').addEventListener('click', () => {
        detailModal.hidden = true;
        openCalendar();
      });
    } else {
      detailBody.innerHTML =
        `<div class="mark-list">` +
        entries.map((m) => {
          const cd = markCountdown(m.date);
          return `<button type="button" class="mark-row${cd === '正是今日' ? ' today' : ''}" data-date="${m.date}">
            <span class="mark-row-note">${escapeHtml(m.note)}</span>
            <span class="mark-row-date">${m.date}</span>
            <span class="mark-row-days">${cd}</span>
          </button>`;
        }).join('') +
        `</div>` +
        `<p class="yang-note">点击任意印记，主界面即刻切换至该日黄历。临近七日之印，主界面会直接显示倒计天数。</p>`;
      detailBody.querySelectorAll('.mark-row').forEach((row) => {
        row.addEventListener('click', () => {
          dateInput.value = row.dataset.date;
          detailModal.hidden = true;
          render();
          logEvent('自印记簿择日 ' + row.dataset.date);
        });
      });
    }
    detailModal.hidden = false;
  }

  /* ---- 弹窗通用 ---- */
  document.querySelectorAll('.modal:not(#userModal)').forEach((m) => {
    m.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) m.hidden = true;
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!userLocked) userModal.hidden = true;
      calModal.hidden = true;
      detailModal.hidden = true;
    }
  });

  /* ---- 名号弹窗交互 ---- */
  userBtn.addEventListener('click', () => {
    userLocked = false;
    userClose.hidden = false;
    renderUserModal();
    userModal.hidden = false;
    userInput.focus();
  });

  userRegBtn.addEventListener('click', registerUser);
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') registerUser();
  });

  // 锁定（首访）时不可关闭；否则点遮罩或关闭钮即收起
  userModal.addEventListener('click', (e) => {
    if (userLocked) return;
    if (e.target.closest('[data-close]')) userModal.hidden = true;
  });

  /* ---- 月历 ---- */
  function shiftMonth(delta) {
    let { y, m } = calView;
    m += delta;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    if (y < 1900) { y = 1900; m = 0; }
    if (y > 2100) { y = 2100; m = 11; }
    calView = { y, m };
    buildCal();
  }

  function buildCal() {
    const { y, m } = calView;
    const first = new Date(y, m, 1);
    const startOffset = first.getDay();          // 0 = 周日
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    // 标题：公历 + 该月初一的农历
    const lun1 = solarToLunar(y, m + 1, 1);
    calLunarT.textContent =
      `${ganzhiOf(lun1.year)}年 ${(lun1.isLeap ? '闰' : '') + LUNAR_MONTH[lun1.month - 1]}月`;
    calSolarT.textContent = `${y}年${m + 1}月`;

    // 拼出 6 行 × 7 列的日期（含上下月补位）
    const cells = [];
    const prevDays = new Date(y, m, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const py = m === 0 ? y - 1 : y;
      const pm = m === 0 ? 11 : m - 1;
      cells.push({ y: py, m: pm, d: prevDays - i, dim: true });
    }
    for (let d = 1; d <= daysInMonth; d++) cells.push({ y, m, d, dim: false });
    let nextD = 1;
    const ny = m === 11 ? y + 1 : y;
    const nm = m === 11 ? 0 : m + 1;
    while (cells.length < 42) cells.push({ y: ny, m: nm, d: nextD++, dim: true });

    const todayStr = fmtDate(new Date());
    const selStr = dateInput.value;

    calGrid.innerHTML = '';
    for (const c of cells) {
      const key = `${c.y}-${pad(c.m + 1)}-${pad(c.d)}`;
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cal-cell'
        + (c.dim ? ' dim' : '')
        + (key === todayStr ? ' today' : '')
        + (key === selStr ? ' selected' : '');
      cell.textContent = c.d;

      const hints = [];
      const fests = FEST_MAP.get(key);
      if (fests) hints.push(fests.map((f) => f.name).join('、'));
      if (TERM_MAP.has(key)) hints.push(TERM_MAP.get(key));
      if (marks[key]) hints.push('印记：' + marks[key]);
      cell.title = hints.join(' · ') || '';

      if (marks[key]) {
        const dot = document.createElement('span');
        dot.className = 'dot-mark';
        cell.appendChild(dot);
      }
      if (fests) {
        const dot = document.createElement('span');
        dot.className = 'dot-fest';
        cell.appendChild(dot);
      }

      cell.addEventListener('click', () => {
        if (c.dim) calView = { y: c.y, m: c.m }; // 点上下月补位则跳月
        dateInput.value = key;
        render();
        buildCal();
        logEvent('月历择日 ' + key);
      });
      calGrid.appendChild(cell);
    }

    // 印记操作区
    const mark = selStr ? marks[selStr] : undefined;
    calSelInfo.textContent = selStr
      ? `已选 ${selStr}${mark ? ' · 已有印记' : ' · 尚未落印'}`
      : '点选一日，可为其落印标记';
    markInput.value = mark || '';
    calLegend.textContent =
      `朱点为已落印 · 金点为节日 · 共 ${Object.keys(marks).length} 印 · 印记存于本机`;
  }

  function openCalendar() {
    if (dateInput.value) {
      const [y, m] = dateInput.value.split('-').map(Number);
      calView = { y, m: m - 1 };
    }
    buildCal();
    calModal.hidden = false;
  }

  markAddBtn.addEventListener('click', () => {
    if (!dateInput.value) return;
    const note = markInput.value.trim() || '记';
    marks[dateInput.value] = note;
    saveMarks();
    render();
    buildCal();
    logEvent(`落印 ${dateInput.value}：${note}`);
  });

  markDelBtn.addEventListener('click', () => {
    if (!dateInput.value || !marks[dateInput.value]) return;
    delete marks[dateInput.value];
    saveMarks();
    render();
    buildCal();
    logEvent('除印 ' + dateInput.value);
  });

  markInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') markAddBtn.click();
  });

  /* ---- 事件 ---- */
  dateInput.addEventListener('change', () => {
    render();
    logEvent('择日 ' + dateInput.value);
  });
  timeInput.addEventListener('change', render);

  queryBtn.addEventListener('click', () => {
    render();
    logEvent('查询 ' + dateInput.value);
    // 重放“研墨”闪烁动画
    result.classList.remove('query-flash');
    void result.offsetWidth;
    result.classList.add('query-flash');
  });

  todayBtn.addEventListener('click', () => {
    const now = new Date();
    dateInput.value = fmtDate(now);
    timeInput.value = pad(now.getHours()) + ':' + pad(now.getMinutes());
    render();
    logEvent('回到今日');
  });

  calBtn.addEventListener('click', openCalendar);
  calPrev.addEventListener('click', () => shiftMonth(-1));
  calNext.addEventListener('click', () => shiftMonth(1));
  calTodayBtn.addEventListener('click', () => {
    const now = new Date();
    calView = { y: now.getFullYear(), m: now.getMonth() };
    buildCal();
  });

  function toggleWeekMode() {
    weekModeShort = !weekModeShort;
    render();
  }
  weekdayEl.addEventListener('click', toggleWeekMode);
  weekdayEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleWeekMode();
    }
  });

  function openCardOnKey(el, fn) {
    el.addEventListener('keydown', (e) => {
      if (e.target !== el) return; // 卡内按钮（如展开钮）自行处理
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fn();
      }
    });
  }
  lunarEl.addEventListener('click', openLunarDetail);
  openCardOnKey(lunarEl, openLunarDetail);

  termCard.addEventListener('click', openTermDetail);
  openCardOnKey(termCard, openTermDetail);

  festCard.addEventListener('click', () => {
    if (state && state.ups.length) openFestDetail(state.ups[0]);
  });
  openCardOnKey(festCard, () => {
    if (state && state.ups.length) openFestDetail(state.ups[0]);
  });

  yangCard.addEventListener('click', openYangDetail);
  openCardOnKey(yangCard, openYangDetail);

  markCard.addEventListener('click', openMarksDetail);
  openCardOnKey(markCard, openMarksDetail);

  copyBtn.addEventListener('click', async () => {
    if (!lastResultText) return;
    const ok = await copyText(lastResultText);
    copyBtn.textContent = ok ? '✓ 已复制' : '复制失败';
    setTimeout(() => (copyBtn.textContent = '复制黄历'), 1500);
  });

  /* 复制文本，兼容直接双击打开的 file:// 页面 */
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      throw new Error('无剪贴板 API');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    }
  }

  /* ---- 初始化 ---- */
  const nowInit = new Date();
  dateInput.value = fmtDate(nowInit);
  timeInput.value = pad(nowInit.getHours()) + ':' + pad(nowInit.getMinutes());

  buildCalendars();
  loadUsers();
  const savedCur = localStorage.getItem(CUR_USER_KEY);

  if (savedCur && users.includes(savedCur)) {
    // 老友归来：直接恢复其界面与印记
    enterUser(savedCur);
  } else {
    // 首访：以游客状态渲染，并锁定入册弹窗
    render();
    renderPainting();
    userLocked = true;
    userClose.hidden = true;
    renderUserModal();
    userModal.hidden = false;
    userInput.focus();
  }

  tick();
  setInterval(tick, 1000);
}
