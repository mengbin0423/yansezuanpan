// pages/login/login.js
const app = getApp();
const md5 = require('../../utils/md5.js');
const base64 = require('../../utils/base64.js');
const utils = require('../../utils/util.js');
const api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    ouid:'',
    version: '101'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.wxLogin()
    if (JSON.stringify(options) != "{}") {
      console.log(options)
      if (options.ouid != undefined) {
        wx.setStorageSync('ouid', options.ouid)
        this.setData({
          id:options.id,
          ouid:options.ouid
        }) 
      }
    }
    
  },
  getUserInfo: function (e) {
    var _this = this;
    wx.getUserInfo({
      success: res => {
        _this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        wx.setStorageSync('nickname', _this.data.userInfo.nickName);
        wx.setStorageSync('avatarurl', _this.data.userInfo.avatarUrl);
        wx.setStorageSync('rawData', res.rawData);
        wx.setStorageSync('signature', res.signature);
        wx.setStorageSync('encryptedData', res.encryptedData);
        wx.setStorageSync('iv', res.iv)
        _this.callBack();
      },
      fail: res => {
        console.log('getUserInfo' + res)
      }
    })


  },
  callBack: function () {
    console.log("成功获取用户信息");
    let _this = this;
    wx.getSystemInfo({
      success: function (res) {
        let platform;
        if (res.platform == 'devtools') {
          platform = 5;
        } else {
          platform = 0;
        }
        wx.setStorageSync('platform', platform);
        wx.setStorageSync('windowWidth', res.windowWidth);
        wx.setStorageSync('windowHeight', res.windowHeight);
        _this.setData({
          systemInfo: res
        })
      }
    })
    _this.login()
  },
  userStatus: function () {
    console.log('获取用户状态信息');
    let _this = this;
    let params = {
      uid: wx.getStorageSync('uid'),
      tick: Date.parse(new Date()) / 1000
    };
    params['key'] = md5(app.getSN(params));
    wx.request({
      url: api.status,
      data: params,
      method: 'GET',
      success: function (res) {
        let datas = utils.formatStr(res.data);
        if (datas.code == 0) {
          let avatar = base64.Base64.decode(datas.avatar);
          let coins = datas.coins;
          let name = base64.Base64.decode(datas.name);
          let qid = datas.qid;
          let question_num = datas.question_num;
          wx.setStorageSync('avatar', avatar);
          wx.setStorageSync('coins', coins);
          wx.setStorageSync('name', name);
          wx.setStorageSync('qid', qid);
          wx.setStorageSync('order', qid);
          wx.setStorageSync('question_num', question_num);
        } else {
          console.log('status error: ' + JSON.stringify(res));
        }
      },
      fail: res => {
        console.log('status error: ' + JSON.stringify(res));
      }
    })
  },

  login: function () {
    let _this = this;
    let params = {
      secen: wx.getStorageSync('scene'),
      platform: wx.getStorageSync('platform'),
      openid: wx.getStorageSync('openid'),
      ver: _this.data.version,
      raw: base64.Base64.encode(wx.getStorageSync('rawData')),
      signature: wx.getStorageSync('signature'),
      data: wx.getStorageSync('encryptedData'),
      iv: wx.getStorageSync('iv'),
      tick: Date.parse(new Date()) / 1000
    }
    params['key'] = md5(app.getSN(params));
    wx.request({
      url: api.login,
      data: params,
      method: 'GET',
      success: function (res) {
        console.log('login: ' + JSON.stringify(res));
        let datas = utils.formatStr(res.data);
        if (datas.code == 0) {
          console.log("登录服务成功uid:" + datas.uid);
          wx.removeStorageSync('uid');
          wx.setStorageSync('uid', datas.uid);
          _this.setData({
            wxLoginCount: 0
          });
          _this.userStatus();
          if (wx.getStorageSync('ouid') != '') { 
            _this.creatFriends();
          }
          if (_this.data.id != '') {
            wx.redirectTo({
              url: '/pages/changeList/changeList?id=' + _this.data.id + '&ouid=' + _this.data.ouid,
            })
          } else {
            wx.redirectTo({
              url: '/pages/index/index',
            })
          }
         
          
        } else if (datas.code == -3) {
          let count = _this.data.wxLoginCount;
          count++;
          _this.setData({
            wxLoginCount: count
          });
          if (count <= 2) {
            console.log("登录服务失败, 重新登录");
            _this.wxLogin();
          } else {
            console.log("登录服务失败,超时");
          }
        } else {
          console.log("登录服务失败");
        }
      },
      fail: res => {
        console.log('login' + res)
      }
    })
  },
  wxLogin: function () {
    let _this = this;
    wx.login({
      success: res => {
        console.log(res)
        _this.check(res.code);
      },
      fail: res => {
        console.log('login' + res)
      }
    })
  },
  //登录
  check: function (code) {
    let _this = this;
    let params = {
      code: code,
    }
    params['key'] = md5(app.getSN(params));
    wx.request({
      url: api.check,
      data: params,
      method: 'GET',
      success: function (res) {
        let datas = utils.formatStr(res.data);
        if (datas.code == 0) {
          wx.setStorageSync('openid', datas.openid);  
        } else {
          console.log('check error: ' + JSON.stringify(res));
        }
      },
      fail: res => {
        console.log('check error: ' + JSON.stringify(res));
      }
    })
  },

  creatFriends: function () {
    let _this = this;
    let params = {
      uid: wx.getStorageSync('uid'),
      friend_uid: wx.getStorageSync('ouid'),
      tick: Date.parse(new Date()) / 1000
    };
    params['key'] = md5(app.getSN(params));
    wx.request({
      url: api.createFriends,
      data: params,
      method: 'GET',
      success: function (res) {
        let datas = utils.formatStr(res.data);
        if (datas.code == 0) {
        } else {
          console.log('创建好友请求出错');
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})