//index.js
const app = getApp().globalData;
const api = {
	orderList: app.baseUrl + '/btx/btx-rest/order-list',		//订单列表
};
Page({
  data: {
		tab: 0,
		hasmore: -1,
		list: [],
		showDialog: false,
  },
  onLoad: function () {
		let uid = wx.getStorageSync('userId');
		if (!uid) {
			wx.reLaunch({
				url: '/pages/login/login',
			})
		} else {
			this.setData({ uid: uid });
			app.header.userId = uid;
			this.page = 1;
			this.getData();
			wx.hideShareMenu();
		}
  },
	onShow: function () {
		let uid = wx.getStorageSync('userId');
		if (!uid) {
			uid = app.header.userId;
		} else {
			app.header.userId = uid;
		}
	},
	getData: function () {
		let dd = this.data;
		wx.showLoading({
			title: '加载中...',
		});
		wx.request({
			url: api.orderList,
			method: 'POST',
			header: app.header,
			data: {
				orderStatus: +dd.tab + 1,
				pageIndex: this.page,
				pageSize: 10,
			},
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					let r = res.data.resultData;
					if (this.page == 1) {
						this.setData({ list: [] });
					}
					let m = r.hasNextPage ? 2 : 1;
					if (r.total == 0) {
						m = 0;
					}
					r.list = r.list == null ? [] : r.list;
					this.setData({ list: [...dd.list, ...r.list], hasmore: m });
					if (this.data.tab == 0) {
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
	buys: function (e) {
		let idx = e.currentTarget.dataset.index;
		let a = this.data.list[idx];
		wx.navigateTo({
			url: '/pages/detail/detail?id=' + a.groupBuyingId + '&gid=' + a.groupId,
		})
	},
	changeTab: function (e) {
		clearInterval(this.timer);
		let t = e.currentTarget.dataset.tab;
		this.setData({ tab: t });
		this.page = 1;
		this.getData();
	},
	invite: function (e) {
		let i = e.currentTarget.dataset.index;
		this.setData({ shareIndex: i, showDialog: true });
	},
	countdown: function () {
		let f = this.setTime();
		this.timer = setInterval(() => {
			f = this.setTime();
			if (!f) clearInterval(this.timer);
		}, 60000);
	},
	setTime: function () {
		let arr = this.data.list;
		let arr2 = [];
		let f = false;
		for (let v of arr) {
			let t = v.groupBuyingEndTimeShow;
			let n = Date.now();
			let d = t - n;
			if (d > 1000) {
				f = true;
				let hh = Number.parseInt(d / 1000 / 60 / 60);
				let mm = Number.parseInt(d / 1000 / 60 % 60);
				v.time = [hh, '小时', mm, '分'].join('');
				// v.groupBuyingEndTimeShow -= 60000;
				arr2.push(v);
			}
		}
		let m = this.data.hasmore;
		if (arr2.length == 0) {
			m = 0;
		}
		this.setData({ list: arr2, hasmore: m });
		return f;
	},
	navToShare: function () {
		let dd = this.data;
		this.setData({ showDialog: false });
		wx.navigateTo({
			url: '/pages/share/share?id=' + dd.list[dd.shareIndex].groupBuyingId,
		})
	},
	onPullDownRefresh: function () {
		wx.stopPullDownRefresh();
		this.page = 1;
		this.getData();
	},
	onReachBottom: function () {
		if (this.data.hasmore != 2) return;
		this.page++;
		this.getData();
	},
	onShareAppMessage: function (e) {
		console.log(e);
		if (e.from == 'button') {
			// let idx = this.data.shareIndex;
			let idx = e.target.dataset.index;
			let dd = this.data.list[idx];
			// this.setData({ showDialog: false });
			let uname = wx.getStorageSync('user').nickName;
			return {
				title: `${uname}邀您参与拼团~`,
				path: `/pages/detail/detail?id=${dd.groupBuyingId}&gid=${dd.groupId}`,
				imageUrl: dd.cover,
			}
		}
	},
	closeShare: function () {
		this.setData({ showDialog: false });
	},
	onUnload: function () {
		clearInterval(this.timer);
	},
})
