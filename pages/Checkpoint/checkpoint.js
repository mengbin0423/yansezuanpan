// pages/Checkpoint/checkpoint.js
const app = getApp();
const md5 = require('../../utils/md5.js');
const base64 = require('../../utils/base64.js');
const utils = require('../../utils/util.js');
const api = require('../../utils/api.js');

var animation = wx.createAnimation({}) 
var animation1 = wx.createAnimation({})
var animation2 = wx.createAnimation({})

var t
var jumpof
var interval
var residue=4 //余数

let  successMusic='music/success.mp3'
let  failMusic = 'music/fail.mp3'
let  xuanzhuanMusic = 'music/xuanzhuan.mp3'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    score:0,
    mark:999,
    shareGroup:false,
    donghua: true,  
    startNow:true,//开始
    animationData:{},
    num:0,
    indexNum:0,
    shareImg:'',
    id:'',
    i:1,
    Resurre:true,
    ResurreCard: 0,
    timer:10,
    deg:0,
    background: '',
    panBg:'#E6572C',
    percent:0,
    zpShow:false,//转盘
    scoreShow:false,//分数
    threeModel:true,
    backgroundList:[],
    upline:false,
    uplinelong:false,
    shareWrong:false,
    shareSuccess:false,
    resultMask:false,
    startGame:false,
    stopAnimation:false,
    bgColor: ['#E6572C', '#45E688', '#F2D249','#2C8CE6'],
    challengeId:0, 

    gift: false,//玩主金币奖励显示
    giftflag: true,//金币结算弹框只显示一次
    goldSwitch: 2,//开关
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    var _this = this;
    if (app.globalData.scene==0){
      var bgColor = ['#E6572C', '#2C8CE6', '#F2D249']
      _this.setData({
        threeModel:true,
        bgColor: bgColor,
        ResurreCard:app.globalData.ResurreCard
      }) 
      residue = 3
    }else{
      var bgColor = ['#E6572C', '#45E688', '#F2D249', '#2C8CE6']
      _this.setData({
        threeModel:false,            
        bgColor:bgColor,
        ResurreCard: app.globalData.ResurreCard
      }) 
      residue = 4
    }
    
    var index = Number(e.index) + 1;
    if (JSON.stringify(e) != "{}") {
      if (e.mark != undefined) {
        _this.setData({
          mark:e.mark,
          challengeId:e.id
        })
        wx.setStorageSync('challengeId', e.id)
      }
    }
    _this.percent();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    clearInterval(interval)
    wx.showShareMenu({
      withShareTicket: true
    })
    var _this = this;
    let wanzhuId = api.ShareApp();
    var checkPoint = Number(wx.getStorageSync('qid'))+1;
    if(e.from == 'button'){
      _this.setData({
        shareImg:'../../res/xuming.jpg',
        shareTitle: '颜色转转转' + _this.data.score + '分,敢来挑战我吗？',
        shareUrl: '/pages/changeList/changeList?ouid=' + wx.getStorageSync('uid') + '&id=' + _this.data.id + '&suid=' + wanzhuId,
      })
    }else if(e.from == 'menu'){
      _this.setData({
        shareImg: '../../res/zuanfa.jpg',
        shareTitle: '颜色转转转玩到手残，就问你敢不敢挑战？',
        shareUrl: '/pages/index/index?suid=' + wanzhuId,
      }) 
    }
   
    return {
      title: _this.data.shareTitle,
      imageUrl:_this.data.shareImg,
      path: _this.data.shareUrl,
      success: function (res) {
        if (app.globalData.ResurreCard<2){
          app.globalData.ResurreCard = app.globalData.ResurreCard+1;
        }
        if (res.shareTickets==undefined){
          if (app.globalData.ResurreCard == 0) {
            _this.setData({
              Resurre: false,
              ResurreCard: app.globalData.ResurreCard
            })
          }
          _this.setData({
            shareWrong: true,
            resultMask:true
          });
          setTimeout(function () {
            _this.setData({ shareWrong: false })
          }, 2000)
          _this.run()
        }else{
          _this.setData({
            donghua:true,
            resultMask: false,
            stopAnimation: false,
            shareGroup:true,
            shareSuccess:true,
            timer:0,
            backgroundList:[],
            indexNum:0,
            panBg: '#E6572C',
          })
          var don = setTimeout(function () {
            _this.setData({ shareSuccess: false }) 
            _this.donghua()  
          }, 1000)
        }  
      },
      fail: function (res) {　// 转发失败之后的回调
        if (res.errMsg == 'shareAppMessage:fail cancel') {// 用户取消转发　　
          if (app.globalData.ResurreCard == 0) {
            _this.setData({
              Resurre: false,
              ResurreCard: app.globalData.ResurreCard
            })
          }
          _this.setData({
            resultMask: true
          });
          _this.run()
        } 
　　　 },
    }
  },


  midBtnYes:function(e){
    let _this = this
    _this.setData({
      donghua: true,
      resultMask: false,
      stopAnimation: false,
      shareGroup: true,
      shareSuccess: true,
      timer: 0,
      startNow: false,
      zpShow: true,
      startGame: true,
      scoreShow: true,
      backgroundList: [],
      indexNum: 0,
      panBg: '#E6572C',
    })
    app.globalData.ResurreCard = 0;
    var don = setTimeout(function () {
      _this.setData({ shareSuccess: false })
      _this.donghua()
    }, 1000)
  
  },

  onShow: function () {
    this.animation = wx.createAnimation({
      duration: 35,
      timingFunction: 'ease-in', // "linear","ease","ease-in","ease-in-out","ease-out","step-start","step-end"
      delay: 0,
      transformOrigin: 'center 30% 0',
      success: function (res) {
        console.log("res")
      }
    })
  },

  onHide: function () {
    // app.globalData.scene = 0;
  },
  
  //点击旋转
  turnOff:function(e){
    var _this = this;
    var deg = _this.data.deg
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.src = xuanzhuanMusic
    innerAudioContext.play()
    if (_this.data.startNow) {
      _this.setData({
        startNow: false,
        zpShow:true,
        startGame:true,
        scoreShow:true
      })
      _this.donghua();
      wx.setStorageSync('score', _this.data.score)
    } else { 
      var n = this.data.num;
      if(n<0){
        n = n + residue
      }
      var bgColor = _this.data.bgColor;  
      if(_this.data.threeModel){
        _this.animation.rotate(deg).step({
          transformOrigin: '50% 34%',
        });
      }else{
        _this.animation.rotate(deg).step({
          transformOrigin: 'center center',
        });
      }
     
      _this.setData({
        animationData : _this.animation.export(),
        num : n,
        panBg : _this.data.bgColor[n % residue]
      }) 
    } 
  },

  turnLeft:function(){
    if (app.globalData.scene==0){ 
      var bgColor = ['#E6572C', '#2C8CE6', '#F2D249']
      this.setData({
        bgColor: bgColor,
        num:this.data.num-1,
        deg: this.data.deg - 120
      }) 
    }else{
      var bgColor = ['#E6572C', '#45E688', '#F2D249', '#2C8CE6']
      this.setData({
        bgColor: bgColor,
        num: this.data.num - 1,
        deg: this.data.deg - 90
      }) 
    }
    this.turnOff()
  },

  turnRight:function(){
    if (app.globalData.scene == 0) {
      var bgColor = ['#E6572C', '#2C8CE6', '#F2D249']
      this.setData({
        bgColor:bgColor,
        num:this.data.num+1,
        deg: this.data.deg + 120
      }) 
    } else {
      var bgColor = ['#E6572C', '#45E688', '#F2D249', '#2C8CE6']
      this.setData({
        bgColor: bgColor,
        num: this.data.num + 1,
        deg: this.data.deg + 90
      }) 
    }
    this.turnOff()
  },

  //小球运动
  donghua: function () {
    let _this = this
    let i = _this.data.i;
    let seconds
    if(i<=10){
      seconds = 1000
    }else if(i>10 && i<=20){
      seconds = 900
    }else if(i>20 && i<=40){
      seconds = 800
    }else if(i>40 && i<=60){
      seconds = 750
    } else if (i > 60 && i <= 80) {
      seconds = 700
    } else if (i > 80 && i <= 110) {
      seconds = 650
    } else if (i > 110 && i <= 140) {
      seconds = 600
    } else if (i > 140 && i <= 180) {
      seconds = 550
    } else if (i > 180) {
      seconds = 500
    }
    if (_this.data.stopAnimation){
       clearTimeout(t)
       return -1;
    }else{
      var nub = Math.floor(Math.random() * residue); 
      let backgrdList = _this.data.backgroundList;
      backgrdList.push(_this.data.bgColor[nub])
      _this.setData({
        ["background" + i]: _this.data.bgColor[nub],
        backgroundList: backgrdList
      })
      t = setTimeout(function () {
        animation1.translateY(426).step({
          timingFunction: 'ease-in',
          duration: 1800
        })
        _this.setData({
          ["animationData" + i]: animation1.export(),
          
        })
      }.bind(_this), seconds)
      _this.setData({
        i: i + 1
      })
      if(i<=10){
        setTimeout(function () {
          _this.donghua()
          _this.checkBg(1800)
        }.bind(_this), seconds)
      }else if (i>10 && i<=20) {
        setTimeout(function () {
          _this.donghua()
          _this.checkBg(1800)
        }.bind(_this), seconds)
      } else if (i > 20 && i <= 40) {
        setTimeout(function () {
          _this.donghua()
          _this.checkBg(1900)
        }.bind(_this), seconds)
      } else if (i > 40 && i <= 60) {
        setTimeout(function () {
          _this.donghua()
          _this.checkBg(1900)
        }.bind(_this), seconds)
      } else if (i > 60 && i <= 80) {
        setTimeout(function () {
          _this.donghua()
          _this.checkBg(1900)
        }.bind(_this), seconds)
      } else if (i > 80 && i <= 100) {
        setTimeout(function () {
          _this.donghua()
          _this.checkBg(1900)
        }.bind(_this), seconds)
      } else if (i > 100 && i <= 120) {
        setTimeout(function () {
          _this.donghua()
          _this.checkBg(2000)
        }.bind(_this), seconds)
      } 
     
    } 
  },
  
  checkBg:function(tim){
    var _this = this;
    var a =  setTimeout(function(){
      let m = _this.data.indexNum;
      let bgList = _this.data.backgroundList;
      var pointBg = bgList[m];  
      _this.setData({
        indexNum:m+1
      })
      var score = _this.data.score;
      if (_this.data.stopAnimation) {
        pointBg = '';
        _this.setData({
          panBg: ''
        })
      }
      if (pointBg == _this.data.panBg) {
        if (pointBg != '' && _this.data.panBg != '') {
          _this.setData({
            score: score + 1,
            ['background'+(m+1)]:''
          })
          if (_this.data.score > _this.data.mark) {
            if (_this.data.score <= 9) {
              _this.setData({
                upline: true
              })
            } else {
              _this.setData({
                upline: false,
                uplinelong: true
              })
            }
          }
          const innerAudioContext = wx.createInnerAudioContext()
          innerAudioContext.src = successMusic
          innerAudioContext.play()     
        }
      } else {
        clearTimeout(a)
        clearTimeout(t)
        wx.vibrateLong({
          success: function (e) {
            _this.setData({
              stopAnimation: true,
              donghua: false,
            })
          }
        })
        const innerAudioContext = wx.createInnerAudioContext()
        innerAudioContext.src = failMusic
        innerAudioContext.play()
        setTimeout(function (e) {
          if (_this.data.shareGroup){
            _this.jumpOff();
            clearInterval(interval)
            _this.setData({
              stopAnimation: true,
              donghua: false
            })
            _this.submit(_this.data.score)
          } else {
            if (app.globalData.ResurreCard == 0) {
              _this.setData({
                Resurre: false,
                ResurreCard: app.globalData.ResurreCard
              })
            }
            _this.setData({
              stopAnimation: true,
              resultMask: true,
              donghua: false
            })
            _this.submit(_this.data.score)
            _this.run()
          }
        }, 1800)
      }
      wx.setStorageSync('score', score)  
      clearTimeout(a)
    }, tim)
    if (this.data.stopAnimation) {  
      clearTimeout(a)  
    }
  },

  //点击跳过
  jumpOff:function(e){
    var _this = this;
    _this.setData({
        resultMask: false,
        timer:0
    })
    clearTimeout(interval)
    wx.redirectTo({
      url: '/pages/result/result',
    })
  },

  beginGame:function(){
    var _this = this;
    if(_this.data.startNow){
      _this.setData({
        startNow: false,
        zpShow:true,
        startGame:true,
        scoreShow:true
      })
      _this.donghua();
      wx.setStorageSync('score', _this.data.score)
    }else{
      // _this.turnOff()
    }
  },

  run:function() {
    var _this = this
    var times = _this.data.timer;
    interval = setInterval(function () {
      if (times == 0) {
        clearInterval(interval);
        let pages = getCurrentPages()    //获取加载的页面
        let currentPage = pages[pages.length - 1]    //获取当前页面的对象
        let url = currentPage.route
        _this.setData({
          stopAnimation: false,
          resultMask: false,
          resultUrl:url
        })
        if (_this.data.resultUrl != 'pages/result/result') {
          wx.redirectTo({
            url: '/pages/result/result',
          })
        }

      } else if (_this.data.shareGroup) {
        clearInterval(interval);
      } else {
        times--;
        _this.setData({
          timer: times
        })
      }
    }, 1000)
  },

  //更多好玩
  moreFun:function(e){
    // wx.navigateToMiniProgram({
    //   appId: 'wxfd7eaa3e65115a73',
    // })
    var formID = e.detail.formId;
    getFormId(3, formID)
    api.navigateToMiniProgram();
  },

  //比例
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

  //提交分数
  submit:function(score){
    var _this = this;
   
    var params={
      uid:wx.getStorageSync('uid'),
      id: _this.data.challengeId,
      level_id:score,
      tick: Date.parse(new Date()) / 1000
    }
    params['key'] = md5(app.getSN(params));
    wx.request({
      url: api.report,
      method:'GET',
      data:params,
      success:function(res){
        let datas = utils.formatStr(res.data);
        if(datas.code==0){
          wx.setStorageSync('id', datas[0].id);  
          _this.setData({
            id: datas[0].id
          })
          if (this.data.goldSwitch == 1) {
            if (score >= 5) {
              console.log('大于5局可以存金币了');
              _this.goldSettlement();//进入金币结算
            }
          }
        }
      }
    })
  },
  goldSettlement: function () {//玩主金币结算
    console.log('进入玩主金币结算');
    let _this = this;
    let suid = wx.getStorageSync('suid');
    let guid = wx.getStorageSync('uid');
    let gid = wx.getStorageSync('gid');
    console.log(suid);
    if (_this.data.giftflag) {//如果这局还没弹过
      _this.setData({
        gift: true,
        giftflag: true,//控制是否只弹出一次
      });
      setTimeout(function () {
        _this.setData({
          gift: false
        });
      }, 1000)
    }
    if (suid && (suid != 0)) {//如果有suid
      let params = {
        suid: suid,
        gid: gid
      };
      params['key'] = md5(app.getSN(params));
      wx.request({
        url: api.TrueGameAddGold,
        data: params,
        method: 'GET',
        success: function (res) {
          let datas = utils.formatStr(res.data);
          if (datas.code == 0) {
            console.log('已结算');
            console.log(datas);
          } else {
            console.log(datas);
          }
        },
        fail: res => {
          console.log('goldSettlement error :' + JSON.stringify(res));
        }
      });
    } else if (suid == 0) {//如果suid=0,没关联玩主，把金币缓存
      let params = {
        guid: guid,
        gid: gid
      };
      params['key'] = md5(app.getSN(params));
      wx.request({
        url: api.AddNotSetSuidTheGameUserAGold,
        data: params,
        method: 'GET',
        success: function (res) {
          let datas = utils.formatStr(res.data);
          if (datas.code == 0) {
            console.log('已缓存金币收益');
            console.log(datas);
          } else {
            console.log(datas);
          }
        },
        fail: res => {
          console.log('goldSettlement error :' + JSON.stringify(res));
        }
      });
    }
  },
})

function sort(arr){
  for (var j = 0; j < arr.length; j++) {
    //两两比较，如果前一个比后一个大，则交换位置。
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] != arr[j]) {
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
    }
  }
}

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




