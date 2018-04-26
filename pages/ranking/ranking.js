const util = require('../../utils/util.js');
const API = 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&_=1523256974045';
Page({
  data:{
    topList: []
  },
  onLoad: function(){
    let that = this;
    util.showLoading();
    util.request(API,'', function(res){
      that.setData({
        topList: res.data.data.topList
      });
      util.hideLoading();
    })
  }
})

