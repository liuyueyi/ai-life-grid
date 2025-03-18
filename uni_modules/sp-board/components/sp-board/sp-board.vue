<template>
	<view class="content" :style="{ width: width, height: height }">
		<view class="canvas-box"
			:style="{ backgroundImage: `URL(${bgImg})`, '--stbh': fontSize > brushSize ? fontSize + 'px' : brushSize + 'px', '--ch': mode == 'color' ? '160px' : '0px', '--cp': mode == 'color' ? fontSize > brushSize ? fontSize + 'px' : brushSize + 'px' : '0px' }">
			<canvas class="board-canvas" id="canvas" canvas-id="canvas" disable-scroll="false"
				@touchstart="touchStartHandler" @touchmove="touchMoveHandler" @touchend="touchEndHandler">
			</canvas>
		</view>
		<movable-area v-if="mode == 'text'" class="text-cover"
			:style="{ top: canvasTop + 'px', left: canvasLeft + 'px', width: realWidth + 'px', height: realHeight + 'px' }">
			<movable-view direction="all" :x="iTextX" :y="iTextY"
				style="width:auto; display: flex;justify-content: start;flex-wrap: nowrap;"
				@change="movableViewOnChange">
				<input class="iText" v-model="iText" placeholder="这里输入文字"
					:style="{ borderColor: color, color: color, fontSize: fontSize + 'px', height: fontSize + 'px', minWidth: '100px', width: (iText.length * fontSize) + 'px', maxWidth: '200px' }" />
				<text class="btprimary" @click="drawText()">确定</text><!--这里必须要drawText()这种写法，不然会把点击事件传过去-->
			</movable-view>
		</movable-area>
		<view class="color-picker" :style="{ height: mode == 'color' ? '160px' : '0px', width: realWidth + 'px' }">
			<canvas :style="{ width: realWidth + 'px', height: '160px' }" id="colorPickerCanvas" canvas-id="colorPickerCanvas"
				disable-scroll="false" @touchstart="colorPickerTouchStartHandler"></canvas>
		</view>
		<view class="tools-box"
			:style="{ '--stbh': fontSize > brushSize ? fontSize + 'px' : brushSize + 'px', '--cp': mode == 'color' ? fontSize > brushSize ? fontSize + 'px' : brushSize + 'px' : '0px' }">
			<view class="style-bar">
				<view v-if="mode == 'pen' || mode == 'eraser'" class="bar-box">
					<view class="label">
						<text>笔触</text>
					</view>
					<view class="slider">
						<slider style="width:100%;" :value="brushSize" @changing="sliderChange" min="1" max="72" />
					</view>
					<view class="label">
						<view style="border-radius: 100%;"
							:style="{ width: brushSize + 'px', height: brushSize + 'px', backgroundColor: color }"></view>
					</view>
				</view>

				<view v-if="mode == 'text'" class="bar-box">
					<view class="label">
						<text>字号</text>
					</view>
					<view class="slider">
						<slider style="width:100%;" :value="fontSize" @changing="sliderFontChange" min="6" max="72" />
					</view>
					<view class="label">
						<text :style="{ fontSize: fontSize + 'px', color: color }">Aa</text>
					</view>
				</view>
			</view>
			<view class="tool-bar">
				<view class="ico-box">
					<block v-for="(item, index) in toolShow" :key="index">
						<image class="tool-item" mode="widthFix" :src="mode == item.key ? item.activeUrl : item.url"
							@click.stop.prevent="changeTool(item.key)"></image>
					</block>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
