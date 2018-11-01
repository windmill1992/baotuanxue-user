// pages/perfSuc/perfSuc.js
Page({
  data: {

  },
  onLoad: function (options) {

  },
	know: function () {
		let pages = getCurrentPages();
		if (pages.length >= 2) {
			wx.navigateBack();
		} else {
			wx.reLaunch({
				url: '/pages/index/index',
			})
		}
	},
})