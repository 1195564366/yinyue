const util = require('../../utils/util.js');
const HotSearchAPI = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&_=1523361162670';  //热门数据接口
const limit = 20; //每次搜索条数,最大30条
let page = 1;  //页码
let searchRResultNum = 0; //搜索结果数量
let searchValue;  //搜索关键词
Page({
  data:{
    deleteShow: true,   //控制搜索删除按钮显示隐藏
    cancelShow: true,   //控制搜索取消按钮显示隐藏
    hotShow: false, //控制热门数据显示隐藏
    searchValue: '',  //搜索框内容
    searchDataShow: true,   //搜索数据显示隐藏
    hotSearchData: [],   //热门搜索数据
    searchRResultData: [],  //搜索结果数据
    zhida: {},  //保存返回的歌手数据
    type: 0,
    searchHistoryShow: true,
    searchHistory: [],  //搜索历史
    mainHeight: 0
  },
  onLoad: function(){
    let that = this;
    let hostData = [];  //暂时保存热门数据
    //页面加载请求搜索热门数据
    util.showLoading();
    util.request(HotSearchAPI,'',function(res){
      hostData = res.data.data.hotkey;
      for(let i = 0; i < 10; i++) {   //随机取出10条热门数据
        let index = Math.floor((Math.random() * hostData.length));
        that.setData({
          hotSearchData: that.data.hotSearchData.concat(hostData[index])
        })
        hostData.splice(index,1);
      }
      util.hideLoading();
    })
  },
  onReady: function(){
    let that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          mainHeight: res.windowHeight
        })
      },
    }),
    wx.getStorage({
      key: 'happy_music',
      success: function(res) {
        that.setData({
          searchHistory: res.data
        })
      },
    })
  },
  //搜索框输入事件
  searchKeyip: function(e){
    let that = this;
    let cursor = e.detail.cursor; //搜索框字符长度
    if (cursor > 0) {
      that.setData({
        deleteShow: false,
        searchValue: e.detail.value
      })
    } else {
      that.setData({
        deleteShow: true,
        searchValue: e.detail.value
      })
    }
  },
  //搜索框获得焦点事件
  searchFocus: function(e){
    let that = this;
    that.setData({
      cancelShow: false,
      hotShow: true
    });
    if (e.detail.value.length === 0 && that.data.searchHistory.length !== 0){
      that.setData({
        searchDataShow: true,
        searchHistoryShow: false
      });
    }
  },
  //删除按钮点击事件
  deleteBtn: function(){
    let that = this;
    that.setData({
      deleteShow: true,
      searchValue: ''
    })
  },
  //取消事件
  cancelBtn: function(){
    let that = this;
    that.setData({
      deleteShow: true,
      cancelShow: true,
      hotShow: false,
      searchHistoryShow: true,
      searchValue: '',
      searchRResultData: [],
      zhida: {},
      type: 0
    })
  },
  //热门数据点击事件
  hotItemClick: function(e){
    let that = this;
    that.setData({
      deleteShow: false,
      cancelShow: false, 
      hotShow: true,
      searchValue: e.currentTarget.dataset.name
    });
    that.searchRequest(that.data.searchValue, page, limit);
  },
  //加载下一条搜索数据
  loadNextsearchData: function(){
    let that = this;
    page++;
    if (searchRResultNum <= that.data.searchRResultData.length) {
      wx.showToast({
        title: '已全部加载',
        duration: 2000
      })
    }else{
      that.searchRequest(that.data.searchValue, page, limit)
    }
  },
  //搜索按钮事件
  searchBtnClick: function(){
    let that = this;
    page = 1;
    that.setData({
      searchRResultData: [],
      type: 0,
      zhida: {}
    });
    that.searchRequest(that.data.searchValue, page, limit);
  },
  //搜索请求
  searchRequest: function (keyWord, page, limit){
    let that = this;
    that.setData({
      searchDataShow: false,
      searchHistoryShow: true
    })
    let arraySearch= [];
    if ( !that.isInArray(that.data.searchHistory, that.data.searchValue) ){
      if ( that.data.searchHistory.length >= 7 ){
        that.data.searchHistory.pop();
      }
      that.setData({
        searchHistory: arraySearch.concat(that.data.searchValue).concat(that.data.searchHistory)
      });
      wx.setStorage({   //将搜索历史存储到缓存中
        key: 'happy_music',
        data: that.data.searchHistory
      })
    }
    let SearchAPI = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp?g_tk=5381&uin=2665601904&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&w=' + keyWord + '&zhidaqu=1&catZhida=1&t=0&flag=1&ie=utf-8&sem=1&aggr=0&perpage=20&n=' + limit +'&p=' + page +'&remoteplace=txt.mqq.all&_=1523360980415';
    util.showLoading();
    util.request(SearchAPI,'',function(res){
      // console.log(res.data.data.song);
      if (res.data.data.song.totalnum === 0){
        wx.showToast({
          title: '未查询到歌曲',
          duration: 2000
        })
        return
      }
      // console.log(res.data.data);
      if (res.data.data.song.curpage === 1 ){
        if (res.data.data.zhida.type === 2 ){
          that.setData({
            type: res.data.data.zhida.type,
            zhida: res.data.data.zhida
          })
        }
      }
      searchRResultNum = res.data.data.song.totalnum;
      that.setData({
        searchRResultData: that.data.searchRResultData.concat(res.data.data.song.list)
      })
      util.hideLoading();
    })
  },
  //判断数组中是否存在某个元素
  isInArray: function (arr, value){
    for(var i = 0; i<arr.length; i++){
      if (value === arr[i]) {
        return true;
      }
    }
    return false;
  },
  //清除搜索记录
  clearSearchRecord: function(){
    let that = this;
    that.setData({
      searchHistory: [],
      searchHistoryShow: true
    })
    wx.setStorage({
      key: 'happy_music',
      data: []
    })
  },
  //单条删除搜索记录
  deleteSearchRecord: function(e){
    let that = this;
    let searchRecord = that.data.searchHistory;
    searchRecord.splice( e.target.dataset.index, 1);
    that.setData({
      searchHistory: searchRecord
    })
    wx.setStorage({
      key: 'happy_music',
      data: searchRecord
    })
    if (that.data.searchHistory.length === 0 ){
      that.setData({
        searchHistoryShow: true
      })
    }
  },
  searchRecordClick: function(e){
      let that = this;
      page = 1;
      that.setData({
          searchValue: e.currentTarget.dataset.songname
      })
      that.searchRequest(that.data.searchValue, page, limit)
  }
})