export default {
	name: "sp-board",
	data() {
		return {
			bgImg: "",
			historyList: [], //路径历史
			realWidth: 0,
			realHeight: 0,
			canvasTop: 0,
			canvasLeft: 0,

			ctx: null,
			touchStart: false,
			lastPoint: null,

			color: "#FF0000", // 画笔颜色
			brushSize: 5, // 画笔/橡皮擦大小
			fontSize: 14,//文字默认大小
			iText: "",//输入的内容
			iTextX: 100,
			iTextY: 100,
			mode: "pen", //操作模式
			toolShow: [],

			toolsAll: {
				clear: {
					title: "清空",
					key: "clear",
					url: "/uni_modules/sp-board/components/sp-board/static/img/clear.png",
					activeUrl: "/uni_modules/sp-board/components/sp-board/static/img/clear.png"
				},
				back: {
					title: "撤回",
					key: "back",
					url: "/uni_modules/sp-board/components/sp-board/static/img/back.png",
					activeUrl: "/uni_modules/sp-board/components/sp-board/static/img/back.png"
				},
				eraser: {
					title: "橡皮",
					key: "eraser",
					url: "/uni_modules/sp-board/components/sp-board/static/img/eraser.png",
					activeUrl: "/uni_modules/sp-board/components/sp-board/static/img/eraser-active.png"
				},
				color: {
					title: "颜色",
					key: "color",
					url: "/uni_modules/sp-board/components/sp-board/static/img/color.png",
					activeUrl: "/uni_modules/sp-board/components/sp-board/static/img/color-active.png"
				},
				pen: {
					title: "画笔",
					key: "pen",
					url: "/uni_modules/sp-board/components/sp-board/static/img/pen.png",
					activeUrl: "/uni_modules/sp-board/components/sp-board/static/img/pen-active.png"
				},
				text: {
					title: "文字",
					key: "text",
					url: "/uni_modules/sp-board/components/sp-board/static/img/text.png",
					activeUrl: "/uni_modules/sp-board/components/sp-board/static/img/text-active.png"
				},
				save: {
					title: "保存",
					key: "save",
					url: "/uni_modules/sp-board/components/sp-board/static/img/save.png",
					activeUrl: "/uni_modules/sp-board/components/sp-board/static/img/save.png"
				},
				upload: {
					title: "上传",
					key: "upload",
					url: "/uni_modules/sp-board/components/sp-board/static/img/upload.png",
					activeUrl: "/uni_modules/sp-board/components/sp-board/static/img/upload.png"
				}
			},
			// 颜色拾取器
			colorPickerCtx: null,
			colorBoardImg: "/uni_modules/sp-board/components/sp-board/static/img/color-board.png",
		};
	},
	props: {
		tools: { //要显示的工具
			type: Array,
			default: ["pen", "eraser", "color", "text", "back", "clear", "upload", "save"]
		},
		bgImage: { //背景图片
			type: String,
			default: ""
		},
		width: { //宽
			type: String,
			default: "100%"
		},
		height: { //高
			type: String,
			default: "100vh"
		},
		bgColor: {
			type: String,
			default: "#FFFFFF"
		},
		saveAction: {
			type: String,
			default: "preview"
		}
	},
	computed: {
	},
	watch: {
		// 监听变化
		bgImage(newVal, oldVal) {
			this.bgImg = newVal;
			this.$forceUpdate();
			this.initCanvas();
		},
		width(newVal, oldVal) {
			this.$forceUpdate();
			this.initCanvas();
		},
		height(newVal, oldVal) {
			this.$forceUpdate();
			this.initCanvas();
		},
	},
	created() {
		this.initCanvas();
	},
	methods: {
		uploadImgAsBgImg() {
			let that = this;
			uni.chooseImage({
				count: 1, //默认9
				sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
				sourceType: ['album', 'camera'], //从相册选择
				success: function (res) {
					that.bgImg = res.tempFilePaths[0];
					that.$forceUpdate();
					that.drawHistory();
				}
			});
		},
		sliderChange(e) {
			this.brushSize = e.detail.value;
		},
		sliderFontChange(e) {
			this.fontSize = e.detail.value;
		},
		movableViewOnChange(e) {
			this.iTextX = e.detail.x;
			this.iTextY = e.detail.y;
		},
		initCanvas() {
			this.bgImg = this.bgImage;
			for (let i in this.tools) {
				const key = this.tools[i];
				this.toolShow.push(this.toolsAll[key]);
			}
			// 使用nextTick确保DOM已更新
			this.$nextTick(() => {
				const ctx = uni.createCanvasContext('canvas', this);
				this.ctx = ctx;

				const query = uni.createSelectorQuery().in(this);
				query.select('#canvas').boundingClientRect(data => {
					if (data) {
						this.realWidth = data.width;
						this.realHeight = data.height;
						this.canvasTop = data.top;
						this.canvasLeft = data.left;
						if (this.bgImg.length == 0) {
							this.setBgColor();
							this.initColorPicker();
						}
					}
				}).exec();
			});


		},
		initColorPicker() {
			const colorPickerCtx = uni.createCanvasContext('colorPickerCanvas', this);
			this.colorPickerCtx = colorPickerCtx;
			this.colorPickerCtx.beginPath();
			this.colorPickerCtx.drawImage(this.colorBoardImg, 0, 0, this.realWidth, 160);//这里的宽高不允许带单位
			this.colorPickerCtx.draw(true);
			this.colorPickerCtx.save();
		},
		colorPickerTouchStartHandler(e) {
			const x = e.touches[0].x;
			const y = e.touches[0].y;
			uni.canvasGetImageData({
				x: x,
				y: y,
				width: 1,
				height: 1,
				canvasId: 'colorPickerCanvas',
				success: (res) => {
					const pixelData = res.data;
					/*
					// pixelData 是一个 Uint8ClampedArray，包含 RGBA 四个值
					this.pixelColor = {
					  r: pixelData[0],
					  g: pixelData[1],
					  b: pixelData[2],
					  a: pixelData[3]
					};
					console.log('Pixel Color at (' + x + ', ' + y + '): ' + JSON.stringify(this.pixelColor));
					*/
					const colorVal = this.rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
					this.color = colorVal;
					this.mode = "pen";
				},
				fail: (err) => {
					console.error('Error getting pixel color:', err);
				}
			}, this);
		},
		rgbToHex(red, green, blue) {
			const toHex = (color) => {
				let hex = color.toString(16);
				return hex.length == 1 ? "0" + hex : hex;
			};
			return "#" + toHex(red) + toHex(green) + toHex(blue);
		},
		touchStartHandler(e) {
			this.touchStart = true;
			const { x, y } = e.touches[0];
			this.lastPoint = { x, y };

			//新增一次历史轨迹
			this.historyList.push({
				style: {
					color: this.color,
					brushSize: this.brushSize
				},
				coordinates: [{
					type: e.type,
					mode: this.mode,
					x: x,
					y: y
				}]
			});
		},
		touchMoveHandler(e) {
			if (!this.touchStart) return;
			const { x, y } = e.touches[0];

			switch (this.mode) {
				case "eraser":
					this.erase(x, y);
					break;
				case "pen":
					this.draw(x, y);
					break;
				default:
					break;
			}
			//最后一次历史中新增运动轨迹
			this.historyList[this.historyList.length - 1].coordinates.push({
				type: e.type,
				mode: this.mode,
				x,
				y
			});
		},
		touchEndHandler() {
			this.touchStart = false;
			this.lastPoint = null;
		},
		changeTool(toolKey) {
			if (toolKey == "clear") {
				this.clear();
			} else if (toolKey == "back") {
				this.backHandle();
			} else if (toolKey == "save") {
				this.saveImage();
			} else if (toolKey == "upload") {
				this.uploadImgAsBgImg();
			} else {
				this.mode = toolKey;
			}
		},
		setBrushSize(size) {
			this.brushSize = size;
		},
		setColor(val, isText) {
			this.color = val;
			if (!isText) {
				this.mode = "pen";
			}
		},
		setBgColor() {
			if (this.bgImg.length == 0) {
				// 没有背景图，那就设置背景为白色
				this.ctx.beginPath();
				this.ctx.setFillStyle(this.bgColor);
				this.ctx.fillRect(0, 0, this.realWidth, this.realHeight);
				this.ctx.draw();
			}
		},
		// 画笔
		draw(x, y) {
			if (this.lastPoint) {
				this.ctx.beginPath();
				this.ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
				this.ctx.lineTo(x, y);
				this.ctx.strokeStyle = this.color;
				this.ctx.lineWidth = this.brushSize;
				this.ctx.lineCap = 'round';
				this.ctx.lineJoin = 'round';
				this.ctx.stroke();
				this.ctx.draw(true);
				this.lastPoint = { x, y };
			}
		},
		drawText(e) {
			if (typeof e == "undefined") {
				e = this;
			}
			const text = e.iText;
			const color = e.color;
			const fontSize = e.fontSize;
			const x = e.iTextX;
			const y = e.iTextY + fontSize;

			this.ctx.beginPath();
			this.ctx.setFillStyle(color);
			this.ctx.setFontSize(fontSize);
			this.ctx.fillText(text, x, y);
			this.ctx.draw(true);
			this.mode = "pen";
			this.iText = "";
			//新增一次历史轨迹
			this.historyList.push({
				style: {
					color: color,
					fontSize: fontSize
				},
				coordinates: [{
					type: "text",
					mode: "text",
					text: text,
					x: x,
					y: y
				}]
			});
		},
		// 橡皮擦
		erase(x, y) {
			this.ctx.beginPath();
			if (this.bgImg.length == 0) {
				this.ctx.setFillStyle(this.bgColor);
				this.ctx.fillRect(this.lastPoint.x - this.brushSize / 2, this.lastPoint.y - this.brushSize / 2, this.brushSize, this.brushSize);
			} else {
				// 有背景图就透明
				this.ctx.clearRect(this.lastPoint.x - this.brushSize / 2, this.lastPoint.y - this.brushSize / 2, this.brushSize, this.brushSize);
			}
			this.ctx.draw(true); //true就仅清除给定区域，不填true就整个画板
			this.lastPoint = { x, y };
		},
		clear() {
			const that = this;
			if (this.historyList.length == 0) {
				this.mode = "pen";
				return;
			}
			uni.showModal({
				title: '操作确认',
				content: '您确定要清空画板吗？',
				success: function (res) {
					if (res.confirm) {
						that.historyList = [];
						that.clearCanvas();// 整个画板都清了
						that.mode = "pen";
					}
				}
			});
		},
		//撤回
		backHandle() {
			this.ctx.draw(); //清空画板
			this.historyList.pop(); //删除最后一步
			this.drawHistory();
			this.mode = "pen";
		},
		//遍历历史轨迹重新绘制
		drawHistory() {
			this.clearCanvas();// 整个画板都清了
			this.setBgColor();
			this.historyList.forEach((item, index) => {
				this.ctx.beginPath()
				this.ctx.setLineCap('round')
				this.ctx.setStrokeStyle(item.style.color)
				this.ctx.setLineWidth(item.style.brushSize)
				item.coordinates.forEach(it => {
					// 开始画历史笔迹
					this.ctx.setFillStyle(this.color);
					if (it.mode == "pen") {
						if (it.type == 'touchstart') {
							this.ctx.moveTo(it.x, it.y);
						} else {
							this.ctx.lineTo(it.x, it.y);
						}
					} else if (it.mode == "eraser") {
						const x = it.x;
						const y = it.y
						this.lastPoint = { x, y };
						this.erase(it.x, it.y);
					} else if (it.mode == "text") {
						const textE = {
							iText: it.text,
							color: item.style.color,
							fontSize: item.style.fontSize,
							iTextX: it.x,
							iTextY: it.y,
						}
						this.drawText(textE);
					}
				})
				this.ctx.stroke()
			})
			this.ctx.draw(true)
		},
		//贴图
		async drawImage(imageUrl, x, y, width, height) {
			x = x ? x : 0;
			x = y ? y : 0;
			width = width ? width : this.realWidth;
			height = height ? height : this.realHeight;
			const tempFilePath = await this.getFile(imageUrl);
			this.ctx.beginPath();
			this.ctx.drawImage(tempFilePath, x, y, width, height);//这里的宽高不允许带单位
			this.ctx.draw(true);
		},
		// 清空画板
		clearCanvas() {
			this.ctx.draw();
			this.setBgColor();
		},
		saveCallBack(tempFilePath) {
			switch (this.saveAction) {
				case "preview":
					uni.previewImage({
						urls: [tempFilePath],
						current: 0,
						complete: (e) => {
							console.log(e)
						}
					});
					break;
				case "toAlbum":
					uni.saveImageToPhotosAlbum({
						filePath: tempFilePath,
						success: function () {
							uni.showToast({
								title: '保存成功'
							});
						},
					});
					break;
				case "save":
				//什么都不用做
				default:
					break;
			}
			this.$emit("completed", tempFilePath);
		},
		async saveImage() {
			const that = this;
			// 把画布生成图片
			const res = await uni.canvasToTempFilePath({ canvasId: 'canvas' }, that);
			if (Object.keys(res).length != 2 || res.errMsg != "canvasToTempFilePath:ok") {
				uni.showToast({
					title: '生成失败1',
					icon: "error"
				});
				return;
			}
			const tempFilePath = res.tempFilePath;
			if (this.bgImg.length == 0) {
				this.saveCallBack(tempFilePath);
				return;
			}
			// 有背景图，两图合并
			this.ctx.draw();
			await that.drawImage(this.bgImg, 0, 0, this.realWidth, this.realHeight);
			await that.drawImage(tempFilePath, 0, 0, this.realWidth, this.realHeight);
			const res2 = await uni.canvasToTempFilePath({ canvasId: 'canvas' }, that);
			if (Object.keys(res2).length != 2 || res2.errMsg != "canvasToTempFilePath:ok") {
				uni.showToast({
					title: '生成失败2',
					icon: "error"
				});
				return;
			}
			const tempFilePath2 = res2.tempFilePath;
			this.saveCallBack(tempFilePath2);
		},
		async getImgInfo(url) {
			const res = await uni.getImageInfo({
				src: url
			});
			if (res[1].errMsg != "getImageInfo:ok") {
				return false;
			}
			return res[1];
		},
		async getFile(url) {
			const res = await uni.downloadFile({
				url: url
			});
			if (res.statusCode != 200) {
				return "";
			}
			return res.tempFilePath;
		},
	}
};
</script>
<style lang="scss">
.btprimary {
	height: 14px;
	background-color: #07C160;
	border-color: #07C160;
	color: #fff;
	line-height: 14px;
	font-size: 12px;
	font-weight: 200;
	padding: 4px 7px;
	border-radius: 3px;
	border-width: 1rpx;
	border-style: solid;
}

