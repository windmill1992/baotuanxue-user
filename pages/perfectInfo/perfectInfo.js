// pages/perfectInfo/perfectInfo.js
const app = getApp().globalData;
const api = {
	saveUser: app.baseUrl + '/btx/btx-rest/update-user',		//完善用户信息
}
Page({
  data: {

  },
  onLoad: function (options) {
		
  },
	getName: function (e) {
		this.setData({ name: e.detail.value });
	},
	getMobile: function (e) {
		this.setData({ mobile: e.detail.value });
	},
	submit: function () {
		let dd = this.data;
		if (!dd.name) {
			this.showError('请填写姓名！');
			return;
		}
		if (!/^(13[0-9]|14[579]|15[0-3,5-9]|166|17[0135678]|18[0-9]|19[89])\d{8}$/.test(dd.mobile)) {
			this.showError('手机号不正确！');
			return;
		}
		wx.showLoading({
			title: '正在保存...',
		});
		wx.request({
			url: api.saveUser + '?userName=' + dd.name + '&mobile=' + dd.mobile,
			method: 'POST',
			header: app.header,
			data: {},
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					wx.showToast({
						title: '保存成功',
					});
					wx.setStorageSync('uInfo', {
						userName: dd.name,
						mobile: dd.mobile,
					});
					setTimeout(() => {
						wx.navigateBack();
					}, 1000);
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
				});
				console.log(err);
			},
			complete: () => {
				wx.hideLoading();
			}
		})
	},
	showError: function (txt) {
		const that = this;
		let obj = {};
		obj.show = true;
		obj.title = txt;
		this.setData({ error: obj });
		setTimeout(function () {
			obj.show = false;
			obj.title = '';
			that.setData({ error: obj });
		}, 2000);
	}
})