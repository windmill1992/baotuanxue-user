//app.js
App({
  onLaunch: function () {
    // let prod = wx.getStorageSync('prod001');
		// if (prod != 1) {
		// 	wx.clearStorageSync();
		// 	wx.setStorageSync('prod001', 1);
		// }
		if (wx.getUpdateManager) {
			const updateManager = wx.getUpdateManager();
			updateManager.onCheckForUpdate(res => {
				if (res.hasUpdate) {
					updateManager.onUpdateReady(() => {
						wx.showModal({
							title: '更新提示',
							content: '新版本已经准备好，是否重启应用？',
							success: res => {
								if (res.confirm) {
									// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
									updateManager.applyUpdate()
								}
							}
						})
					})
					updateManager.onUpdateFailed(() => {
						// 新的版本下载失败
						wx.showModal({
							title: '提示',
							content: '下载失败！',
							showCancel: false
						})
					})
				}
			})
		}
  },
  globalData: {
    baseUrl: 'http://btx.yupfashion.cn',
		header: {
			// 'content-type': 'application/x-www-form-urlencoded',
			'content-type': 'application/json',
			'applicationId': 1,
			'userId': 1,
		},
		serviceMobile: '13112345678',
  }
})