const getBackgroundAudioManager = wx.getBackgroundAudioManager(); //背景音乐播放器

Page({
  data:{
    songName: '',
    singerName: '',
    playState: true,    //播放状态
    songCover: '',    //歌曲封面
    songUrl: '',    //歌曲地址
    playbackProgress: 0,    //播放进度
    rotateAngle: 0,     //旋转角度
    interval: 0,    //歌曲时长
    intervalPlyaMinute: '0:00', //歌曲当前播放分钟
    intervalMinute: '0:00', //歌曲总时长分钟
    backgroundWidth: 0,     //屏幕可用区域宽度
    backgroundHeight: 0     //屏幕可用区域高度
  },


  onLoad: function(option){
      let that = this;
      let t = option.interval;
      t = Math.floor(t / 60) + ":" + (t % 60 / 100).toFixed(2).slice(-2);
      that.setData({
          intervalPlyaMinute: '0:00',
          songName: option.songName,
          singerName: option.singerName,
          interval: option.interval,
          intervalMinute: t, 
          songCover: 'https://y.gtimg.cn/music/photo_new/T002R68x68M000' + option.songCover +'.jpg?max_age=2592000',
          songUrl: 'http://dl.stream.qqmusic.qq.com/C400' + option.songUrl +'.m4a?guid=7401086166&vkey=CE86EDA85D0934451E610AF5731BFB292FA8406FBCAD591CC1CC7D8B6C31B6BCC26D8699579A686B8057FCC12FB68F9E13A4CCE68FFEB872&uin=0&fromtag=38'
      })
  },
  onReady: function(){
    let that = this;
    //控制旋转角度
    this.timer = setInterval(function(){
        let number = that.data.rotateAngle;
        if ( number >= 360 ){
            number = 0;
        }
        number+=0.8;
        that.setData({
            rotateAngle: number
        })
    },10)
    
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          backgroundWidth: res.windowWidth,
          backgroundHeight: res.windowHeight
        })
      },
    })
    // console.log(that.data.songUrl)
    getBackgroundAudioManager.src = that.data.songUrl;
    getBackgroundAudioManager.title  = that.data.songName;
    getBackgroundAudioManager.singer = that.data.singerName;
    getBackgroundAudioManager.coverImgUrl = that.data.songCover;
    getBackgroundAudioManager.onPlay(function () {
        that.setData({
            playState: true
        }) 
    }) 
    getBackgroundAudioManager.onPause(function(){
       that.setData({
           playState: false
       })
    })
    getBackgroundAudioManager.onTimeUpdate(function(){
        wx.getBackgroundAudioPlayerState({
            success: function(res){
                let t = res.currentPosition;
                t = Math.floor(t / 60) + ":" + (t % 60 / 100).toFixed(2).slice(-2);
                that.setData({
                    intervalPlyaMinute: t,
                    playbackProgress: res.currentPosition / that.data.interval * 100
                })
            }
        })
    })
    getBackgroundAudioManager.onError(function(){
        console.log("播放失败")
    })
    getBackgroundAudioManager.onStop(function(){
        wx.navigateBack({
            delta: getCurrentPages().length
        })
    })
    getBackgroundAudioManager.onEnded(function(){
        wx.navigateBack({
            delta: getCurrentPages().length
        })
    })
  },
  SwitchPlaybackState: function(){
    let that = this;
    that.setData({
      playState: !that.data.playState
    })
    if ( that.data.playState ){
        wx.playBackgroundAudio(getBackgroundAudioManager)   
        this.timer = setInterval(function () {
            let number = that.data.rotateAngle;
            if (number >= 360) {
                number = 0;
            }
            number += 0.8;
            that.setData({
                rotateAngle: number
            })
        }, 10)  
    }else{
        wx.pauseBackgroundAudio()
        console.log(that)
        clearInterval(this.timer)
        console.log(that)
    }
  },
  //下载歌曲
  downLoadSong: function(){
      console.log(123)
      let that = this;
      console.log(that.data.songUrl)
      wx.downloadFile({
          url: that.data.songUrl,
          header:{
              "Content-type" : "application/force-download"
          },
          success: function(res){
              console.log(res)
          },
          fail: function(){
              wx.showToast({
                    title: '该功能未开放',
                    //   icon: 'none',
                    image: '/images/error.png',
                    duration: 2000
              })
          }
      })
  }
})