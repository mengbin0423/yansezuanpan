//index.js
//获取应用实例
const app = getApp();
const md5 = require('../../utils/md5.js');
const base64 = require('../../utils/base64.js');
const utils = require('../../utils/util.js');
const api = require('../../utils/api.js');

var animation1 = wx.createAnimation({})


Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    version: app.globalData.ver,
    showHelp:false,
    hasUserInfo: false,
    ResurreCard: 0,
    id:'',
    deg:10,
    ouid:'',
    animationData:'',
    appid:'wxaa46e77919aec8d9',
    GamePath:'',
    wxLoginCount: 0,
    nickname: wx.getStorageSync('nickname'),
    avatarurl: wx.getStorageSync('avatarurl'),
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    haveUserInfo: true,//是否已获取用户缓存
    suid: 0,//玩主suid
    toLogin: false,//要不要在获取信息后登录
    gameid: app.globalData.gameid,//游戏gid
    appid: '',
    money: '0',//玩主余额
    redPacket: false,//红包
    openredPacket: false,//红包打开
    showHandGuide: false,//手指导打开
    handRight: '',//手指导
    handTop: '',//手指导
    helpType: false,//是否帮好友答题
    goldSwitch: 2,//开关
    gamesArr:[],
    indexIcon:'https://s.wanzhucdn.com/game/xcx_ad/shen_shou_2.png',
    domain:'https://xcx.wanzhushipin.cn/verifyNdwm_new.php',
  },
  onLoad: function (options) {
    wx.showLoading({
      title: "数据获取中",
      mask: true
    });
    wx.removeStorageSync('ouid');
    wx.removeStorageSync('oqid');
    this.wxLogin()
    this.setData({
      ResurreCard: app.globalData.ResurreCard
    })
    console.log(app.globalData.ResurreCard)
    if (JSON.stringify(options) != "{}") {
      if (options.ouid != undefined) {
        wx.setStorageSync('ouid', options.ouid)
      }
      if (options.oqid != undefined) {
        wx.setStorageSync('oqid', options.oqid)
      }
      if (options.id != undefined) {
        wx.setStorageSync('ouid', options.ouid)
        this.setData({
          id: options.id,
          ouid: options.ouid
        })
      }
    }
    
    let _this = this;
    wx.removeStorageSync('shareSuid');//先删除缓存shareSuid
    if (options.suid) {//分享进来的存shareSuid
      console.log('接受转发的suid');
      wx.setStorageSync('shareSuid', options.suid)
    }
    let suid = wx.getStorageSync('suid');//判断一下有没有suid和gid缓存
    let gid = wx.getStorageSync('gid');
    console.log('suid= ' + suid + ' gid= ' + gid);
    if (suid && (suid != 0)) {//如果有suid且大于0
      _this.setData({
        suid: suid,
        gameid: gid,
        toLogin: true
      })
      // _this.SetLogin();
    } else {//如果suid=0或没有suid
      _this.setData({
        toLogin: true
      })
      // _this.checkUserInfo();//进入传统登录流程
    }
    _this.checkUserInfo();//进入传统登录流程
    setInterval(function(e){
      _this.animationPic()
    },2400)
   
  },
  onShow: function () {
    // api.showApp();//更多点击状态变1去更新suid
    this.getMore()
  },

  getMore: function () {
    let _this = this;
    wx.request({
      url: _this.data.domain + '?code=getmore',
      data: {},
      method: 'GET',
      success: function (res) {
        let datas = utils.formatStr(res.data)
        _this.setData({
          gamesArr: datas.games
        })
        _this.changePic();
      }
    })
  },




  SetLogin: function () {//请求接口判断有没有与玩主关联
    console.log('SetLogin start');
    let _this = this;
    let params = {
      suid: _this.data.suid,
      gid: _this.data.gameid
    };
    params['key'] = md5(app.getSN(params));
    wx.request({
      url: api.SetLogin,
      data: params,
      method: 'GET',
      success: function (res) {
        let datas = utils.formatStr(res.data);
        // console.log(datas)
        if (datas.code == 0) {//集合页有相关账户
          console.log("获取关联数据成功uid:" + datas.uid);
          wx.setStorageSync('uid', datas.uid);//保存用户信息
          wx.setStorageSync('gid', datas.gid);
          wx.setStorageSync('suid', datas.suid);
          wx.setStorageSync('newbie', datas.newbie);
          wx.setStorageSync('nickname', base64.Base64.decode(datas.name));
          wx.setStorageSync('avatarurl', base64.Base64.decode(datas.avatar));
          wx.setStorageSync('switch', datas.switch);//钱包金币开关1启用2隐藏
          wx.setStorageSync('jump', datas.jump);
          console.log('开关状态: ' + wx.getStorageSync('switch'));
          _this.setData({
            nickname: wx.getStorageSync('nickname'),
            avatarurl: wx.getStorageSync('avatarurl'),
            goldSwitch: datas.switch,
          })
          _this.callBack();//重新获取设备信息
          _this.userStatus(); //获取用户状态信息
          // _this.showMoney();//显示余额
          if (wx.getStorageSync('ouid') != '') {
            _this.creatFriends();
          }
          if (datas.gid != _this.data.gameid) {
            throw new Error('警告--gameid不一致');
          }
          if (_this.data.id != '') {
            wx.redirectTo({
              url: '/pages/changeList/changeList?id=' + _this.data.id + '&ouid=' + _this.data.ouid,
            })
          }
        } else if (datas.code == -3) {//集合页没有相关账户
          _this.setData({
            toLogin: true
          })
          _this.checkUserInfo();//进入传统登录流程
        } else {
          console.log(datas);
        }
        wx.hideLoading();
      },
      fail: res => {
        console.log(res);
      }
    })
  },
  checkUserInfo: function () {//检查用户信息授权
    console.log('集合页没有相关账户,走登录流程');
    let _this = this;
    let userInfo = wx.getStorageSync('haveUserInfo');
    if (userInfo) {
      console.log("找到用户信息缓存");
      wx.getSetting({//再次系统检测一下授权情况
        success: res => {
          if (res.authSetting['scope.userInfo']) {// 已经授权
            console.log("已经授权");
            _this.checkOpenid();
          } else {//没有授权
            wx.hideLoading();
            console.log("没有授权,跳转设置");
            wx.showModal({
              title: '提示',
              content: '您取消了小程序授权！请点击“确定”-“使用我的用户信息”再次授权',
              showCancel: false,
              success: res => {
                wx.openSetting({
                  success: res => {
                    if (res.authSetting["scope.userInfo"]) { // 允许授权
                      console.log('用户点击设置授权');
                      wx.showLoading({
                        title: "数据获取中",
                        mask: true
                      });
                      _this.checkOpenid();
                    } else {
                      console.log('用户拒绝设置授权');
                      _this.authorizeGuide();
                    }
                  },
                  fail: res => { console.log(res) }
                })
              }
            })

          }
        },
        fail: res => {
          console.log('getSetting' + res);
        }
      })
    } else {
      console.log("没有找到用户信息,跳出引导");
      _this.authorizeGuide();
    }
  },
  authorizeGuide: function () {//显示获取用户信息授权界面
    wx.hideLoading();
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#F2F2DA',
    });
    this.setData({
      haveUserInfo: false,
    })
  },
  checkOpenid: function () {//判断有无openid
    let _this = this;
    let openid = wx.getStorageSync('openid');
    if (openid == '') {
      console.log("没有openid");
      _this.wxLogin();
    } else {
      console.log("有openid");
      wx.checkSession({//检验session_key有无过期
        success: res => {
          console.log("session_key有效");
          _this.getUserInfo();//去获取用户信息
        },
        fail: res => {
          console.log('session_key失效');
          console.log("checkSession error: " + JSON.stringify(res));
          _this.wxLogin();
        }
      })
    }
  },
  btnuserInfo: function (e) {//获取用户信息
    if (e.detail.errMsg == 'getUserInfo:ok') {
      console.log('成功获取用户信息')
      // console.log(e.detail.userInfo)
      wx.showLoading({
        title: "数据获取中",
        mask: true
      });
      wx.setStorageSync('haveUserInfo', true);
      this.checkOpenid();
    } else {
      console.log('用户拒绝授权');
      wx.showModal({
        title: '提示',
        content: '小程序功能需要授权才能正常使用噢！请点击“登录-允许”再次授权',
        showCancel: false,
        success: res => {
          console.log(res);
        }
      })
    }
  },
  wxLogin: function () {// 微信登录
    let _this = this;
    wx.login({
      success: res => {
        _this.check(res.code);
      },
      fail: res => {
        console.log('login' + res)
      }
    })
  },
  check: function (code) {// 服务器检测code
    let _this = this;
    let params = {
      code: code,
      tick: Date.parse(new Date()) / 1000,
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
          _this.getUserInfo();//获取用户信息
        } else {
          console.log('请求出错: ' + res);
        }
      },
      fail: res => {
        console.log('check error :' + res);
      }
    })
  },
  getUserInfo: function () {//获取用户信息
    console.log('获取用户信息');
    let _this = this;
    wx.getUserInfo({
      success: res => {
        wx.setStorageSync('userInfo', res.userInfo);
        wx.setStorageSync('nickname', res.userInfo.nickName);
        wx.setStorageSync('avatarurl', res.userInfo.avatarUrl);
        wx.setStorageSync('rawData', res.rawData);
        wx.setStorageSync('signature', res.signature);
        wx.setStorageSync('encryptedData', res.encryptedData);
        wx.setStorageSync('iv', res.iv)
        _this.setData({
          nickname: wx.getStorageSync('nickname'),
          avatarurl: wx.getStorageSync('avatarurl'),
        })
        _this.callBack();
      },
      fail: res => {
        console.log('getUserInfo' + res)
      }
    })
  },
  callBack: function () {
    let _this = this;
    wx.getSystemInfo({
      success: function (res) {
        console.log("获取系统信息");
        let platform;
        if (res.platform == 'devtools') {
          platform = 5;
        } else {
          platform = 0;
        }
        wx.setStorageSync('systemInfo', res);
        wx.setStorageSync('platform', platform);
        wx.setStorageSync('windowWidth', res.windowWidth);
        wx.setStorageSync('windowHeight', res.windowHeight);
        wx.setStorageSync('SDKVersion', res.SDKVersion);
        console.log(_this.data.toLogin)
        if (_this.data.toLogin) {//如果是执行老的登录流程
          console.log("没有关联数据，开始login");
          _this.login();
        }else{
          _this.login();
        }
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
    console.log(params)
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
          wx.setStorageSync('newbie', datas.newbie);
          wx.setStorageSync('jump', datas.jump);
          _this.setData({
            wxLoginCount: 0,
            haveUserInfo: true,
            gamesArr: datas.games,
          });
          // _this.changePic()
          
          if (wx.getStorageSync('ouid') != '') {
            _this.creatFriends();
          }
          if (_this.data.id != '') {
            _this.setData({
              helpType: true,//好友答题
            })
            // wx.navigateTo({
            //   url: '/pages/changeList/changeList?id=' + _this.data.id + '&ouid=' + _this.data.ouid,
            // })
          }
          _this.userStatus();
          // _this.RelevanceUserInfo();//去关联数据
        } else {
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
            _this.authorizeGuide();//不行强制登录一次
          }
        }
      },
      fail: res => {
        console.log('login' + res)
      }
    })
  },
  RelevanceUserInfo: function () {//关联玩主数据
    console.log('进入关联玩主数据程序');
    let _this = this;
    let params = {
      suid: _this.data.suid,
      gid: _this.data.gameid,
      guid: wx.getStorageSync('uid'),

    };
    params['key'] = md5(app.getSN(params));
    console.log(params);
    wx.request({
      url: api.RelevanceUserInfo,
      data: params,
      method: 'GET',
      success: function (res) {
        let datas = utils.formatStr(res.data);
        wx.setStorageSync('suid', datas.suid);
        wx.setStorageSync('gid', datas.gid);
        wx.setStorageSync('switch', datas.switch);//钱包金币开关1启用2隐藏
        console.log('开关状态: ' + wx.getStorageSync('switch'));
        _this.setData({
          goldSwitch: datas.switch,
        })
        _this.userStatus();
        // _this.showMoney();//显示余额
        if (datas.code == 0) {
          console.log(datas);
          if (_this.data.goldSwitch == 1) {
            _this.navigateCompute();//处理缓存的金币
          }
        } else {
          console.log('RelevanceUserInfo error' + JSON.stringify(datas));
        }
      },
      fail: function (res) {
        console.log('error' + JSON.stringify(res))
      }
    })
  },
  navigateCompute: function () {//绑定后处理缓存的金币
    let _this = this;
    let newbie = wx.getStorageSync('newbie');
    let gid = wx.getStorageSync('gid');
    let guid = wx.getStorageSync('uid');
    let suid = wx.getStorageSync('suid');
    if ((newbie != 1) && (suid > 0)) {//老用户且已关联
      console.log('绑定后处理缓存的金币');
      let params = {
        gid: gid,
        guid: guid,
        suid: suid,
      }
      params['key'] = md5(app.getSN(params));
      console.log(params);
      wx.request({
        url: api.UserGetGoldAndindingSuid,
        data: params,
        method: 'GET',
        success: function (res) {
          let datas = utils.formatStr(res.data);
          console.log(datas);
          if (datas.code == 0) {
            console.log('处理绑定后处理缓存的金币成功');
          } else {
            console.log('处理绑定后处理缓存的金币失败');
          }
        },
        fail: res => {
          console.log('error' + JSON.stringify(res));
        }
      })
    }
  },
  showGuide: function (e) {//记录授权的formid
    let formID = e.detail.formId;
    console.log(formID);
  },
  showMoney: function () {//显示余额
    let _this = this;
    let newbie = wx.getStorageSync('newbie');
    let suid = wx.getStorageSync('suid');
    // let newbie = 1;
    // let suid = 0;
    if ((suid == 0) && (newbie == 1)) {//如果是新用户且没有关联
      console.log('显示红包');
      _this.setData({
        redPacket: true,
        openredPacket: false,
        money: '0'
      })
    } else if (suid == 0) {
      _this.setData({
        money: '2.00'
      })
      _this.helpAnswer();//好友答题
    } else if (suid > 0) {//已关联
      let params = {
        suid: suid
      }
      params['key'] = md5(app.getSN(params));
      wx.request({
        url: api.unRead,
        data: params,
        method: 'GET',
        success: function (res) {
          let datas = utils.formatStr(res.data);
          if (datas.code == 0) {
            console.log("获取余额成功");
            let money = utils.toDecimal2(datas.money);
            _this.setData({
              money: money
            })

          } else {
            console.log('unRead error: ' + res.data);
          }
        },
        fail: res => {
          console.log('unRead error' + JSON.stringify(res));
        }
      })
      _this.helpAnswer();//好友答题
    }
    
  },
  closeGuide: function (e) {//关闭红包、显示打开
    this.setData({
      redPacket: false,
      openredPacket: true,
      money: '2.00'
    })
  },
  closeOpenGuide: function (e) {//关闭红包跳转玩主
    this.setData({
      openredPacket: false,
    });
    api.navigateToMiniProgram();
  },
  closeRedPacket: function () {//关闭红包，显示手
    this.setData({
      redPacket: false,
      openredPacket: false,
      showHandGuide: true,
    })

    this.showHandGuide();
  },
  showHandGuide: function () {//手的指引
    let _this = this;
    let count = 0;
    let t = 160;
    let handInterval = setInterval(function () {
      if (count > 20) {
        clearInterval(handInterval);
        _this.setData({
          handRight: 20,
          handTop: 130,
          showHandGuide: false,
        })
        _this.helpAnswer();//好友答题
      } else {
        if (_this.data.handRight == 20) {
          _this.setData({
            handRight: 15,
            handTop: 140
          })
        } else {
          _this.setData({
            handRight: 20,
            handTop: 130
          })
        }
        count++;
      }
    }, t)
  },
  helpAnswer: function () {//显示好友答题
    let _this = this;
    if (_this.data.helpType) {//如果来着转发帮好友答题显示完手后跳转要答的题目
      _this.setData({
        helpType: false
      })
      wx.navigateTo({
        url: '/pages/changeList/changeList?id=' + _this.data.id + '&ouid=' + _this.data.ouid,
      })
    }
  },

  onShareAppMessage: function (e) {//获取个人信息
    var _this = this;
    let wanzhuId = api.ShareApp();
    if (e.from == 'button') {
      _this.setData({
        shareImg: '../../res/xuming.jpg',
        shareTitle: '跟着我左手、右手，来个大旋转？',
        shareUrl: '/pages/index/index?suid=' + wanzhuId,
      })
    } else if (e.from == 'menu') {
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
        if (app.globalData.ResurreCard < 2) {
          app.globalData.ResurreCard = app.globalData.ResurreCard + 1
        }
        _this.setData({
          showHelp:false,
          ResurreCard: app.globalData.ResurreCard
        })
        
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        })
       
      },
      fail: function (res) {　// 转发失败之后的回调
        if (res.errMsg == 'shareAppMessage:fail cancel') {// 用户取消转发　　
          wx.showToast({
            title: '取消转发',
            icon: 'success',
            duration: 2000
          })
        }
      },
    }
  },
  userStatus: function () {//获取用户状态信息
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
        wx.hideLoading();
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
          // if (wx.getStorageSync('oqid') == '' || wx.getStorageSync('ouid') == wx.getStorageSync('uid')) {
           
          // } else {
          //   _this.getOtherQuestion();
          // }
          if (_this.data.goldSwitch == 1) {
            _this.showMoney();//显示余额
          } else {
            if (_this.data.id != '') {
              wx.navigateTo({
                url: '/pages/changeList/changeList?id=' + _this.data.id + '&ouid=' + _this.data.ouid,
              })
            }
          }
        } else {
          console.log('status error: ' + JSON.stringify(res));
        }
      },
      fail: res => {
        console.log('status error: ' + JSON.stringify(res));
      }
    })
  },
  GoIndex: function (e) {//开始游戏
    wx.redirectTo({
      url: '/pages/Checkpoint/checkpoint'
    })
    // var formID = e.detail.formId;
    // getFormId(1, formID)
  },
  supur:function(e){
    this.setData({
      showHelp:true
    })
  },
  closeBtn:function(e){
    this.setData({
      showHelp: false
    })
  },
  wait: function (e) {//功能暂未开放
    wx.showToast({
      icon: 'success',
      duration: 2000,
      title:'功能暂未开放'
    })
  },
  GoHistory: function (e) {//历史选项
    wx.navigateTo({
      url: '/pages/charts/charts'
    })
    // var formID = e.detail.formId;
    // getFormId(2, formID)
  },
  model: function (e) {//转盘模式
    wx.navigateTo({
      url: '/pages/model/model',
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
  moreGame: function (e) {//更多好玩
    // var formID = e.detail.formId;
    // getFormId(3, formID)
    api.navigateToMiniProgram();
  },
  bindViewTap: function (e) {//事件处理函数
    console.log(e);
    // wx.navigateTo({
    //   url: '../logs/logs'
    // })
  },

  //跳转小游戏
  GoGames:function(e){
    let _this = this;
    wx.navigateToMiniProgram({
      appId: _this.data.appid,
      path: _this.data.GamePath,
      extraData: {
        foo: 'bar'
      },
      envVersion: 'develop',
      success(res) {
        // 打开成功
        console.log('打开小游戏成功')
      }
    })
  },
  //换图片
  changePic:function(e){
    let _this = this;
    if(_this.data.gamesArr.length>0){
      let m = _this.data.gamesArr.length - 1
      let random = Math.floor(Math.random() * m)
      console.log(random)
      console.log(_this.data.gamesArr[random]['icon'])
      _this.setData({
        indexIcon: _this.data.gamesArr[random]['btn'],
        appid: _this.data.gamesArr[random]['appid'],
        GamePath: _this.data.gamesArr[random]['path'],
      })
      
      
    }
  },

  //动画效果

  animationPic:function(e){
    let _this = this
    let  t = setInterval(function () {
      animation1.rotate(_this.data.deg).step({
        transformOrigin: "50% 50%",
        timingFunction: 'ease-in',
        duration: 50
      })
      let deg = -(_this.data.deg)
      _this.setData({
        animationData: animation1.export(),
        deg: deg
      })
    }, 100)

    setTimeout(function(e){
      clearInterval(t)
    },800)
  },
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