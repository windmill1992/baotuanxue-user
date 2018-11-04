// pages/detail/detail.js
const app = getApp().globalData;
const api = {
	groupInfo: app.baseUrl + '/btx/btx-rest/group-buying-info', 		//拼团信息
	buyGroup: app.baseUrl + '/btx/btx-rest/click-buy',					 		//购买
	buyCallback: app.baseUrl + '/btx/btx-rest/buy-callback',				//支付回调
}
Page({
  data: {
		user: {},
		showShare: false,
  },
  onLoad: function (options) {
		if (options.id) {
			let user = wx.getStorageSync('user');
			let gid = options.gid ? options.gid : 0;
			this.setData({ id: options.id, gid: gid, user: user });
			this.getData();
			if (!gid) {
				wx.hideShareMenu();
			}
		} else if (options.scene) {
			const scene = decodeURIComponent(options.scene);
			let arr = scene.split('_');
			let user = wx.getStorageSync('user');
			this.setData({ id: arr[1], gid: 0, user: user });
			this.getData();
			wx.hideShareMenu();
		} else {
			wx.redirectTo({
				url: '/pages/index/index',
			})
		}
  },
	onShow: function () {
		let uid = wx.getStorageSync('userId');
		if (!uid) {
			uid = app.header.userId;
		} else {
			app.header.userId = uid;
		}
		this.setData({ uid: uid });
	},
	getData: function () {
		wx.showLoading({
			title: '加载中...',
		});
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
					let r = res.data.resultData;
					let d = false;
					for (let v of r.groupBuyingExtendInfoVOList) {
						if (v.url) {
							d = true;
							break;
						}
					}
					this.setData({ info: r, haspic: d });
					if (r.groupBuyingStatus == 1) {
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
	buy: function (e) {
		let userId = wx.getStorageSync('userId');
		let uInfo = wx.getStorageSync('uInfo');
		if (!userId) {
			wx.navigateTo({
				url: '/pages/login/login',
			})
		} else if (!uInfo) {
			wx.navigateTo({
				url: '/pages/perfectInfo/perfectInfo',
			})
		} else {
			let t = e.currentTarget.dataset.type;
			wx.showLoading({
				title: '正在提交...',
			});
			wx.request({
				url: api.buyGroup,
				method: 'POST',
				header: app.header,
				data: {
					groupBuyingId: this.data.id,
					groupId: t == 1 ? this.data.gid : 0,
					payType: t,
				},
				success: res => {
					if (res.data.resultCode == 200 && res.data.resultData) {
						// this.setData({ gid: res.data.resultData });
						this.submit(t, res.data.resultData);
					} else {
						wx.hideLoading();
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
					wx.hideLoading();
					wx.showToast({
						title: '未知异常！',
						icon: 'none',
					})
				},
			})
		}
	},
	submit: function (t, gid) {
		let dd = this.data;
		wx.request({
			url: api.buyCallback + '?groupBuyingId=' + dd.id + '&groupId=' + gid,
			method: 'POST',
			header: app.header,
			data: {},
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					wx.showToast({
						title: '购买成功',
					});
					setTimeout(() => {
						wx.navigateTo({
							url: `/pages/paySuc/paySuc?id=${dd.id}&gid=${gid}&uid=${dd.uid}`,
						})
					}, 1000);
				} else {
					wx.hideLoading();
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
		let t = v.groupBuyingEndTimeShow;
		let n = Date.now();
		let d = t - n;
		if (d > 1000) {
			f = true;
			let hh = Number.parseInt(d / 1000 / 60 / 60);
			let mm = Number.parseInt(d / 1000 / 60 % 60);
			v.time = [hh, '小时', mm, '分'].join('');
			v.groupBuyingEndTimeShow -= 600000;
		} else {
			v.groupBuyingStatus = 3;
		}
		this.setData({ info: v });
		return f;
	},
	toMini: function () {
		wx.navigateToMiniProgram({
			appId: 'wx8be304a009404d19',
			path: '/pages/index/index',
		})
	},
	success: function (e) {
		console.log(e);
	},
	onShareAppMessage: function () {
		let dd = this.data;
		return {
			title: `${dd.user.nickName}邀请您参与拼团~`,
			path: `/pages/detail/detail?id=${dd.id}&gid=${dd.gid}`,
			imageUrl: dd.info.cover,
		}
	},
	onUnload: function () {
		clearInterval(this.timer);
	},
})