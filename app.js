//app.js

App({
  globalData: {
    userInfo: null,
    server: "https://onxcx.wanzhushipin.cn",//正式
    // server: "https://xcx.wanzhuwenhua.com",//测试
    cdn: "https://tcdn.wanzhushipin.cn/xcx/gidiom/ui/",//正式
    //server: "https://xcx.wanzhuwenhua.com/gidiom/",
    //  cdn: "https://img.shihuo.me/ui/img/wx/xcx/yszp/",
    ver: '101',
    id: 1,
    sn: "fatality",
    scene:1,
    ResurreCard:1,
    // set: "https://d8.xiaoxiaowanzi.cn/setnew/",// 正式set
    // set: "https://xcx.wanzhuwenhua.com/setnew/",// 测试set
    moreGame: 0,//更多好玩点击状态
    miniversion: 'release',//要打开的小程序版本develop（开发版），trial（体验版），release（正式版）
    gameid: 14,//游戏gid
  },
  onShow: function (options) {
    if (options.scene == 1037) {//小程序中打开
      console.log('小程序打开');
      console.log(options);
      let extraDataJSON;
      if (JSON.stringify(options.referrerInfo.extraData) == "{}") {
        return;
      }
      if (typeof (options.referrerInfo.extraData) == "string") {
        extraDataJSON = JSON.parse(options.referrerInfo.extraData)
      } else {
        extraDataJSON = options.referrerInfo.extraData
      }
      wx.setStorageSync('suid', extraDataJSON.suid);
      wx.setStorageSync('gid', extraDataJSON.gid);
      console.log(wx.getStorageSync('suid'))
      console.log(wx.getStorageSync('gid'))
      console.log(typeof (wx.getStorageSync('suid')))
    }
  },
  onLaunch: function (options) {
    // 展示本地存储能力
    wx.setStorageSync('scene', options.scene)
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  getSN: function (params) {
    let keys = Object.keys(params);
    let values = [];
    for (var i = 0; i < keys.length; i++) {
      let key = keys[i];
      keys[i] = key.toLocaleLowerCase();
      values[keys[i]] = params[key];
    }

    keys.sort(function sorter(a, b) {
      return a > b ? 1 : a < b ? -1 : 0;
    });

    let str = "";
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      str = str + k + "=" + values[k] + "&";
    }
    return str + "key=" + this.globalData.sn;
  },
})