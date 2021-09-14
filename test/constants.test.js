import test from "ava"

import { setFloat16, getFloat16 } from "../lib/index.js"

const b = new ArrayBuffer(2)
const v = new DataView(b)

test("NaN", (t) => {
	setFloat16(v, 0, NaN)

	t.is(getFloat16(v, 0), NaN)
	t.is(v.getUint16(0), 0x7e00)
})

// These are all the half-precision example floats given on the Wikipedia page:
// https://en.wikipedia.org/wiki/Half-precision_floating-point_format#Half_precision_examples

test("smallest positive subnormal number", (t) => {
	const f = Math.pow(2, -14) * (0 + 1 / 1024)
	setFloat16(v, 0, f)

	t.is(getFloat16(v, 0), f)
	t.is(v.getUint16(0), 0x0001)
})

test("largest subnormal number", (t) => {
	const f = Math.pow(2, -14) * (0 + 1023 / 1024)
	setFloat16(v, 0, f)

	t.is(getFloat16(v, 0), f)
	t.is(v.getUint16(0), 0x03ff)
})

test("smallest positive normal number", (t) => {
	const f = Math.pow(2, -14) * (1 + 0 / 1024)
	setFloat16(v, 0, f)

	t.is(getFloat16(v, 0), f)
	t.is(v.getUint16(0), 0x0400)
})

test("largest normal number", (t) => {
	const f = Math.pow(2, 15) * (1 + 1023 / 1024)
	setFloat16(v, 0, f)

	t.is(getFloat16(v, 0), f)
	t.is(v.getUint16(0), 0x7bff)
})

test("largest number less than one", (t) => {
	const f = Math.pow(2, -1) * (1 + 1023 / 1024)
	setFloat16(v, 0, f)

	t.is(getFloat16(v, 0), f)
	t.is(v.getUint16(0), 0x3bff)
})

test("one", (t) => {
	setFloat16(v, 0, 1)

	t.is(getFloat16(v, 0), 1)
	t.is(v.getUint16(0), 0x3c00)
})

test("smallest number larger than one", (t) => {
	const f = Math.pow(2, 0) * (1 + 1 / 1024)
	setFloat16(v, 0, f)

	t.is(getFloat16(v, 0), f)
	t.is(v.getUint16(0), 0x3c01)
})

test("the rounding of 1/3 to nearest", (t) => {
	const f = Math.pow(2, -2) * (1 + 341 / 1024)
	setFloat16(v, 0, f)

	t.is(getFloat16(v, 0), f)
	t.is(v.getUint16(0), 0x3555)
})

test("negative two", (t) => {
	setFloat16(v, 0, -2)

	t.is(getFloat16(v, 0), -2)
	t.is(v.getUint16(0), 0xc000)
})

test("positive zero", (t) => {
	setFloat16(v, 0, 0)

	const f = getFloat16(v, 0)
	t.is(f, 0)
	t.is(v.getUint16(0), 0x0000)
})

test("negative zero", (t) => {
	setFloat16(v, 0, -0)

	const f = getFloat16(v, 0)
	t.is(f, -0)
	t.is(v.getUint16(0), 0x8000)
})

test("positive infinity", (t) => {
	setFloat16(v, 0, Infinity)

	t.is(getFloat16(v, 0), Infinity)
	t.is(v.getUint16(0), 0x7c00)
})

test("negative infinity", (t) => {
	setFloat16(v, 0, -Infinity)

	t.is(getFloat16(v, 0), -Infinity)
	t.is(v.getUint16(0), 0xfc00)
})
