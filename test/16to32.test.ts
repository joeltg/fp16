import test, { ExecutionContext } from "ava"
import { getFloat16, setFloat16 } from "fp16"

const float16Buffer = new ArrayBuffer(2)
const float16View = new DataView(float16Buffer)

function test16to32(t: ExecutionContext, littleEndian: boolean) {
	for (let i = 0; i < 0xffff; i++) {
		float16View.setUint16(0, i, littleEndian)
		const f = getFloat16(float16View, 0, littleEndian)

		// The only values that don't round-trip are NaN, which always get serialized as 0x7e00
		// A value is NaN iff exponent === 0x7c00 AND mantissa !== 0
		const exponent = i & 0x7c00
		const mantissa = i & 0x03ff
		if (exponent === 0x7c00 && mantissa !== 0) {
			t.true(isNaN(f), "decode NaN value")
			setFloat16(float16View, 0, f, littleEndian)
			t.is(float16View.getUint16(0, littleEndian), 0x7e00, "encode all NaN values as 0x7e00")
		} else {
			setFloat16(float16View, 0, f, littleEndian)
			t.is(float16View.getUint16(0, littleEndian), i, "recover original uint16")
		}
	}
}

test("round-trip every 16-bit value to float64 and back (big-endian)", (t) => {
	test16to32(t, false)
})

test("round-trip every 16-bit value to float64 and back (little-endian)", (t) => {
	test16to32(t, true)
})
