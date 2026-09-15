# 悟空借芭蕉扇 · V33 雨字头第一关

本仓库仅包含已完成的第一关运行文件。静态站点位于 `site/`，保持V33已确认的图片、原配音、视频与交互。

- Cloudflare Pages 项目：`wukong-video-v33`
- 当前部署：https://wukong-video-v33.pages.dev/
- 正式域名：https://videodemo.chenjialing.cn/ （需完成DNS与证书验证）
- 发布方式：直接上传。GitHub为源码备份，尚未配置自动发布。

## 本地运行

```sh
python3 -m http.server 8768 --directory site
```

## 发布

登录Cloudflare后执行：

```sh
npx wrangler pages deploy site --project-name wukong-video-v33 --branch main
```

本仓库不包含历史课件、资源包、分析文档、账号凭据。首次打开有声播放仍受浏览器策略约束；用户点击后正常启用。视频含正式配音，正式雨字徽章由H5叠加。
