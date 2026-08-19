# 廖亦琛个人网站

求职转化型个人网站（2027 届校招）。东华大学传播学应届生，方向：内容运营 / 新媒体运营 / 品牌营销。

纯静态站点：HTML + CSS + JS，无框架、无构建步骤、无 CDN 依赖，可直接部署。

## 目录结构

```
index.html          首页（Hero / 数据 / 精选案例 / 经历 / 能力 / 照片 / 联系）
experience.html     完整经历时间线 + 校园实践 + 教育证书荣誉
resume.html         在线简历（可打印）+ 简历 PDF 下载
about.html          关于我 + 照片轮播 + 价值观 + 更多产出
works/              案例详情页（rodeo / vibing / hicustom / events / other）
assets/photos/      个人生活照 4 张（轮播使用）
assets/works/       作品集截图（来自个人作品集 PDF）
assets/resume/      简历 PDF（含手机号，仅下载使用）
assets/og-image.jpg 社交分享图
css/site.css        全局样式（:root 变量，亮/暗双主题）
js/site.js          互动：主题切换、移动导航、照片轮播、案例筛选、数字动画、灯箱
```

## 本地预览

在站点根目录启动静态服务器：

```bash
python3 -m http.server 8000
```

浏览器打开 `http://localhost:8000`。

## 部署

推荐 Cloudflare Pages / Vercel / GitHub Pages：

- 构建命令：留空（无构建）
- 输出目录：站点根目录（本项目目录）
- 上传整个目录即可

部署完成后，请把各页面 `<head>` 里的 `og:image` 从相对路径（`assets/og-image.jpg`）改成绝对 URL（如 `https://你的域名/assets/og-image.jpg`），否则微信/小红书分享卡片可能取不到图。

## 内容与隐私说明

- 页面公开邮箱 `13666004293@163.com`；手机号未在页面展示，仅在 `assets/resume/resume.pdf` 中
- 「企航新加坡」为实习期间参与运营的新加坡政府机关官方账号，网站已注明，不表述为个人账号
- 数据口径来自用户简历与个人作品集，已在页面标注统计期间；简历与作品集里的「超 50 篇」统一为网站口径
- 照片来自用户「桌面/照片」文件夹，用于网站轮播
- 作品截图来自用户个人作品集 PDF，均注明来源

## 更新内容

改文字/数字：直接编辑对应 HTML。
改颜色/字体：只改 `css/site.css` 顶部的 `:root` 变量，不重写组件样式。
换照片：替换 `assets/photos/` 下的图片（建议保持同尺寸比例）。
