import { Parser } from 'expr-eval'

const parser = new Parser()
const RESERVED = new Set(['x', 'y', 't', 'pi', 'e', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'exp', 'ln', 'log', 'sqrt', 'abs', 'ceil', 'floor', 'round', 'min', 'max', 'sinh', 'cosh', 'tanh'])

export const OBJECT_TYPES = {
  cartesian2d: { label: '2D 笛卡尔', short: 'y = f(x)' },
  parametric2d: { label: '2D 参数曲线', short: 'x(t), y(t)' },
  surface3d: { label: '3D 曲面', short: 'z = f(x, y)' },
  parametric3d: { label: '3D 参数曲线', short: 'x(t), y(t), z(t)' },
}

export const PRESETS = {
  academic: { label: '学术印刷', background: '#ffffff', paper: '#ffffff', text: '#26364a', grid: '#d7dee7', color: '#3157b7', font: 13, lineWidth: 3, transparent: false },
  light: { label: 'Obsidian 浅色', background: '#f7f8fa', paper: '#f7f8fa', text: '#293241', grid: '#d7dce3', color: '#3157b7', font: 13, lineWidth: 3, transparent: false },
  dark: { label: 'Obsidian 深色', background: '#20242b', paper: '#20242b', text: '#e7ebf0', grid: '#454c58', color: '#71a7ff', font: 13, lineWidth: 3, transparent: false },
  minimal: { label: '极简', background: '#ffffff', paper: '#ffffff', text: '#293241', grid: '#ffffff', color: '#26364a', font: 13, lineWidth: 3, transparent: false },
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
]

export function normalizeExpression(input = '') {
  return String(input).trim().replace(/[−–—]/g, '-').replace(/π/g, 'pi').replace(/√\s*\(/g, 'sqrt(').replace(/√\s*([a-zA-Z0-9.]+)/g, 'sqrt($1)').replace(/\bln\b/g, 'log').replace(/\^\{([^{}]+)\}/g, '^($1)').replace(/\\left|\\right/g, '').replace(/\\cdot/g, '*').replace(/\\pi/g, 'pi').replace(/\\(sin|cos|tan|exp|ln|log|sqrt|abs)/g, '$1')
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
    throw new Error(error.message || '表达式无法解析。')
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

export function defaultParameter(key) { return { value: 1, min: -5, max: 5, step: 0.1, key } }
function sample(start, end, segments) { return Array.from({ length: segments + 1 }, (_, index) => start + ((end - start) * index) / segments) }
function finite(value) { return typeof value === 'number' && Number.isFinite(value) ? value : null }
function lineTrace(x, y, name, color, lineWidth) { return { type: 'scatter', mode: 'lines', x, y, name, connectgaps: false, hovertemplate: 'x = %{x:.3f}<br>y = %{y:.3f}<extra></extra>', line: { color, width: lineWidth } } }
function curve3dTrace(x, y, z, name, color, lineWidth) { return { type: 'scatter3d', mode: 'lines', x, y, z, name, connectgaps: false, hovertemplate: 'x = %{x:.3f}<br>y = %{y:.3f}<br>z = %{z:.3f}<extra></extra>', line: { color, width: lineWidth } } }
function surfaceTrace(x, y, z, name, color, showGrid) { return { type: 'surface', x, y, z, name, showscale: false, hovertemplate: 'x = %{x:.3f}<br>y = %{y:.3f}<br>z = %{z:.3f}<extra></extra>', colorscale: [[0, '#dbe7ff'], [0.45, color], [1, '#192d5b']], contours: { x: { show: showGrid, color: 'rgba(255,255,255,.32)', width: 1 }, y: { show: showGrid, color: 'rgba(255,255,255,.32)', width: 1 }, z: { show: false } }, lighting: { ambient: 0.78, diffuse: 0.82, roughness: 0.72, specular: 0.18 } } }
function evaluate(compiled, scope) { try { return finite(compiled.evaluate(scope)) } catch { return null } }

export function buildPlotData(object, settings = object) {
  const { type, expressions, parameters = {}, range, density = 42, color = PRESETS.academic.color, lineWidth = 3, showGrid = true } = object
  const parameterValues = Object.fromEntries(Object.entries(parameters).map(([key, item]) => [key, typeof item === 'number' ? item : item.value]))
  const parameterKeys = Object.keys(parameterValues)
  const segments = Math.min(160, Math.max(32, density * 3))
  if (type === 'cartesian2d') {
    const { compiled } = compileExpression(expressions.y || expressions.expression || expressions, ['x', ...parameterKeys])
    const x = sample(range.x[0], range.x[1], segments)
    return [lineTrace(x, x.map((value) => evaluate(compiled, { x: value, ...parameterValues })), 'y = f(x)', color, lineWidth)]
  }
  if (type === 'parametric2d') {
    const xCompiled = compileExpression(expressions.x, ['t', ...parameterKeys]).compiled
    const yCompiled = compileExpression(expressions.y, ['t', ...parameterKeys]).compiled
    const t = sample(range.t[0], range.t[1], segments)
    return [lineTrace(t.map((value) => evaluate(xCompiled, { t: value, ...parameterValues })), t.map((value) => evaluate(yCompiled, { t: value, ...parameterValues })), '参数曲线', color, lineWidth)]
  }
  if (type === 'parametric3d') {
    const compiled = ['x', 'y', 'z'].map((axis) => compileExpression(expressions[axis], ['t', ...parameterKeys]).compiled)
    const t = sample(range.t[0], range.t[1], segments)
    return [curve3dTrace(...compiled.map((item) => t.map((value) => evaluate(item, { t: value, ...parameterValues }))), '参数曲线', color, lineWidth)]
  }
  const compiled = compileExpression(expressions.z || expressions.expression || expressions, ['x', 'y', ...parameterKeys]).compiled
  const axisX = sample(range.x[0], range.x[1], Math.min(80, density))
  const axisY = sample(range.y[0], range.y[1], Math.min(80, density))
  const x = axisY.map(() => [...axisX])
  const y = axisY.map((value) => axisX.map(() => value))
  const z = axisY.map((yValue) => axisX.map((xValue) => evaluate(compiled, { x: xValue, y: yValue, ...parameterValues })))
  return [surfaceTrace(x, y, z, 'z = f(x, y)', color, showGrid)]
}

export function objectFromExample(example) {
  const expressions = example.type === 'cartesian2d' ? { y: example.expression } : example.type === 'surface3d' ? { z: example.expression } : example.expressions
  const parameters = Object.fromEntries(Object.entries(example.parameters || {}).map(([key, value]) => [key, { key, ...value }]))
  return { id: example.id, name: example.name, subtitle: example.subtitle, type: example.type, expressions, parameters, range: example.range, density: 42, color: PRESETS.academic.color, lineWidth: 3, showGrid: true, showAxes: true, preset: 'academic', title: '' }
}

export function formulaText(object) {
  const expressions = object.expressions || {}
  if (object.type === 'cartesian2d') return `y = ${expressions.y}`
  if (object.type === 'parametric2d') return `x(t) = ${expressions.x}，y(t) = ${expressions.y}`
  if (object.type === 'parametric3d') return `x(t) = ${expressions.x}，y(t) = ${expressions.y}，z(t) = ${expressions.z}`
  return `z = ${expressions.z}`
}

export function encodeState(object) { return btoa(unescape(encodeURIComponent(JSON.stringify(object)))) }
export function decodeState(value) { return JSON.parse(decodeURIComponent(escape(atob(value)))) }