.content {
	position: relative;
	width: 100%;

	.canvas-box {
		width: 100%;
		height: calc(100% - 75px - var(--stbh) + 14px - var(--ch) + var(--cp));
		background-size: 100% 100%;
		background-repeat: no-repeat;

		.board-canvas {
			width: 100%;
			height: 100%;
		}
	}

	.color-picker {
		overflow: hidden;
	}

	.text-cover {
		position: absolute;
		top: 0px;
		left: 0px;

		.iText {
			border-style: solid;
			border-width: 1px;
			border-color: #FF0000;
			color: #FF0000;
		}
	}

	.tools-box {
		position: relative;
		width: 100%;
		height: calc(150rpx + var(--stbh) - 14px - var(--cp));
		background-color: #EEE;

		.style-bar {
			width: 100%;

			.bar-box {
				display: flex;
				justify-content: space-between;
				width: 100%;

				.label {
					width: 72px;
					display: flex;
					justify-content: center;
					align-items: center;
				}

				.slider {
					width: calc(100% - 72px - 72px);
					display: flex;
					justify-content: center;
					align-items: center;
				}

				.item-box {
					margin: 10rpx 10rpx;
					display: flex;
					justify-content: center;
					align-items: center;

					.item {
						border-radius: 100%;
					}
				}

				.color-box {
					width: calc(100% - 50px);
					display: flex;
					justify-content: space-between;

					.item-box {
						margin: 10rpx 10rpx;
						display: flex;
						justify-content: center;
						align-items: center;

						.item {
							border-radius: 100%;
						}
					}
				}
			}
		}

		.tool-bar {
			position: absolute;
			left: 0;
			bottom: 0;
			width: 100%;

			.ico-box {
				width: 100%;
				height: 68rpx;
				display: flex;
				justify-content: space-between;

				.tool-item {
					padding: 10rpx;
					width: 48rpx;
					height: 48rpx;
				}
			}
		}

	}
}

/* 竖屏 */
/*
	@media screen and (orientation: portrait) {
		.tools-box {
			.tools {
				height: 3rem;
				flex-wrap: wrap;
	
				.tools-item {
					width: 8%;
				}
			}
		}
	
		.canvas-box {
			width: 100vw;
			position: relative;
	
			.board-canvas {
				height: 100%;
				width: 100%;
				position: absolute;
				background: rgba(0, 0, 0, 0);
			}
	
		}
	}
	*/

/* 横屏 */
/*
	@media screen and (orientation: landscape) {
		.tools-box {
			position: fixed;
			height: 80vh;
			z-index: 10;
			overflow: auto;
			right: 0;
	
			.tools {
				width: 1.8rem;
				flex-direction: column;
	
				.tools-item {
					width: 100%;
					margin: 0.4rem 0;
				}
			}
		}
	
		.canvas-box {
			width: 100%;
			position: relative;
	
			.board-canvas {
				height: 100%;
				width: 100%;
				position: absolute;
				background: rgba(0, 0, 0, 0);
			}
			
		}
	}
	*/
</style>