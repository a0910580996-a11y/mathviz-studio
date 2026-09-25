# MathViz Studio

MathViz Studio 是一个无需登录的数学可视化工作台：在浏览器中输入数学表达式，调节参数和定义域，观察二维或三维数学对象，并导出适合笔记使用的图像。

## 本地启动

```powershell
npm install
npm run dev
```

打开终端输出的本地地址即可。生产构建使用 `npm run build`。

## V1 支持

- 2D 笛卡尔函数：`y = f(x)`
- 2D 参数曲线：`x(t), y(t)`
- 3D 曲面：`z = f(x, y)`
- 3D 参数曲线：`x(t), y(t), z(t)`
- 常见表达式：`sin`、`cos`、`tan`、`exp`、`ln`、`log`、`sqrt`、`abs`、`pi`、`e`、`^`
- 自由参数滑块、显示范围、采样密度、网格、坐标轴、笔记风格预设
- PNG、JPG、SVG 导出，Obsidian / LaTeX 片段复制，Python 示例代码下载
- URL hash 分享与恢复

## 部署

`.github/workflows/deploy.yml` 已配置 GitHub Pages。将仓库推送到 GitHub 的 `main` 分支并在仓库设置中启用 Pages 的 GitHub Actions 来源后，工作流会自动发布 `dist`。

GitHub Pages 在中国大陆的访问速度和可达性受网络环境影响，产品本身不需要服务器、数据库或 API Key。
