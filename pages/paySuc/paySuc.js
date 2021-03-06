// pages/paySuc/paySuc.js
const app = getApp().globalData;
const api = {
	orderInfo: app.baseUrl + '/btx/btx-rest/order-info',							//订单详情
	groupInfo: app.baseUrl + '/btx/btx-rest/group-buying-info',				//拼团详情
}
Page({
  data: {
		state: 0,
  },
  onLoad: function (options) {
		if (options.id) {
			this.setData({ id: options.id, gid: options.gid, uid: options.uid });
			this.getData();
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
	onShareAppMessage: function () {
		let dd = this.data;
		let name = wx.getStorageSync('user').nickName;
		let cover = dd.groupInfo ? dd.groupInfo.cover : '../../img/logo.png';
		let query = `?id=${dd.id}`;
		if (dd.info.orderStatus == 1) {
			query += `&gid=${dd.gid}`;
		}
		return {
			title: `${name}邀请您参与拼团~`,
			path: `/pages/detail/detail${query}`,
			imageUrl: cover,
		}
	},
})