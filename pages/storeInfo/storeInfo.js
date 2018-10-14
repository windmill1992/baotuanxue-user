// pages/storeInfo/storeInfo.js
const app = getApp().globalData;
const api = {
	storeInfo: app.baseUrl + '/btx/btx-rest/merchant-info',				//获取门店信息
}
Page({
  data: {
		show: true,
		info: {},
  },
  onLoad: function (options) {
		if (options.uid) {
			this.setData({ uid: options.uid });
			this.getData();
		}
  },
	getData: function () {
		wx.showLoading({
			title: '加载中...',
		});
		wx.request({
			url: api.storeInfo + '?businessUserId=' + this.data.uid,
			method: 'POST',
			header: app.header,
			data: {},
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					this.setData({ info: res.data.resultData });
				} else {
					if (res.data.resultMsg) {
						wx.showToast({
							title: res.data.resultMsg,
							icon: 'none',
						})
					} else {
						wx.showToast({
							title: '服务器开了小差，请稍后再试！',
							icon: 'none',
						})
					}
				}
			},
			fail: err => {
				wx.showToast({
					title: '未知异常！',
					icon: 'none',
				})
			},
			complete: () => {
				wx.hideLoading();
			}
		})
	},
	showCall: function () {
		this.setData({ showTel: true });
	},
	closeTel: function () {
		this.setData({ showTel: false });
	},
	call: function () {
		wx.makePhoneCall({
			phoneNumber: this.data.info.linkMobile,
		})
	},
})