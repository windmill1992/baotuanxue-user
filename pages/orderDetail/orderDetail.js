// pages/orderDetail/orderDetail.js
const app = getApp().globalData;
const api = {
	orderInfo: app.baseUrl + '/btx/btx-rest/order-info',						//订单详情
	groupInfo: app.baseUrl + '/btx/btx-rest/group-buying-info',			//拼团详情
};
const QRCode = require('../../utils/qrcode.js');
Page({
  data: {
		
  },
  onLoad: function (options) {
		console.log(options);
		if (options.id) {
			this.setData({ id: options.id, gid: options.gid, uid: options.uid });
			this.getData();
		} else {
			wx.redirectTo({
				url: '/pages/index/index',
			})
		}
  },
	getData: function () {
		wx.showLoading({
			title: '加载中...',
		});
		let dd = this.data;
		wx.request({
			url: api.orderInfo,
			method: 'GET',
			header: app.header,
			data: {
				groupBuyingId: dd.id,
				groupId: dd.gid,
				buyUserId: dd.uid,
			},
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					this.setData({ info: res.data.resultData });
					this.getGroupInfo();
					if (res.data.resultData.orderStatus == 1) {
						this.countdown();
					}
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
	getGroupInfo: function () {
		wx.request({
			url: api.groupInfo,
			method: 'POST',
			header: app.header,
			data: {
				groupBuyingId: this.data.id,
				needGroupBuyingExtendInfo: true,
				needSaleRecordInfo: false,
			},
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					this.setData({ groupInfo: res.data.resultData });
					this.makeCode();
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
		})
	},
	makeCode: function () {
		let uid = wx.getStorageSync('userId');
		let src = new QRCode('cvs', {
			text: JSON.stringify({
				groupBuyingId: this.data.id,
				groupId: this.data.gid,
				userId: uid,
			}),
			width: 150,
			height: 150,
		});
	},
	countdown: function () {
		let f = this.setTime();
		this.timer = setInterval(() => {
			f = this.setTime();
			if (!f) clearInterval(this.timer);
		}, 60000);
	},
	setTime: function () {
		let v = this.data.info;
		let f = false;
		let t = v.groupBuyingEndTime;
		let n = Date.now();
		let d = t - n;
		if (d > 1000) {
			f = true;
			let hh = Number.parseInt(d / 1000 / 60 / 60);
			let mm = Number.parseInt(d / 1000 / 60 % 60);
			v.time = [hh, '小时', mm, '分'].join('');
			// v.groupBuyingEndTime -= 60000;
		} else {
			v.orderStatus = 3;
		}
		this.setData({ info: v });
		return f;
	},
	fresh: function () {
		this.getData();
	},
	call: function () {
		wx.makePhoneCall({
			phoneNumber: this.data.groupInfo.merchantLinkMobile,
		})
	},
  onShareAppMessage: function () {
		let dd = this.data;
		let dd2 = dd.groupInfo;
		let name = wx.getStorageSync('user').nickName;
		return {
			title: `${name}邀您参与拼团~`,
			path: `/pages/detail/detail?id=${dd.id}&gid=${dd.gid}`,
			imageUrl: dd2.cover,
		}
  },
	onUnload: function () {
		clearInterval(this.timer);
	},
})