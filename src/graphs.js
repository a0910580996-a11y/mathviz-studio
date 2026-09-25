import { Parser } from 'expr-eval'

const parser = new Parser()
const RESERVED = new Set(['x', 'y', 't', 'pi', 'e', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'exp', 'ln', 'log', 'sqrt', 'abs', 'ceil', 'floor', 'round', 'min', 'max', 'sinh', 'cosh', 'tanh'])
const FUNCTIONS = new Set(['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'exp', 'ln', 'log', 'sqrt', 'abs', 'ceil', 'floor', 'round', 'min', 'max', 'sinh', 'cosh', 'tanh'])
const SUPERSCRIPT_DIGITS = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁺': '+', '⁻': '-' }
export const FUNCTION_COLORS = ['#c58f98', '#7faa9b', '#c5a45d', '#8ea4bb', '#a58fac', '#b8896f']

export const OBJECT_TYPES = {
  cartesian2d: { label: '二维函数图像', short: 'y = f(x)' },
  parametric2d: { label: '二维参数曲线', short: 'x(t), y(t)' },
  surface3d: { label: '三维曲面', short: 'z = f(x, y)' },
  parametric3d: { label: '三维参数曲线', short: 'x(t), y(t), z(t)' },
}

export const PRESETS = {
  academic: { label: '学术印刷', background: '#fcfcfb', paper: '#fcfcfb', text: '#454a50', grid: '#d9ddda', color: FUNCTION_COLORS[0], font: 13, lineWidth: 2.5, transparent: false },
  light: { label: 'Obsidian 浅色', background: '#f8f9f7', paper: '#f8f9f7', text: '#4d5358', grid: '#dfe2df', color: FUNCTION_COLORS[0], font: 13, lineWidth: 2.5, transparent: false },
  dark: { label: 'Obsidian 深色', background: '#282b2e', paper: '#282b2e', text: '#e4e5e3', grid: '#55595c', color: '#cda4aa', font: 13, lineWidth: 2.5, transparent: false },
  minimal: { label: '极简', background: '#ffffff', paper: '#ffffff', text: '#4d5358', grid: '#ffffff', color: '#737e86', font: 13, lineWidth: 2.5, transparent: false },
}

export const EXAMPLES = [
  { id: 'sin', name: '正弦函数', type: 'cartesian2d', expression: 'sin(x)', subtitle: '周期与振幅', range: { x: [-6.28, 6.28], y: [-2, 2] } },
  { id: 'parabola', name: '抛物线', type: 'cartesian2d', expression: 'x^2 - 2*x + 1', subtitle: '二次函数', range: { x: [-4, 4], y: [-1, 12] } },
  { id: 'gaussian', name: '高斯函数', type: 'cartesian2d', expression: 'exp(-x^2)', subtitle: '钟形曲线', range: { x: [-4, 4], y: [-0.2, 1.2] } },
  { id: 'paraboloid', name: '二元抛物面', type: 'surface3d', expression: 'x^2 + y^2', subtitle: '椭圆抛物面', range: { x: [-4, 4], y: [-4, 4] } },
  { id: 'saddle', name: '马鞍面', type: 'surface3d', expression: 'x^2 - y^2', subtitle: '双曲抛物面', range: { x: [-4, 4], y: [-4, 4] } },
  { id: 'gaussian-surface', name: 'Gaussian surface', type: 'surface3d', expression: 'exp(-(x^2+y^2))', subtitle: '二维高斯曲面', range: { x: [-3, 3], y: [-3, 3] } },
  { id: 'helix', name: '三维螺旋线', type: 'parametric3d', expressions: { x: 'cos(t)', y: 'sin(t)', z: '0.2*t' }, subtitle: '参数曲线', range: { t: [0, 31.4] } },
  { id: 'parameter-surface', name: '参数曲面', type: 'surface3d', expression: 'a*x^2 + b*y^2', subtitle: '拖动 a、b 观察曲率', parameters: { a: { value: 1, min: 0.1, max: 3, step: 0.1 }, b: { value: 0.5, min: 0.1, max: 3, step: 0.1 } }, range: { x: [-3, 3], y: [-3, 3] } },
  { id: 'power-saddle', name: '可变系数与次方曲面', type: 'surface3d', expression: 'a*x^p - b*y^q', subtitle: '拖动 a、b、p、q 改变形状', parameters: { a: { value: 1, min: -3, max: 3, step: 0.1 }, b: { value: 1, min: -3, max: 3, step: 0.1 }, p: { value: 2, min: 0.2, max: 5, step: 0.1 }, q: { value: 2, min: 0.2, max: 5, step: 0.1 } }, range: { x: [-3, 3], y: [-3, 3] } },
]

export function normalizeExpression(input = '') {
  let source = String(input).trim()
  for (let pass = 0; pass < 4; pass += 1) source = source.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '(($1)/($2))').replace(/\\sqrt\s*\{([^{}]+)\}/g, 'sqrt($1)')
  const normalized = source.replace(/[−–—]/g, '-').replace(/π/g, 'pi').replace(/√\s*\(/g, 'sqrt(').replace(/√\s*([a-zA-Z0-9.]+)/g, 'sqrt($1)').replace(/\bln\b/g, 'log').replace(/\^\{([^{}]+)\}/g, '^($1)').replace(/\\left|\\right/g, '').replace(/\\cdot/g, '*').replace(/\\mathrm\s*\{e\}/g, 'e').replace(/\\pi/g, 'pi').replace(/\\(sin|cos|tan|exp|ln|log|sqrt|abs|mu|sigma|alpha|beta|gamma)/g, '$1').replace(/([a-zA-Z0-9.)]+)([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+)/g, (_, base, power) => `${base}^(${[...power].map((digit) => SUPERSCRIPT_DIGITS[digit]).join('')})`).replace(/(?<![a-zA-Z])([a-zA-Z])\s*(?=[xyz]\b)/g, '$1*')
  return normalized.replace(/(\d|\)|\bpi\b|\be\b)(?=\s*[a-zA-Z_(])/g, '$1*').replace(/([a-zA-Z_]\w*)(?=\s*\()/g, (name) => FUNCTIONS.has(name) ? name : `${name}*`)
}

export function compileExpression(expression, variables = []) {
  const normalized = normalizeExpression(expression)
  if (!normalized) throw new Error('表达式不能为空。')
  try {
    const node = parser.parse(normalized)
    const symbols = node.variables()
    const unknown = [...new Set(symbols)].filter((symbol) => !RESERVED.has(symbol) && !variables.includes(symbol))
    if (unknown.length) throw new Error(`包含未识别的符号：${unknown.join('、')}`)
    return { normalized, compiled: node }
  } catch (error) {
    throw new Error(error.message?.startsWith('包含未识别') ? error.message : `表达式无法解析：${error.message || '请检查括号和运算符。'}`)
  }
}

export function detectParameters(expressions, variables) {
  const names = new Set()
  for (const expression of expressions) {
    try {
      parser.parse(normalizeExpression(expression)).variables().forEach((name) => {
        if (!RESERVED.has(name) && !variables.includes(name)) names.add(name)
      })
    } catch { /* compileExpression provides the user-facing error */ }
  }
  return [...names].sort()
}

export function defaultParameter(key) { return /^[pqn]$/i.test(key) ? { value: 2, min: 0.2, max: 5, step: 0.1, key } : { value: 1, min: -5, max: 5, step: 0.1, key } }
function sample(start, end, segments) { return Array.from({ length: segments + 1 }, (_, index) => start + ((end - start) * index) / segments) }
function finite(value) { return typeof value === 'number' && Number.isFinite(value) ? value : null }
function endpointValue(input) {
  const value = String(input).trim().replace(/∞|\\infty/g, 'inf')
  if (/^[+]?inf$/i.test(value)) return Infinity
  if (/^-inf$/i.test(value)) return -Infinity
  try { return Number(parser.parse(normalizeExpression(value)).evaluate({ pi: Math.PI, e: Math.E })) } catch { return Number.NaN }
}
export function parseDomain(input, fallback = [-8, 8]) {
  const text = String(input || '').trim().replace(/\\left|\\right/g, '').replace(/\\cup/g, '∪').replace(/\s+/g, ' ')
  if (!text || /全体实数|所有实数|实数范围/.test(text)) return [{ start: -Infinity, end: Infinity, startClosed: false, endClosed: false }]
  const parts = text.replace(/^[a-zA-Z_]+\s*[∈:]\s*/, '').split(/\s*(?:∪|U)\s*/).filter(Boolean)
  const intervals = parts.map((part) => {
    const match = part.match(/^([\[\(])\s*(.*?)\s*,\s*(.*?)\s*([\]\)])$/)
    if (!match) throw new Error('定义域格式应写成区间，例如：(-∞, 0) ∪ (1, ∞)。')
    const start = endpointValue(match[2])
    const end = endpointValue(match[3])
    if (Number.isNaN(start) || Number.isNaN(end) || start >= end) throw new Error('定义域区间的端点无效，请检查顺序和公式。')
    return { start, end, startClosed: match[1] === '[', endClosed: match[4] === ']' }
  })
  return intervals.length ? intervals : [{ start: fallback[0], end: fallback[1], startClosed: true, endClosed: true }]
}
export function domainViewRange(input, fallback = [-8, 8]) {
  const intervals = parseDomain(input, fallback)
  const starts = intervals.map((item) => Number.isFinite(item.start) ? item.start : fallback[0])
  const ends = intervals.map((item) => Number.isFinite(item.end) ? item.end : fallback[1])
  return [Math.min(...starts), Math.max(...ends)]
}
function domainSamples(input, fallback, segments) {
  const intervals = parseDomain(input, fallback)
  return intervals.flatMap((item, index) => { const start = Number.isFinite(item.start) ? item.start : fallback[0]; const end = Number.isFinite(item.end) ? item.end : fallback[1]; return [...(index ? [null] : []), ...sample(start, end, Math.max(12, Math.round(segments / Math.max(1, intervals.length))))] })
}
function domainContains(value, intervals) { return intervals.some((item) => value >= item.start && value <= item.end) }
function lineTrace(x, y, name, color, lineWidth) { return { type: 'scatter', mode: 'lines', x, y, name, connectgaps: false, hovertemplate: 'x = %{x:.3f}<br>y = %{y:.3f}<extra></extra>', line: { color, width: lineWidth } } }
function curve3dTrace(x, y, z, name, color, lineWidth) { return { type: 'scatter3d', mode: 'lines', x, y, z, name, connectgaps: false, hovertemplate: 'x = %{x:.3f}<br>y = %{y:.3f}<br>z = %{z:.3f}<extra></extra>', line: { color, width: lineWidth } } }
function surfaceTrace(x, y, z, name, color, showGrid) { return { type: 'surface', x, y, z, name, showscale: false, hovertemplate: 'x = %{x:.3f}<br>y = %{y:.3f}<br>z = %{z:.3f}<extra></extra>', colorscale: [[0, '#f1f0ed'], [0.45, color], [1, '#6d7478']], contours: { x: { show: showGrid, color: 'rgba(255,255,255,.52)', width: 1 }, y: { show: showGrid, color: 'rgba(255,255,255,.52)', width: 1 }, z: { show: false } }, lighting: { ambient: 0.82, diffuse: 0.72, roughness: 0.82, specular: 0.12 } } }
function evaluate(compiled, scope) { try { return finite(compiled.evaluate({ pi: Math.PI, e: Math.E, ...scope })) } catch { return null } }

export function buildPlotData(object, settings = object) {
  const { type, expressions, parameters = {}, range, density = 42, color = PRESETS.academic.color, lineWidth = 3, showGrid = true } = object
  const parameterValues = Object.fromEntries(Object.entries(parameters).map(([key, item]) => [key, typeof item === 'number' ? item : item.value]))
  const parameterKeys = Object.keys(parameterValues)
  const segments = Math.min(160, Math.max(32, density * 3))
  if (type === 'cartesian2d') {
    const { compiled } = compileExpression(expressions.y || expressions.expression || expressions, ['x', ...parameterKeys])
    const x = domainSamples(object.domain, range.x, segments)
    return [lineTrace(x, x.map((value) => value === null ? null : evaluate(compiled, { x: value, ...parameterValues })), object.name || '函数', color, lineWidth)]
  }
  if (type === 'parametric2d') {
    const xCompiled = compileExpression(expressions.x, ['t', ...parameterKeys]).compiled
    const yCompiled = compileExpression(expressions.y, ['t', ...parameterKeys]).compiled
    const t = domainSamples(object.domain, range.t, segments)
    return [lineTrace(t.map((value) => value === null ? null : evaluate(xCompiled, { t: value, ...parameterValues })), t.map((value) => value === null ? null : evaluate(yCompiled, { t: value, ...parameterValues })), object.name || '参数曲线', color, lineWidth)]
  }
  if (type === 'parametric3d') {
    const compiled = ['x', 'y', 'z'].map((axis) => compileExpression(expressions[axis], ['t', ...parameterKeys]).compiled)
    const t = domainSamples(object.domain, range.t, segments)
    return [curve3dTrace(...compiled.map((item) => t.map((value) => value === null ? null : evaluate(item, { t: value, ...parameterValues }))), object.name || '参数曲线', color, lineWidth)]
  }
  const compiled = compileExpression(expressions.z || expressions.expression || expressions, ['x', 'y', ...parameterKeys]).compiled
  const xIntervals = parseDomain(object.domainX, range.x)
  const yIntervals = parseDomain(object.domainY, range.y)
  const axisX = sample(...domainViewRange(object.domainX, range.x), Math.min(80, density))
  const axisY = sample(...domainViewRange(object.domainY, range.y), Math.min(80, density))
  const x = axisY.map(() => [...axisX])
  const y = axisY.map((value) => axisX.map(() => value))
  const z = axisY.map((yValue) => axisX.map((xValue) => domainContains(xValue, xIntervals) && domainContains(yValue, yIntervals) ? evaluate(compiled, { x: xValue, y: yValue, ...parameterValues }) : null))
  return [surfaceTrace(x, y, z, object.name || '曲面', color, showGrid)]
}

export function objectFromExample(example, color = FUNCTION_COLORS[0]) {
  const expressions = example.type === 'cartesian2d' ? { y: example.expression } : example.type === 'surface3d' ? { z: example.expression } : example.expressions
  const parameters = Object.fromEntries(Object.entries(example.parameters || {}).map(([key, value]) => [key, { key, ...value }]))
  const domain = example.domain || (example.type.includes('parametric') ? `[${example.range.t[0]}, ${example.range.t[1]}]` : '(-∞, ∞)')
  return { id: example.id, name: example.name, subtitle: example.subtitle, type: example.type, expressions, parameters, range: example.range, domain, domainX: example.domainX || '(-∞, ∞)', domainY: example.domainY || '(-∞, ∞)', density: 42, color, lineWidth: 2.5, showGrid: true, showAxes: true, equalAspect: true, visible: true, preset: 'academic', title: '', xLabel: 'x', yLabel: 'y', zLabel: 'z' }
}

export function objectForType(type, index = 0) {
  const example = type === 'cartesian2d' ? { ...EXAMPLES.find((item) => item.id === 'sin'), domain: '(-∞, ∞)' } : type === 'parametric2d' ? { id: 'parametric', name: '新参数曲线', type, expressions: { x: 'cos(t)', y: 'sin(t)' }, subtitle: '参数曲线', range: { t: [0, 6.28] }, domain: '[0, 2π]' } : type === 'surface3d' ? EXAMPLES.find((item) => item.id === 'saddle') : EXAMPLES.find((item) => item.id === 'helix')
  return objectFromExample({ ...example, type }, FUNCTION_COLORS[index % FUNCTION_COLORS.length])
}

export function formulaText(object) {
  const expressions = object.expressions || {}
  if (object.type === 'cartesian2d') return `y = ${expressions.y}`
  if (object.type === 'parametric2d') return `x(t) = ${expressions.x}，y(t) = ${expressions.y}`
  if (object.type === 'parametric3d') return `x(t) = ${expressions.x}，y(t) = ${expressions.y}，z(t) = ${expressions.z}`
  return `z = ${expressions.z}`
}

const PYTHON_FUNCTIONS = { sin: 'np.sin', cos: 'np.cos', tan: 'np.tan', asin: 'np.arcsin', acos: 'np.arccos', atan: 'np.arctan', exp: 'np.exp', log: 'np.log', sqrt: 'np.sqrt', abs: 'np.abs', ceil: 'np.ceil', floor: 'np.floor', sinh: 'np.sinh', cosh: 'np.cosh', tanh: 'np.tanh' }
export function pythonExpression(expression) {
  let source = normalizeExpression(expression).replace(/\^/g, '**')
  for (const [name, replacement] of Object.entries(PYTHON_FUNCTIONS)) source = source.replace(new RegExp(`\\b${name}\\b`, 'g'), replacement)
  return source.replace(/\bpi\b/g, 'np.pi').replace(/\be\b/g, 'np.e')
}

export function generatePythonCode(object) {
  const parameters = Object.entries(object.parameters || {}).map(([key, item]) => `${key} = ${typeof item === 'number' ? item : item.value}`).join('\n') || '# 本图没有自由参数'
  const header = `import numpy as np\nimport plotly.graph_objects as go\n\n# 自由参数\n${parameters}`
  const filename = `${String(object.id || 'mathviz-figure').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '') || 'mathviz-figure'}.html`
  const openResult = `fig.write_html(${JSON.stringify(filename)}, auto_open=True)`
  if (object.type === 'cartesian2d') return `${header}\n\n# 数学表达式\nx = np.linspace(${object.range.x[0]}, ${object.range.x[1]}, ${object.density * 3})\ny = ${pythonExpression(object.expressions.y)}\n\n# 绘制二维函数\nfig = go.Figure(go.Scatter(x=x, y=y, mode='lines', name=${JSON.stringify(object.name || '函数')}))\nfig.update_layout(title=${JSON.stringify(object.title || object.name || '')}, xaxis_title=${JSON.stringify(object.xLabel || 'x')}, yaxis_title=${JSON.stringify(object.yLabel || 'y')})\n${openResult}`
  if (object.type === 'surface3d') return `${header}\n\n# 生成曲面数据\nx = np.linspace(${object.range.x[0]}, ${object.range.x[1]}, ${object.density})\ny = np.linspace(${object.range.y[0]}, ${object.range.y[1]}, ${object.density})\nx, y = np.meshgrid(x, y)\nz = ${pythonExpression(object.expressions.z)}\n\n# 绘制三维曲面\nfig = go.Figure(go.Surface(x=x, y=y, z=z, name=${JSON.stringify(object.name || '曲面')}))\nfig.update_layout(title=${JSON.stringify(object.title || object.name || '')}, scene=dict(xaxis_title=${JSON.stringify(object.xLabel || 'x')}, yaxis_title=${JSON.stringify(object.yLabel || 'y')}, zaxis_title=${JSON.stringify(object.zLabel || 'z')}))\n${openResult}`
  const expression = object.expressions
  const variable = object.type.includes('3d') ? 't' : 't'
  const values = Object.entries(expression).map(([axis, value]) => `${axis} = ${pythonExpression(value)}`).join('\n')
  const trace = object.type === 'parametric3d' ? `go.Scatter3d(x=x, y=y, z=z, mode='lines', name=${JSON.stringify(object.name || '参数曲线')})` : `go.Scatter(x=x, y=y, mode='lines', name=${JSON.stringify(object.name || '参数曲线')})`
  const layout = object.type === 'parametric3d' ? `scene=dict(xaxis_title=${JSON.stringify(object.xLabel || 'x')}, yaxis_title=${JSON.stringify(object.yLabel || 'y')}, zaxis_title=${JSON.stringify(object.zLabel || 'z')})` : `xaxis_title=${JSON.stringify(object.xLabel || 'x')}, yaxis_title=${JSON.stringify(object.yLabel || 'y')}`
  return `${header}\n\n# 参数曲线数据\n${variable} = np.linspace(${object.range.t[0]}, ${object.range.t[1]}, ${object.density * 3})\n${values}\n\n# 绘制参数曲线\nfig = go.Figure(${trace})\nfig.update_layout(title=${JSON.stringify(object.title || object.name || '')}, ${layout})\n${openResult}`
}

export function encodeState(object) { return btoa(unescape(encodeURIComponent(JSON.stringify(object)))) }
export function decodeState(value) { return JSON.parse(decodeURIComponent(escape(atob(value)))) }
