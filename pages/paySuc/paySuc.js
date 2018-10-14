// pages/paySuc/paySuc.js
Page({
  data: {
		state: 0,
  },
  onLoad: function (options) {
		let t = options.type == 1 ? 1 : 4;
		this.setData({ id: options.id, state: t });
  },
})