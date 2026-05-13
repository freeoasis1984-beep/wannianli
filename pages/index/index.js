const lunar = require('../../utils/lunar.js');

const WEEK_NAMES = ['日', '一', '二', '三', '四', '五', '六'];

/** 与巨量后台「广告位类型」一致：多数「一点即播」用的是激励视频，插屏需单独建位 */
const AD_UNIT_ID = 'a1lqvxb7vtr08rqdeu';

Page({
  data: {
    year: 0,
    month: 0,
    todayY: 0,
    todayM: 0,
    todayD: 0,
    selectedY: 0,
    selectedM: 0,
    selectedD: 0,
    weekNames: WEEK_NAMES,
    days: [],
    todayLunar: '',
    todayGanZhi: '',
    todayAnimal: '',
    todayFestival: '',
    selectedInfo: {}
  },

  onLoad() {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    this.setData({
      todayY: y,
      todayM: m,
      todayD: d,
      year: y,
      month: m,
      selectedY: y,
      selectedM: m,
      selectedD: d
    });
    this.buildCalendar(y, m);
    this.refreshSelectedInfo(y, m, d);
    this.adReady = false;
    this._adMode = null;
    this.initAd();
  },

  /**
   * 先按激励视频预加载（与你其它小程序「一点就进」一致），失败再试插屏。
   * 同一 ID 在后台只能对应一种类型，其中一种会成功。
   */
  initAd() {
    if (typeof tt === 'undefined') return;
    const bindReward = () => {
      if (!this.rewardAd || typeof this.rewardAd.onClose !== 'function') return;
      this.rewardAd.onClose(() => {
        this.adReady = false;
        this._preloadCurrentMode();
      });
      this.rewardAd.onError &&
        this.rewardAd.onError((err) => {
          console.warn('激励视频错误', err);
          this.adReady = false;
        });
    };
    const bindInterstitial = () => {
      if (!this.interstitialAd) return;
      this.interstitialAd.onClose &&
        this.interstitialAd.onClose(() => {
          this.adReady = false;
          this._preloadCurrentMode();
        });
      this.interstitialAd.onError &&
        this.interstitialAd.onError((err) => {
          console.warn('插屏广告错误', err);
          this.adReady = false;
        });
    };

    try {
      if (tt.createRewardedVideoAd) {
        this.rewardAd = tt.createRewardedVideoAd({ adUnitId: AD_UNIT_ID });
        bindReward();
        this.rewardAd
          .load()
          .then(() => {
            this._adMode = 'reward';
            this.adReady = true;
          })
          .catch((e1) => {
            console.warn('激励视频预加载失败，尝试插屏', e1);
            try {
              if (this.rewardAd && this.rewardAd.destroy) this.rewardAd.destroy();
            } catch (_) {}
            this.rewardAd = null;
            if (!tt.createInterstitialAd) return;
            this.interstitialAd = tt.createInterstitialAd({ adUnitId: AD_UNIT_ID });
            bindInterstitial();
            return this.interstitialAd
              .load()
              .then(() => {
                this._adMode = 'interstitial';
                this.adReady = true;
              })
              .catch((e2) => {
                console.warn('插屏预加载也失败', e2);
                this._adMode = null;
                this.adReady = false;
              });
          });
        return;
      }
      if (tt.createInterstitialAd) {
        this.interstitialAd = tt.createInterstitialAd({ adUnitId: AD_UNIT_ID });
        bindInterstitial();
        this.interstitialAd
          .load()
          .then(() => {
            this._adMode = 'interstitial';
            this.adReady = true;
          })
          .catch((e) => {
            console.warn('插屏预加载失败', e);
            this._adMode = null;
          });
      }
    } catch (e) {
      console.warn('广告初始化异常', e);
    }
  },

  _preloadCurrentMode() {
    if (this._adMode === 'reward' && this.rewardAd && this.rewardAd.load) {
      this.rewardAd
        .load()
        .then(() => {
          this.adReady = true;
        })
        .catch(() => {
          this.adReady = false;
        });
      return;
    }
    if (this._adMode === 'interstitial' && this.interstitialAd && this.interstitialAd.load) {
      this.interstitialAd
        .load()
        .then(() => {
          this.adReady = true;
        })
        .catch(() => {
          this.adReady = false;
        });
    }
  },

  /** 小贴士被点击：需要在短时间内连续点击 TAP_TARGET 次才触发广告 */
  onTipsTap() {
    const TAP_TARGET = 3;
    const TAP_WINDOW_MS = 1200;
    const now = Date.now();
    if (!this._tapStart || now - this._tapStart > TAP_WINDOW_MS) {
      this._tapStart = now;
      this._tapCount = 1;
    } else {
      this._tapCount = (this._tapCount || 0) + 1;
    }
    const left = TAP_TARGET - this._tapCount;
    if (left <= 0) {
      this._tapCount = 0;
      this._tapStart = 0;
      this.onShowAd();
    }
  },

  onShowAd() {
    if (typeof tt === 'undefined') return;
    const toastFail = (msg) => {
      tt.showToast && tt.showToast({ title: msg || '广告加载失败，请稍后再试', icon: 'none' });
    };

    const showReward = () => {
      if (!this.rewardAd) return Promise.reject(new Error('no reward'));
      const p = this.rewardAd.show();
      if (p && typeof p.then === 'function') {
        return p.then(() => {
          this.adReady = false;
        });
      }
      this.adReady = false;
      return Promise.resolve();
    };

    const showInterstitial = () => {
      if (!this.interstitialAd) return Promise.reject(new Error('no interstitial'));
      const p = this.interstitialAd.show();
      if (p && typeof p.then === 'function') {
        return p.then(() => {
          this.adReady = false;
        });
      }
      this.adReady = false;
      return Promise.resolve();
    };

    const tryShowByMode = () => {
      if (this._adMode === 'reward' && this.rewardAd) {
        if (this.adReady) {
          return showReward().catch((err) => {
            console.warn('激励展示失败，重新拉取', err);
            return this.rewardAd.load().then(() => showReward());
          });
        }
        return this.rewardAd.load().then(() => {
          this.adReady = true;
          return showReward();
        });
      }
      if (this._adMode === 'interstitial' && this.interstitialAd) {
        if (this.adReady) {
          return showInterstitial().catch((err) => {
            console.warn('插屏展示失败，重新拉取', err);
            return this.interstitialAd.load().then(() => showInterstitial());
          });
        }
        return this.interstitialAd.load().then(() => {
          this.adReady = true;
          return showInterstitial();
        });
      }
      // 刚进页面就点：预加载尚未写入 _adMode，用已有实例当场拉取
      if (!this._adMode && this.rewardAd) {
        return this.rewardAd
          .load()
          .then(() => {
            this._adMode = 'reward';
            this.adReady = true;
            return showReward();
          })
          .catch(() => {
            if (this.interstitialAd) {
              return this.interstitialAd.load().then(() => {
                this._adMode = 'interstitial';
                this.adReady = true;
                return showInterstitial();
              });
            }
            return Promise.reject(new Error('ad not ready'));
          });
      }
      if (!this._adMode && this.interstitialAd) {
        return this.interstitialAd.load().then(() => {
          this._adMode = 'interstitial';
          this.adReady = true;
          return showInterstitial();
        });
      }
      return Promise.reject(new Error('ad not ready'));
    };

    tryShowByMode().catch(() => {
      toastFail('广告加载失败，请稍后再试');
      if (this._adMode) {
        this._preloadCurrentMode();
      }
    });
  },

  buildCalendar(year, month) {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const prevMonthDays = new Date(year, month - 1, 0).getDate();
    const days = [];

    // 上月補白
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const info = lunar.solar2lunar(
        month === 1 ? year - 1 : year,
        month === 1 ? 12 : month - 1,
        day
      );
      days.push({
        day,
        lunar: info ? info.dayName : '',
        inMonth: false,
        isToday: false,
        isWeekend: false,
        festival: '',
        key: `prev-${day}`
      });
    }

    // 本月
    for (let d = 1; d <= daysInMonth; d++) {
      const info = lunar.solar2lunar(year, month, d);
      const weekday = new Date(year, month - 1, d).getDay();
      const sFest = lunar.getFestival(month, d);
      const lFest = info
        ? lunar.getLunarFestival(info.lMonth, info.lDay, info.isLeap, info.lYear)
        : '';
      const festival = sFest || lFest;
      const lunarLabel = festival || (info && info.lDay === 1 ? info.monthName : info ? info.dayName : '');
      days.push({
        day: d,
        lunar: lunarLabel,
        isFestival: !!festival,
        isMonthHead: info && info.lDay === 1 && !festival,
        inMonth: true,
        isToday: year === this.data.todayY && month === this.data.todayM && d === this.data.todayD,
        isSelected: year === this.data.selectedY && month === this.data.selectedM && d === this.data.selectedD,
        isWeekend: weekday === 0 || weekday === 6,
        key: `cur-${d}`
      });
    }

    // 下月補白，補到 42 格
    let extra = 1;
    while (days.length % 7 !== 0 || days.length < 42) {
      const info = lunar.solar2lunar(
        month === 12 ? year + 1 : year,
        month === 12 ? 1 : month + 1,
        extra
      );
      days.push({
        day: extra,
        lunar: info ? info.dayName : '',
        inMonth: false,
        isToday: false,
        isWeekend: false,
        festival: '',
        key: `next-${extra}`
      });
      extra++;
      if (days.length >= 42) break;
    }

    this.setData({ days });
  },

  refreshSelectedInfo(y, m, d) {
    const info = lunar.solar2lunar(y, m, d);
    if (!info) return;
    const sFest = lunar.getFestival(m, d);
    const lFest = lunar.getLunarFestival(info.lMonth, info.lDay, info.isLeap, info.lYear);
    const weekday = new Date(y, m - 1, d).getDay();
    this.setData({
      selectedInfo: {
        solar: `${y}年${m}月${d}日`,
        week: '星期' + WEEK_NAMES[weekday],
        lunar: `農曆 ${info.monthName}${info.dayName}`,
        ganZhi: `${info.ganZhiYear}年 [${info.animal}]`,
        festival: sFest && lFest ? `${sFest} · ${lFest}` : sFest || lFest || '——'
      }
    });
  },

  onPrevMonth() {
    let { year, month } = this.data;
    month--;
    if (month < 1) {
      month = 12;
      year--;
    }
    this.setData({ year, month });
    this.buildCalendar(year, month);
  },

  onNextMonth() {
    let { year, month } = this.data;
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
    this.setData({ year, month });
    this.buildCalendar(year, month);
  },

  onPrevYear() {
    const year = this.data.year - 1;
    this.setData({ year });
    this.buildCalendar(year, this.data.month);
  },

  onNextYear() {
    const year = this.data.year + 1;
    this.setData({ year });
    this.buildCalendar(year, this.data.month);
  },

  onBackToday() {
    const y = this.data.todayY;
    const m = this.data.todayM;
    const d = this.data.todayD;
    this.setData({
      year: y,
      month: m,
      selectedY: y,
      selectedM: m,
      selectedD: d
    });
    this.buildCalendar(y, m);
    this.refreshSelectedInfo(y, m, d);
  },

  onSelectDay(e) {
    const { day, inmonth } = e.currentTarget.dataset;
    if (!inmonth) return;
    const y = this.data.year;
    const m = this.data.month;
    this.setData({
      selectedY: y,
      selectedM: m,
      selectedD: day
    });
    this.buildCalendar(y, m);
    this.refreshSelectedInfo(y, m, day);
  },

});
