//index.js
//获取应用实例
const app = getApp();
const md5 = require('../../utils/md5.js');
const base64 = require('../../utils/base64.js');
const utils = require('../../utils/util.js');
const api = require('../../utils/api.js');
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    changeList:[],
    score:0,
    shareMsg:{},
    isMe:false,
    percent:0,
    mark:0,
    id:'',
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  
  //分享
  onShareAppMessage: function (e) {
    var _this = this;
    let wanzhuId = api.ShareApp();
    if(e.from=='button'){
      _this.setData({
        shareImg: '../../res/challenge.jpg',
        shareTitle: '我的战绩高达' + _this.data.score + '分，你能超过我吗？',
        shareUrl: '/pages/index/index?ouid=' + wx.getStorageSync('uid') + '&id=' + wx.getStorageSync('id') + '&suid=' + wanzhuId,
      })
    }else if(e.from=='menu'){
      _this.setData({
        shareImg: '../../res/zuanfa.jpg',
        shareTitle: '颜色转转转玩到手残，就问你敢不敢挑战？',
        shareUrl: '/pages/index/index?suid=' + wanzhuId,
      })
    }
   
    return {
      title: _this.data.shareTitle,
      imageUrl: _this.data.shareImg,
      path: _this.data.shareUrl,
      success: function (res) {
        console.log(_this.data.shareUrl)
        let params = {
          uid: wx.getStorageSync('uid'),
          tick: Date.parse(new Date()) / 1000
        };
        params['key'] = md5(app.getSN(params));
        wx.request({
          url: api.share,
          data: params,
          method: 'GET',
          success: function (res) {
            let datas = utils.formatStr(res.data);
            console.log(datas)
          }
        });
      }
    }
    var formID = e.detail.formId;
    getFormId(7, formID)
  },

  //事件处理函数
  bindViewTap: function (e) {
    console.log(e)
    // wx.navigateTo({
    //   url: '../logs/logs'
    // })
  },
  //获取个人信息
  
  onLoad: function (options) {   
    let _this=this;
    let openid = wx.getStorageSync('openid');
    var pages = getCurrentPages()    //获取加载的页面

    var currentPage = pages[pages.length - 1]    //获取当前页面的对象

    var url = currentPage.route   
    console.log(url)
    
      let uid = wx.getStorageSync('uid')
      // let id = wxdfddac25cfa09767
      console.log(options);
      // if (JSON.stringify(options) != "{}") {
        if (options.ouid) {
          
          this.getChangeRank(options.ouid, options.id);
          if (options.ouid != uid) {
            _this.setData({
              isMe: false,
              id: options.id
            })
          } else if(options.ouid == uid){
            _this.setData({
              isMe: true,
              id: options.id
            })
          }

          let userInfo = wx.getStorageSync('userInfo');
          userInfo = {
            usename: wx.getStorageSync('nickname'),
            avatarurl: wx.getStorageSync('avatarurl')
          }
          this.setData({
            userInfo: userInfo
          })
          this.percent();
        }
      // } else {
      //   console.log('111111111');
      //   this.getChangeRank(uid, id);
      // }
    
    var score = wx.getStorageSync('score')
    this.setData({
      score:score
    })
  },

  startChange:function(e){
    let mark = this.data.mark;
    wx.redirectTo({
      url: '/pages/Checkpoint/checkpoint?mark=' + mark + '&id=' + this.data.id,
    })
   
  },
  percent: function () {
    var _this = this;
    var score = _this.data.score;
    if (score <= 10) {
      _this.setData({
        percent: '88%'
      })
    } else if (score > 10 && score <= 30) {
      _this.setData({
        percent: '89%'
      })
    } else if (score > 30 && score <= 60) {
      _this.setData({
        percent: '90%'
      })
    } else if (score > 60 && score <= 90) {
      _this.setData({
        percent: '91%'
      })
    } else if (score > 90 && score <= 120) {
      _this.setData({
        percent: '93%'
      })
    } else if (score > 120) {
      _this.setData({
        percent: '95%'
      })
    }
  },

  //获取挑战排行
  getChangeRank: function (options,id){
    let _this = this;
    let params = {
      uid: options,
      id: id,
      tick: Date.parse(new Date()) / 1000
    }
   
    params['key'] = md5(app.getSN(params));
    wx.request({
      url: api.Challenge,
      method:'GET',
      data:params,
      success:function(res){
        let datas = utils.formatStr(res.data);
        if(datas.code==0){
          console.log('挑战排行获取成功')
          let changeList = _this.data.changeList;
          let shareMsg = _this.data.shareMsg;
          for(let i=0;i<datas.data.length;i++){
              changeList.push({
                index:i+1,
                avatar: base64.Base64.decode(datas.data[i].avatar),
                name: utils.substr(base64.Base64.decode(datas.data[i].name)),
                score: JSON.parse(datas.data[i].mark)
              })
              _this.setData({
                score: JSON.parse(datas.data[i].mark)
              })
          }
          shareMsg={
            avatar: base64.Base64.decode(datas.master.avatar),
            name: utils.substr(base64.Base64.decode(datas.master.name)),
          }
          _this.setData({
            changeList: changeList,
            mark: datas.master.mark,
            shareMsg:shareMsg
          })
        }
      },
      fail:function(res){
        console.log('挑战排行获取失败')
      }
    })
  },

  // creatFriends: function () {
  //   let _this = this;
  //   let params = {
  //     uid: wx.getStorageSync('uid'),
  //     friend_uid: wx.getStorageSync('ouid'),
  //     tick: Date.parse(new Date()) / 1000
  //   };
  //   params['key'] = md5(app.getSN(params));
  //   wx.request({
  //     url: api.createFriends,
  //     data: params,
  //     method: 'GET',
  //     success: function (res) {
  //       let datas = utils.formatStr(res.data);
  //       if (datas.code == 0) {
  //         if (app.globalData.ResurreCard<2){
  //           app.globalData.ResurreCard = app.globalData.ResurreCard+1
  //         }
  //         console.log('创建好友成功');
  //       } else {
  //         console.log('创建好友请求出错');
  //       }
  //     }
  //   })
  // },

  backIndex:function(e){
    // wx.redirectTo({
    //   url: '/pages/index/index',
    // })
    api.navigateToMiniProgram();
  }

})

//获取formID
function getFormId(res, FormCode) {
  let params = {
    uid: wx.getStorageSync('uid'),
    type: res,
    formId: FormCode,
    tick: Date.parse(new Date()) / 1000
  }
  params['key'] = md5(app.getSN(params));
  wx.request({
    url: api.getFormId,
    method: 'GET',
    data: params,
    success: function (res) {
      console.log(res)
    }
  })
}