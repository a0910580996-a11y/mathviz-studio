import test from 'node:test'
import assert from 'node:assert/strict'
import { buildPlotData, compileExpression, decodeState, detectParameters, encodeState, EXAMPLES, objectForType, objectFromExample } from '../src/graphs.js'

test('V1 覆盖四种数学对象类型和示例库', () => {
  assert.deepEqual(new Set(EXAMPLES.map((item) => item.type)), new Set(['cartesian2d', 'surface3d', 'parametric3d']))
  assert.ok(EXAMPLES.some((item) => item.id === 'helix'))
  assert.ok(EXAMPLES.some((item) => item.id === 'parameter-surface'))
})

test('安全解析支持常见数学表达式和自由参数识别', () => {
  assert.equal(compileExpression('x^2 - y^2', ['x', 'y']).compiled.evaluate({ x: 2, y: 1 }), 3)
  assert.equal(compileExpression('2x', ['x']).compiled.evaluate({ x: 3 }), 6)
  assert.equal(compileExpression('2(x + 1)', ['x']).compiled.evaluate({ x: 3 }), 8)
  assert.equal(compileExpression('x²', ['x']).compiled.evaluate({ x: 3 }), 9)
  assert.equal(compileExpression('\\frac{1}{1+x²}', ['x']).compiled.evaluate({ x: 1 }), 0.5)
  assert.equal(buildPlotData(objectFromExample({ id: 'pi', name: '圆周率', type: 'cartesian2d', expression: '2π', range: { x: [-1, 1] } }))[0].y[0], 2 * Math.PI)
  assert.deepEqual(detectParameters(['a*x^2 + b*y^2 + c'], ['x', 'y']), ['a', 'b', 'c'])
  assert.throws(() => compileExpression('process.exit()', ['x']), /未识别|无法解析/)
})

test('示例都能生成 Plotly 数据', () => {
  for (const example of EXAMPLES) {
    const traces = buildPlotData(objectFromExample(example))
    assert.ok(traces.length > 0, `${example.name} 没有轨迹`)
    assert.ok(['scatter', 'scatter3d', 'surface'].includes(traces[0].type))
  }
})

test('同一工作台可以叠加多个对象并使用不同的柔和颜色', () => {
  const first = objectForType('cartesian2d', 0)
  const second = objectForType('cartesian2d', 1)
  assert.notEqual(first.color, second.color)
  assert.equal(buildPlotData(first)[0].name, first.name)
  assert.equal(buildPlotData(second)[0].name, second.name)
})

test('非法点不会让 1/x 和 sqrt(x) 整页崩溃', () => {
  const reciprocal = objectFromExample({ id: 'reciprocal', name: '倒数', type: 'cartesian2d', expression: '1/x', range: { x: [-2, 2] } })
  const root = objectFromExample({ id: 'root', name: '根式', type: 'cartesian2d', expression: 'sqrt(x)', range: { x: [-2, 2] } })
  assert.ok(buildPlotData(reciprocal)[0].y.includes(null))
  assert.ok(buildPlotData(root)[0].y.includes(null))
})

test('当前对象可以序列化到分享状态并恢复', () => {
  const object = objectFromExample(EXAMPLES.find((item) => item.id === 'saddle'))
  const restored = decodeState(encodeState(object))
  assert.equal(restored.type, 'surface3d')
  assert.equal(restored.expressions.z, 'x^2 - y^2')
})
