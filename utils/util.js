const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime,
  request: request,
  showLoading: showLoading,
  hideLoading: hideLoading
}

//网络请求
function request(API, parameters = '', success){
  wx.request({
    url: API + parameters,
    method: 'GET',
    header: {
      'content-type' : 'application/json'
    },
    success: function(res){
      success(res);
    },
    fail: function(){
      console.log('接口调用失败')
    }
  })
}
//加载中
function showLoading(){
  wx.showLoading({
    title: '加载中'
  });
}
//隐藏加载中
function hideLoading(){
  wx.hideLoading();
}