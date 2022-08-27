import test from "ava"

import {
	getFloat16Precision,
	getFloat32Precision,
	Precision,
} from "../lib/index.js"

const float32Buffer = new ArrayBuffer(4)
const float32View = new DataView(float32Buffer)
function f32(i) {
	float32View.setUint32(0, i)
	return float32View.getFloat32(0)
}

const float64Buffer = new ArrayBuffer(8)
const float64View = new DataView(float64Buffer)
function f64(i) {
	float64View.setBigUint64(0, i)
	return float64View.getFloat64(0)
}

test("validate 16-bit boundaries", (t) => {
	t.is(
		getFloat16Precision(Math.pow(2, -24)),
		Precision.Exact,
		"smallest positive subnormal number"
	)

	t.is(
		getFloat16Precision(Math.pow(2, -25)),
		Precision.Underflow,
		"one exponent below the smallest positive subnormal number"
	)

	t.is(
		getFloat16Precision(Math.pow(2, -24) + Math.pow(2, -25)),
		Precision.Inexact,
		"one bit of precision beyond the smallest positive subnormal number"
	)

	t.is(
		getFloat16Precision(Math.pow(2, 15) * (1 + 1023 / 1024)),
		Precision.Exact,
		"largest normal number"
	)

	t.is(
		getFloat16Precision(Math.pow(2, 16)),
		Precision.Overflow,
		"one exponent above the largest normal number"
	)

	t.is(
		getFloat16Precision(Math.pow(2, 15) * (1 + 2047 / 2048)),
		Precision.Inexact,
		"one bit of precision above the largest normal number"
	)
})

test("validate 32-bit boundaries", (t) => {
	t.is(
		getFloat32Precision(Math.pow(2, -149)),
		Precision.Exact,
		"smallest positive subnormal number"
	)

	t.is(
		getFloat32Precision(Math.pow(2, -150)),
		Precision.Underflow,
		"one exponent below the smallest positive subnormal number"
	)

	t.is(
		getFloat32Precision(Math.pow(2, -149) + Math.pow(2, -150)),
		Precision.Inexact,
		"one bit of precision beyond the smallest positive subnormal number"
	)

	t.is(
		getFloat32Precision(Math.pow(2, 127) * (2 - Math.pow(2, -23))),
		Precision.Exact,
		"largest normal number"
	)

	t.is(
		getFloat32Precision(Math.pow(2, 128)),
		Precision.Overflow,
		"one exponent above the largest normal number"
	)

	t.is(
		getFloat32Precision(Math.pow(2, 127) * (2 - Math.pow(2, -24))),
		Precision.Inexact,
		"one bit of precision above the largest normal number"
	)
})

// copied from https://github.com/x448/float16/blob/master/float16_test.go
test("validate 16-bit precisions", (t) => {
	t.is(
		getFloat16Precision(5.5),
		Precision.Exact,
		"value that doesn't drop any bits in the significand, is within normal exponent range"
	)

	t.is(
		getFloat16Precision(f32(0b0_01110000_00000000000000000000000)),
		Precision.Exact,
		"subnormal value with coef = 0 that can round-trip float32->float16->float32"
	)

	t.is(
		getFloat16Precision(f32(0b0_01110000_11111111100000000000000)),
		Precision.Exact,
		"subnormal value with coef !=0 that can round-trip float32->float16->float32"
	)

	t.is(
		getFloat16Precision(f32(0b0_01100111_10000000000000000000000)),
		Precision.Inexact,
		"subnormal value with no dropped bits that cannot round-trip float32->float16->float32"
	)

	t.is(
		getFloat16Precision(f32(0b0_01110000_00000000000000000000001)),
		Precision.Inexact,
		"subnormal value with dropped non-zero bits > 0"
	)

	t.is(
		getFloat16Precision(Math.PI),
		Precision.Inexact,
		'value that cannot "preserve value" because it drops bits in the significand'
	)

	t.is(
		getFloat16Precision(f32(0b0_00000000_00000000000000000000001)),
		Precision.Underflow,
		"value that will underflow"
	)

	t.is(
		getFloat16Precision(f32(0b0_01100110_00000000000000000000000)),
		Precision.Underflow,
		"value that will underflow"
	)

	t.is(
		getFloat16Precision(f32(0b0_10001111_00000000000000000000000)),
		Precision.Overflow,
		"value that will overflow"
	)
})

test("validate 32-bit precisions", (t) => {
	t.is(
		getFloat32Precision(5.5),
		Precision.Exact,
		"value that doesn't drop any bits in the significand, is within normal exponent range"
	)

	t.is(
		getFloat32Precision(
			f64(0b0_01101111101_0000000000000000000000000000000000000000000000000000n)
		),
		Precision.Exact,
		"subnormal value with coef = 0 that can round-trip float64->float32->float64"
	)

	t.is(
		getFloat32Precision(
			f64(0b0_01101111101_1111100000000000000000000000000000000000000000000000n)
		),
		Precision.Exact,
		"subnormal value with coef !=0 that can round-trip float64->float32->float64"
	)

	t.is(
		getFloat32Precision(
			f64(0b0_01101101010_1000000000000000000000000000000000000000000000000000n)
		),
		Precision.Inexact,
		"subnormal value with no dropped bits that cannot round-trip float64->float32->float64"
	)

	t.is(
		getFloat32Precision(
			f64(0b0_01101111101_0000000000000000000000000000000000000000000000000111n)
		),
		Precision.Inexact,
		"subnormal value with dropped non-zero bits > 0"
	)

	t.is(
		getFloat32Precision(Math.PI),
		Precision.Inexact,
		'value that cannot "preserve value" because it drops bits in the significand'
	)

	t.is(
		getFloat32Precision(
			f64(0b0_00000000000_0000000000000000000000000000000000000000000000000111n)
		),
		Precision.Underflow,
		"value that will underflow"
	)

	t.is(
		getFloat32Precision(
			f64(0b0_01101101001_0000000000000000000000000000000000000000000000000000n)
		),
		Precision.Underflow,
		"value that will underflow"
	)

	t.is(
		getFloat32Precision(
			f64(0b0_10001111111_0000000000000000000000000000000000000000000000000000n)
		),
		Precision.Overflow,
		"value that will overflow"
	)
})
