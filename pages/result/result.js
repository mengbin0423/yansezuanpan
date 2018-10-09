// pages/result/result.js
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
    level:'Lv.1原地转圈',
    score:0,
    Img:'',
    yuanjiaoju:'../../res/yuanjiaoju.png',
    yuanjiaojuju: '../../res/yuanjiaojuju.png',
    saveSuccess:false,
    isMe:true,
    avatarUrl:'../../res/zuanpan.png',
    percent:0,
    designation:'',
    visiby:'block',
    showHelp:false,
    ResurreCard:0,
    text:'myCanvas',
    sahreImg:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    var score = wx.getStorageSync('score')
    var avatarUrl = wx.getStorageSync('avatarurl')
    let ouid = wx.getStorageSync('ouid');
    let uid = wx.getStorageSync('uid')
    _this.setData({
      ResurreCard: app.globalData.ResurreCard
    })
    if(ouid !='' && ouid!=uid){
      _this.setData({
        isMe:false
      })
    }
    _this.setData({
      score:score,
       avatarUrl: avatarUrl
    })
    _this.level();
    _this.percent(); 
    
    wx.downloadFile({
      url: wx.getStorageSync('avatarurl'),
      success: function (res) {
        _this.setData({
          avatarUrl: res.tempFilePath,
          completeNum: _this.data.completeNum + 1
        })
      }
    })
    wx.showLoading({
      title: '结果生成中...',
    })
    setTimeout(function(){
      _this.drawImg();
      
    },1000)
    setTimeout(function(){
      wx.getSystemInfo({
        success: function (res) {
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: 330,
            height: 330,
            destWidth: 170 * res.pixelRatio,
            destHeight: 130 * res.pixelRatio,
            fileType:'jpg',
            canvasId: 'shareCanvas',
            success: function (res) {
              wx.hideLoading()
              _this.setData({
                shareImg: res.tempFilePath,
                Img: res.tempFilePath
              })
              console.log(_this.data.shareImg)
            },
            fail: function (res) {
              console.log(res)
            }
          })
        },
      })
    },2000)

    
  },

  level:function(){
    var score = this.data.score;
    if(score<6){
      this.setData({
        level:'Lv.1原地转圈',
        Img:'../../res/1.png',
        designation:'原地转圈'
      })
    }else if(score >=6 && score <=10){
      this.setData({
        level: 'Lv.2尴尬静止',
        Img: '../../res/2.png',
        designation: '尴尬静止'
      })
    } else if (score > 10 && score <= 18) {
      this.setData({
        level: 'Lv.3窒息操作',
        Img: '../../res/3.png',
        designation: '窒息操作'
      })
    } else if (score > 19 && score <= 26) {
      this.setData({
        level: 'Lv.4告别手残',
        Img: '../../res/4.png',
        designation: '告别手残'
      })
    } else if (score > 26 && score <= 37) {
      this.setData({
        level: 'Lv.5跌跌撞撞',
        Img: '../../res/5.png',
        designation: '跌跌撞撞'
      })
    } else if (score > 37 && score <= 58) {
      this.setData({
        level: 'Lv.6转盘上路',
        Img: '../../res/6.png',
        designation: '转盘上路'
      })
    } else if (score > 58 && score <= 70) {
      this.setData({
        level: 'Lv.7灵活转动',
        Img: '../../res/7.png',
        designation: '灵活转动',

      })
    } else if (score > 70 && score <= 82) {
      this.setData({
        level: 'Lv.8转盘熟手',
        Img: '../../res/8.png',
        designation: '转盘熟手',
      })
    } else if (score > 82 && score <= 94) {
      this.setData({
        level: 'Lv.9旋转跳跃',
        Img: '../../res/9.png',
        designation: '旋转跳跃',
      })
    } else if (score > 94 && score <= 110) {
      this.setData({
        level: 'Lv.10转盘高手',
        Img: '../../res/10.png',
        designation: '转盘高手'
      })
    } else if (score > 110 && score <= 130) {
      this.setData({
        level: 'Lv.11转盘精英',
        Img: '../../res/11.png',
        designation: '转盘精英'
      })
    } else if (score > 130 && score <= 160) {
      this.setData({
        level: 'Lv.12转盘大师',
        Img: '../../res/12.png',
        designation: '转盘大师'
      })
    } else if (score > 160 && score <= 200) {
      this.setData({
        level: 'Lv.13转盘传说',
        Img: '../../res/13.png',
        designation: '转盘传说'
      })
    } else if (score > 200) {
      this.setData({
        level: 'Lv.14斗转星移',
        Img: '../../res/14.png',
        designation: '斗转星移'
      })
    }
  },

  xuanyao:function(e){
    this.setData({
      showHelp:true,
      visiby:'none'
    })
  },

  closeBtn:function(e){
    this.setData({
      showHelp: false, 
      visiby: 'block'
    })
  },

  percent:function(){
    var _this = this;
    var score = _this.data.score;
    if(score<=10){
      _this.setData({
        percent:'88%'
      })
    }else if(score >10 && score<=30){
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
  onShareAppMessage: function (e) {
    var _this = this;
    let wanzhuId = api.ShareApp();
    if(e.from=='button'){
      _this.setData({
        shareImg: _this.data.shareImg,
        shareTitle: '左右脑的试炼,'+_this.data.score+'分就是最好的证明！.',
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
        _this.setData({
          showHelp:false,
          visiby: 'block'
        })
        if (app.globalData.ResurreCard < 2) {
          app.globalData.ResurreCard = app.globalData.ResurreCard + 1
        }
        _this.setData({
          showHelp: false,
          ResurreCard: app.globalData.ResurreCard
        })
      }
    } 
  },

  drawImg:function(){
    let _this = this;
    var context = wx.createCanvasContext('shareCanvas')
    var img = _this.data.Img
    context.drawImage(img, 0, 0, 320, 320)
    const grd = context.createCircularGradient(275, 50, 30)

    var img1 = _this.data.yuanjiaoju
    context.drawImage(img1, 100, 270, 125, 40)

    context.setFontSize(12)
    context.fillText('- 已超越' + _this.data.percent + '的玩家 -', 100, 260)

    context.fill()
    context.setFontSize(20)
    context.setFillStyle('#ffffff')
    context.fillText(_this.data.score, 150, 296)

    context.setFontSize(14)
    context.setFillStyle('#ffffff')
    context.setTextAlign('center')
    context.fillText('分', 180, 295)

    var img2 = _this.data.yuanjiaojuju
    context.drawImage(img2, 215, 10, 100, 25)

    circleImg(context, this.data.avatarUrl, 205, 10, 12.5);
    
    context.beginPath();
    context.setFillStyle('black')
    context.arc(217, 22, 12.5, 0, 2 * Math.PI);
    context.stroke();

    context.setFontSize(12)
    context.setFillStyle('black')
    context.setTextAlign('left')
    context.fillText(_this.data.level, 235, 27)
    context.draw()
  },

  saveImage:function(e){
    console.log(1)
    let _this = this;
    wx.getSystemInfo({
      success: function(res) {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: 330,
          height: 330,
          destWidth: 200 * res.pixelRatio,
          destHeight: 180 * res.pixelRatio,
          fileType: 'jpg',
          canvasId: 'shareCanvas',
          success: function (res) {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success(res) {
                wx.showToast({
                  title: '保存成功',
                  icon: 'success',
                  duration: 2000
                })
                
              }
            })

          },
          fail: function (res) {
            console.log(res)
          }
        })
      },
    }) 
  },

  gameAgin:function(e){
    wx.redirectTo({
      url: '/pages/Checkpoint/checkpoint',
    })
  },

  goback:function(e){
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },

  goChangList:function(e){
    wx.redirectTo({
      url: '/pages/changeList/changeList?ouid=' + wx.getStorageSync('ouid')+'&id=' + wx.getStorageSync('challengeId'),
    })
  },
  enterMore: function (e) {//进入更多好玩
    api.navigateToMiniProgram();
  },
})

 
function circleImg(ctx, img, x, y, r) {
  ctx.save();
  var d = 2 * r;
  var cx = x + r;
  var cy = y + r;
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.clip();
  ctx.drawImage(img, x, y, d, d);
  ctx.restore();
}

