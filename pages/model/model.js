// pages/model/model.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
  threeModel:function(e){
    let _this = this;
    app.globalData.scene = 0;
    wx.redirectTo({
      url: '/pages/Checkpoint/checkpoint',
    })
  },

  fourModel: function (e) {
    let _this = this;
    app.globalData.scene = 1;
    wx.redirectTo({
      url: '/pages/Checkpoint/checkpoint',
    })
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