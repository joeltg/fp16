import test from "ava"

import { getFloat16Precision, getFloat32Precision } from "../lib/index.js"

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
		"exact",
		"smallest positive subnormal number"
	)

	t.is(
		getFloat16Precision(Math.pow(2, -25)),
		"underflow",
		"one exponent below the smallest positive subnormal number"
	)

	t.is(
		getFloat16Precision(Math.pow(2, -24) + Math.pow(2, -25)),
		"inexact",
		"one bit of precision beyond the smallest positive subnormal number"
	)

	t.is(
		getFloat16Precision(Math.pow(2, 15) * (1 + 1023 / 1024)),
		"exact",
		"largest normal number"
	)

	t.is(
		getFloat16Precision(Math.pow(2, 16)),
		"overflow",
		"one exponent above the largest normal number"
	)

	t.is(
		getFloat16Precision(Math.pow(2, 15) * (1 + 2047 / 2048)),
		"inexact",
		"one bit of precision above the largest normal number"
	)
})

test("validate 32-bit boundaries", (t) => {
	t.is(
		getFloat32Precision(Math.pow(2, -149)),
		"exact",
		"smallest positive subnormal number"
	)

	t.is(
		getFloat32Precision(Math.pow(2, -150)),
		"underflow",
		"one exponent below the smallest positive subnormal number"
	)

	t.is(
		getFloat32Precision(Math.pow(2, -149) + Math.pow(2, -150)),
		"inexact",
		"one bit of precision beyond the smallest positive subnormal number"
	)

	t.is(
		getFloat32Precision(Math.pow(2, 127) * (2 - Math.pow(2, -23))),
		"exact",
		"largest normal number"
	)

	t.is(
		getFloat32Precision(Math.pow(2, 128)),
		"overflow",
		"one exponent above the largest normal number"
	)

	t.is(
		getFloat32Precision(Math.pow(2, 127) * (2 - Math.pow(2, -24))),
		"inexact",
		"one bit of precision above the largest normal number"
	)
})

// copied from https://github.com/x448/float16/blob/master/float16_test.go
test("validate 16-bit precisions", (t) => {
	t.is(
		getFloat16Precision(5.5),
		"exact",
		"value that doesn't drop any bits in the significand, is within normal exponent range"
	)

	t.is(
		getFloat16Precision(f32(0b0_01110000_00000000000000000000000)),
		"exact",
		"subnormal value with coef = 0 that can round-trip float32->float16->float32"
	)

	t.is(
		getFloat16Precision(f32(0b0_01110000_11111111100000000000000)),
		"exact",
		"subnormal value with coef !=0 that can round-trip float32->float16->float32"
	)

	t.is(
		getFloat16Precision(f32(0b0_01100111_10000000000000000000000)),
		"inexact",
		"subnormal value with no dropped bits that cannot round-trip float32->float16->float32"
	)

	t.is(
		getFloat16Precision(f32(0b0_01110000_00000000000000000000001)),
		"inexact",
		"subnormal value with dropped non-zero bits > 0"
	)

	t.is(
		getFloat16Precision(Math.PI),
		"inexact",
		'value that cannot "preserve value" because it drops bits in the significand'
	)

	t.is(
		getFloat16Precision(f32(0b0_00000000_00000000000000000000001)),
		"underflow",
		"value that will underflow"
	)

	t.is(
		getFloat16Precision(f32(0b0_01100110_00000000000000000000000)),
		"underflow",
		"value that will underflow"
	)

	t.is(
		getFloat16Precision(f32(0b0_10001111_00000000000000000000000)),
		"overflow",
		"value that will overflow"
	)
})

test("validate 32-bit precisions", (t) => {
	t.is(
		getFloat32Precision(5.5),
		"exact",
		"value that doesn't drop any bits in the significand, is within normal exponent range"
	)

	t.is(
		getFloat32Precision(
			f64(0b0_01101111101_0000000000000000000000000000000000000000000000000000n)
		),
		"exact",
		"subnormal value with coef = 0 that can round-trip float64->float32->float64"
	)

	t.is(
		getFloat32Precision(
			f64(0b0_01101111101_1111100000000000000000000000000000000000000000000000n)
		),
		"exact",
		"subnormal value with coef !=0 that can round-trip float64->float32->float64"
	)

	t.is(
		getFloat32Precision(
			f64(0b0_01101101010_1000000000000000000000000000000000000000000000000000n)
		),
		"inexact",
		"subnormal value with no dropped bits that cannot round-trip float64->float32->float64"
	)

	t.is(
		getFloat32Precision(
			f64(0b0_01101111101_0000000000000000000000000000000000000000000000000111n)
		),
		"inexact",
		"subnormal value with dropped non-zero bits > 0"
	)

	t.is(
		getFloat32Precision(Math.PI),
		"inexact",
		'value that cannot "preserve value" because it drops bits in the significand'
	)

	t.is(
		getFloat32Precision(
			f64(0b0_00000000000_0000000000000000000000000000000000000000000000000111n)
		),
		"underflow",
		"value that will underflow"
	)

	t.is(
		getFloat32Precision(
			f64(0b0_01101101001_0000000000000000000000000000000000000000000000000000n)
		),
		"underflow",
		"value that will underflow"
	)

	t.is(
		getFloat32Precision(
			f64(0b0_10001111111_0000000000000000000000000000000000000000000000000000n)
		),
		"overflow",
		"value that will overflow"
	)
})
