// pages/charts/charts.js
const app = getApp();
const md5 = require('../../utils/md5.js');
const base64 = require('../../utils/base64.js');
const utils = require('../../utils/util.js');
const api = require('../../utils/api.js');

Page({
  data: {
    isFriends: true,
    list: [],
    listWorld: [],
    myInfo: {},
    page: 1,
    rank:1,
    usename:'',
    gold:'',
    nodata: false
  },

  showFridens: function () {
    this.setData({
      isFriends:true,
      list: [],
      page: 1,
      nodata: false
    });
    this.getList(); 
  },

  showWorld: function () {
    this.setData({
      isFriends: false,
      listWorld: [],
      page: 1,
      nodata: false
    });
    this.getListWorld();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.showLoading({
    //   title: "数据获取中",
    //   mask: true
    // });
    this.getList();
   
      // this.wxLogin();
      if (app.globalData.userInfo) {
        this.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true
        })
      } else if (this.data.canIUse) {
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        app.userInfoReadyCallback = res => {
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      } else {
        // 在没有 open-type=getUserInfo 版本的兼容处理
        wx.getUserInfo({
          success: res => {
            app.globalData.userInfo = res.userInfo
            this.setData({
              userInfo: res.userInfo,
              hasUserInfo: true
            })
          }
        })
      }

      
  },
  // 获取好友排行
  getList: function () {
    let _this = this;
    let params = {
      uid: wx.getStorageSync('uid'),
      page: this.data.page,
      type: 1,
      tick: Date.parse(new Date()) / 1000
    };
    params['key'] = md5(app.getSN(params));
    wx.request({
      url: api.rank,
      data: params,
      method: 'GET',
      success: function (res) {
        let datas = utils.formatStr(res.data);
        if (datas.code == 0) {
          wx.hideLoading();
          let indexList = _this.data.list;
          if (datas.rank_data.length == 0) {
            _this.setData({
              nodata: true,
            });
          }
          
          for (let i = 0; i < datas.rank_data.length; i++) {
            indexList.push({
              sortnum: JSON.parse(datas.rank_data[i].rank_id),
              faceurl: base64.Base64.decode(datas.rank_data[i].avatar),
              username: utils.substr(base64.Base64.decode(datas.rank_data[i].name)),
              yuanbao: datas.rank_data[i].coins,
              question: datas.rank_data[i].level_id
            });
          }
          _this.setData({
            list: indexList, 
            myInfo: {
              // name: base64.Base64.decode(datas.rank_data.name),
              name: utils.substr(wx.getStorageSync('nickname')),
              gold: datas.self_data.level_id,
              mysort: datas.self_data.rank_id
            }
          })
        } else {
          console.log('rank error :' + JSON.stringify(res));
        }
      },
      fail: res => {
        console.log('rank error :' + JSON.stringify(res));
      }
    })
  },
  // 获取世界排行
  getListWorld: function () {
    let _this = this;
    let params = {
      uid: wx.getStorageSync('uid'),
      page: this.data.page,
      type: 2,
      tick: Date.parse(new Date()) / 1000
    };
    params['key'] = md5(app.getSN(params));
    wx.request({
      url: api.rank,
      data: params,
      method: 'GET',
      success: function (res) {
        let datas = utils.formatStr(res.data);
        if (datas.code == 0) {
          if (datas.rank_data.length == 0) {
            _this.setData({
              nodata: true
            });
          }
          let indexList = _this.data.listWorld;
          for (let i = 0; i < datas.rank_data.length; i++) {
            indexList.push({
              sortnum: JSON.parse(datas.rank_data[i].rank_id),
              faceurl: base64.Base64.decode(datas.rank_data[i].avatar),
              username: utils.substr(base64.Base64.decode(datas.rank_data[i].name)),
              question: datas.rank_data[i].level_id
            });
          }
          _this.setData({
            listWorld: indexList,
            myInfo: {
              name: utils.substr(wx.getStorageSync('nickname')),
              gold: datas.self_data.level_id,
              mysort: datas.self_data.rank_id
            }
          })
        } else {
          console.log('题目请求出错');
        }
      },
      fail: res => {
        console.log('check error :' + res);
      }
    })
  },
  loadInfo: function () {
    console.log("刷新");
    if (this.data.nodata) {
      return;
    }
    let p = JSON.parse(this.data.page) + 1
    this.setData({
      page: p
    });
    if (this.data.isFriends) {
      this.getList();
    } else {
      this.getListWorld();
    }
  },
  onShareAppMessage: function () {
    let wanzhuId = api.ShareApp();
    return {
      title: '颜色转转转玩到手残，就问你敢不敢挑战？',
      path: '/pages/index/index?suid=' + wanzhuId,
      imageUrl: '../../res/zuanfa.jpg',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})