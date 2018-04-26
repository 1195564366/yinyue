const util = require('../../utils/util.js');

const songLastUrl = 'http://dl.stream.qqmusic.qq.com/C400';
const songNextUrl = '.m4a?guid=7401086166&vkey=0ED8FE1BF0BA7ADA8F06B9FDF53918CD36042E67AFD26FA07B31EDB382F2A839CF5F8133D75FA05467F8D65D0B87DDF7D4D927B784A087EB&uin=0&fromtag=38';
const songLastCover = 'http://dl.stream.qqmusic.qq.com/C400';
const songNextCover = '.m4a?guid=7401086166&vkey=6C8B4D6AA4C695EDB577BB34C368201C358E9A2665E05C0A2E26F420F04116BB695BF501BE54F7428705CB74473B00C19AC0B658827C12CF&uin=0&fromtag=38';
const getBackgroundAudioManager = wx.getBackgroundAudioManager();    //创建背景音乐


Page({
    data: {
        songList: [],    //100条歌曲数据
        updateTime: '',    //歌单更新时间
        topinfo: {},     //歌单介绍
        dayOfYear: '',    //歌单创建天数
        totalSongNum: 0,     //歌单歌曲数量
        week: '',        //第几周
        playIndex: 0,    //当前播放第几首音乐
        windowWidth: 0,     //可用屏幕宽度
        windowHeight: 0,    //可用屏幕高度
        playState: false,     //歌单播放状态
        playbackProgress: 0,     //当前歌曲播放进度
        intervalPlyaMinute: '0:00', //歌曲当前播放分钟
        intervalMinute: '0:00', //歌曲总时长分钟
        songAllURL: [],      //全部歌曲链接
        scrollHeight: 0,
        scrollHEIGHT: 0,
        rollingHeight: 0,   //scroll歌单滚动高度
        songOneHeight: 0,    //一条歌曲的高度
        songAllHeight: 0
    },
    onLoad: function(option){
        util.showLoading();
        let that = this;
        let API = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&tpl=3&page=detail&type=top&topid=' + option.id +'&_=1523510308628';
        util.request( API, '', function(res){
            let weekTime = res.data.date;
            if ( weekTime ){
                if (weekTime.includes("_")) {
                    weekTime = weekTime.split("_")[weekTime.split("_").length - 1];
                    that.setData({
                        week: weekTime
                    })
                }
            }
            let songListTemporary = [];
            for( let i = 0;i < res.data.songlist.length; i++ ){
                songListTemporary.push( songLastUrl + res.data.songlist[i].data.strMediaMid + songNextUrl)
            }
            that.setData({
                songList: res.data.songlist,
                updateTime: res.data.update_time, 
                topinfo: res.data.topinfo,
                dayOfYear: res.data.day_of_year,
                totalSongNum: res.data.total_song_num,
                songAllURL: songListTemporary
            })
            util.hideLoading()
        } )
    },
    onReady: function(){
        let that = this;
        wx.getSystemInfo({
            success: function(res) {
                console.log(res.windowHeight);
                that.setData({
                    windowWidth: res.windowWidth,
                    windowHeight: res.windowHeight,
                    scrollHEIGHT: res.windowHeight
                })
            },
        })
        // setTimeout(function(){
        //     wx.createSelectorQuery().select('.song-item').fields({
        //         dataset: true,
        //         size: true,
        //         scrollOffset: true,
        //         properties: ['scrollX', 'scrollY']
        //     }, function (res) {
        //         console.log(res);
        //         that.setData({
        //             songOneHeight: res.height
        //         })
        //     }).exec()
        // },1000)

        

        setInterval(function(){
            let theIdHeight; 
            let rankingList;
            wx.createSelectorQuery().select('#the-id').fields({
                dataset: true,
                size: true,
                scrollOffset: true,
                properties: ['scrollX', 'scrollY']
            }, function (res) {
                theIdHeight = res.height
            }).exec()
            wx.createSelectorQuery().select('.ranking-list').fields({
                dataset: true,
                size: true,
                scrollOffset: true,
                properties: ['scrollX', 'scrollY']
            }, function (res) {
                rankingList = res.height;
                that.setData({
                    scrollHeight: that.data.windowHeight - theIdHeight - res.height
                })
            }).exec()
            wx.createSelectorQuery().select('.song-item').fields({
                dataset: true,
                size: true,
                scrollOffset: true,
                properties: ['scrollX', 'scrollY']
            }, function (res) {
                rankingList = res.height;
                that.setData({
                    songOneHeight: res.height
                })
            }).exec()
        },1000) 
    },

    //暂停播放
    sitchpPlaybackState: function(){
        let that = this;
        if ( !getBackgroundAudioManager.src ) {
            that.backgroundMusic(getBackgroundAudioManager,
                that.data.songList[that.data.playIndex].data.songname,
                that.data.songList[that.data.playIndex].data.singer[0].name,
                songLastCover + that.data.songList[that.data.playIndex].data.songmid + songNextCover,
                songLastUrl + that.data.songList[that.data.playIndex].data.strMediaMid + songNextUrl)
        }
        if ( that.data.playState ){
            wx.pauseBackgroundAudio()
        } else {
            wx.playBackgroundAudio(getBackgroundAudioManager)  
        }
        that.setData({
            playState: !that.data.playState
        })
        
    },

    //上一首
    lastSong: function(){
      let that = this;
      that.setData({
          playState: true
      })
      if ( that.data.playIndex === 0){
          that.setData({
              playIndex: that.data.songList.length-1
          })
      } else {
          that.setData({
              playIndex: that.data.playIndex-1
          })
      }
      that.backgroundMusic(getBackgroundAudioManager,
          that.data.songList[that.data.playIndex].data.songname,
          that.data.songList[that.data.playIndex].data.singer[0].name,
          songLastCover + that.data.songList[that.data.playIndex].data.songmid + songNextCover,
          songLastUrl + that.data.songList[that.data.playIndex].data.strMediaMid + songNextUrl)
    },

    //下一首
    nextSong: function(){
        let that = this;
        that.setData({
            playState: true
        })
        if (that.data.playIndex === that.data.songList.length-1) {
            that.setData({
                playIndex: 0
            })
        } else {
            that.setData({
                playIndex: that.data.playIndex + 1
            })
        }
        that.backgroundMusic(getBackgroundAudioManager,
            that.data.songList[that.data.playIndex].data.songname,
            that.data.songList[that.data.playIndex].data.singer[0].name,
            songLastCover + that.data.songList[that.data.playIndex].data.songmid + songNextCover,
            songLastUrl + that.data.songList[that.data.playIndex].data.strMediaMid + songNextUrl)
    },
    //背景音乐赋值
    backgroundMusic: function (target, title, singer, cover, url){
        let that = this;
        target.title = title;
        target.singer = singer;
        target.coverImgUrl = cover;
        target.src = url; // 设置了 src 之后会自动播放
        target.onTimeUpdate(function () { //背景音频播放进度更新事件
            wx.getBackgroundAudioPlayerState({
                success: function(res){
                    if ( res.status === 1 ){
                        let now = res.currentPosition;
                        now = Math.floor(now / 60) + ":" + (now % 60 / 100).toFixed(2).slice(-2);
                        let all = res.duration;
                        all = Math.floor(all / 60) + ":" + (all % 60 / 100).toFixed(2).slice(-2);
                        if (now && all) {
                            // console.log(123)
                            that.setData({
                                intervalPlyaMinute: now,
                                intervalMinute: all,
                                playbackProgress: res.currentPosition / res.duration * 100
                            })
                        }
                    }  
                }
            })
        })
        target.onPrev(function () {   //用户在系统音乐播放面板点击上一曲事件
            that.lastSong();
        })
        target.onNext(function () {   //用户在系统音乐播放面板点击下一曲事件
            that.nextSong();
        })
        target.onStop(function () {       //用户点击系统栏关闭
            let allTime = that.data.songList[ that.data.playIndex ].data.interval;
            allTime = Math.floor(allTime / 60) + ":" + (allTime % 60 / 100).toFixed(2).slice(-2);
            that.setData({
                playState: false,     //歌单播放状态
                playbackProgress: 0,     //当前歌曲播放进度
                intervalPlyaMinute: '0:00', //歌曲当前播放分钟
                intervalMinute: allTime, //歌曲总时长分钟
            })
        })
        target.onPlay(function () {        //背景音乐播放事件
            that.setData({
                playState: true
            })
        })
        target.onPause(function(){        //背景音乐暂停事件
            that.setData({
                playState: false
            })
        })
        target.onError(function () {      //背景音频播放错误事件
            wx.showToast({
                title: '当前音乐播放错误，自动切换下一首',
                image: '/images/error.png',
                duration: 2000
            })
            that.nextSong();
        })
        target.onEnded(function(){  //背景音乐自然播放结束后执行
            that.nextSong();
        })
        let playIDX = that.data.playIndex;
        that.setData({
            songAllHeight: playIDX * that.data.songOneHeight - 2 * that.data.songOneHeight
        })
    },
    //歌曲列表双击
    doubleClickSwitchSong: function(e){
        let that = this;
        let songid = e.currentTarget.dataset.songid
        if (songid != that.data.playIndex) {    //点击的不是当前播放的音乐
            that.setData({
                playIndex: songid,
                playState: true
            })
            that.backgroundMusic(getBackgroundAudioManager,
                that.data.songList[that.data.playIndex].data.songname,
                that.data.songList[that.data.playIndex].data.singer[0].name,
                songLastCover + that.data.songList[that.data.playIndex].data.songmid + songNextCover,
                songLastUrl + that.data.songList[that.data.playIndex].data.strMediaMid + songNextUrl)
        }  else {   //点击的是当前音乐
            if ( that.data.playState ) {    //播放中
                that.setData({
                    playState: !that.data.playState
                })
                wx.pauseBackgroundAudio()
            } else {    //暂停中
                if ( !getBackgroundAudioManager.src ) {     //判断是否播放过音乐
                    that.setData({
                        playState: true
                    })
                    that.backgroundMusic(getBackgroundAudioManager,
                        that.data.songList[that.data.playIndex].data.songname,
                        that.data.songList[that.data.playIndex].data.singer[0].name,
                        songLastCover + that.data.songList[that.data.playIndex].data.songmid + songNextCover,
                        songLastUrl + that.data.songList[that.data.playIndex].data.strMediaMid + songNextUrl)
                } else {
                    that.setData({
                        playState: !that.data.playState
                    })
                    wx.playBackgroundAudio(getBackgroundAudioManager) 
                }
            }
        }
    }
})