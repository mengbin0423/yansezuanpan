const app = getApp();
const md5 = require('md5.js');
const base64 = require('base64.js');
const utils = require('util.js');

function navigateToMiniProgram() {// 更多好玩
  let shareSuid = wx.getStorageSync('shareSuid');
  let uid = wx.getStorageSync('uid');
  let gid = wx.getStorageSync('gid');
  let gameSuid = wx.getStorageSync('suid');
  let jump = 'wxaa46e77919aec8d9';
  console.log(jump);
  let gsuid;
  if (shareSuid) {
    gsuid = shareSuid;
  } else {
    gsuid = 0;
  }
  console.log('shareSuid: ' + gsuid);
  console.log('uid: ' + uid);
  console.log('gid: ' + gid);
  console.log('gameSuid: ' + gameSuid);
  wx.navigateToMiniProgram({
    appId: jump,
    // appId: 'wxfd7eaa3e65115a73',//玩主
    // appId: 'wx5387273e1ce623ef',//神手游戏
    path: 'pages/index/index',//打开的页面路径
    extraData: {//需要传递给目标小程序的数据
      guid: uid,//小程序中的用户ID
      gid: gid,//小程序游戏编号
      friend_guid: gsuid,//小程序接收的转发suid
      gameSuid: gameSuid,//小程序存储的关联的suid
    },
    envVersion: app.globalData.miniversion,//要打开的小程序版本（开发版），trial（体验版），release（正式版）
    success(res) {
      console.log('跳转成功！');
      app.globalData.moreGame = 1;
      console.log('moreGame= ' + app.globalData.moreGame);
    },
    fail: function (res) {
      console.log(res)
    }
  })
}
function ShareApp() {//转发小程序带suid参数
  let suid = wx.getStorageSync('suid');//判断是不是玩主进来
  let wanzhuId;
  if (suid && (suid != 0)) {
    wanzhuId = suid;
  } else {
    wanzhuId = 0;
  }
  return wanzhuId;
}
function showApp() {
  let moreGame = app.globalData.moreGame;
  // let moreGame = 1;
  // let suid = 0;
  let guid = wx.getStorageSync('uid');
  let gid = wx.getStorageSync('gid');
  let suid = wx.getStorageSync('suid');
  console.log('进入showApp');
  console.log('suid= ' + suid);
  if ((moreGame == 1) && (suid == 0)) {
    let params = {
      guid: guid,
      gid: gid
    }
    params['key'] = md5(app.getSN(params));
    wx.request({
      url: app.globalData.set + "1.0.1/set/GetSuidFromRelevance",
      data: params,
      method: 'GET',
      success: function (res) {
        let datas = utils.formatStr(res.data);
        console.log('请求更新suid成功');
        console.log(datas);
        if (datas.code == 0) {
          app.globalData.moreGame = 0;
          wx.setStorageSync('suid', datas.suid);
          console.log('showApp success');
        } else {
          console.log('showApp error')
        }
      }
    })
  }
}
//接口列表
module.exports = {
  check:  app.globalData.server + '/yszp/1.0.1/login/check',
  login:  app.globalData.server + '/yszp/1.0.1/login/login',
  status: app.globalData.server + '/yszp/1.0.1/yszp/status',
  report: app.globalData.server + '/yszp/1.0.1/yszp/report',
  createFriends: app.globalData.server + '/yszp/1.0.1/yszp/createFriends',
  rank: app.globalData.server + '/yszp/1.0.1/yszp/rank',
  Challenge: app.globalData.server + '/yszp/1.0.1/yszp/Challenge',
  createFriends: app.globalData.server + '/yszp/1.0.1/yszp/createFriends',

  navigateToMiniProgram: navigateToMiniProgram,//跳转小程序
  ShareApp: ShareApp,//转发
  // showApp: showApp,//切前台更新suid
  // SetLogin: app.globalData.set + "1.0.2/login/GameLoginFromSet",//判断玩主是否关联过
  // TrueGameAddGold: app.globalData.set + "1.0.2/set/TrueGameAddGold",//玩主金币结算
  // AddNotSetSuidTheGameUserAGold: app.globalData.set + "1.0.1/set/AddNotSetSuidTheGameUserAGold",//未关联的小程序用户受益缓存
  // GetSuidFromRelevance: app.globalData.set + "1.0.1/set/GetSuidFromRelevance",//更新suid
  // RelevanceUserInfo: app.globalData.set + "1.0.2/set/RelevanceUserInfo",//关联玩主数据
  // unRead: app.globalData.set + "1.0.1/set/index",//首页余额
  // UserGetGoldAndindingSuid: app.globalData.set + "1.0.2/set/UserGetGoldAndindingSuid",//未关联提交收益，弹出金币
}