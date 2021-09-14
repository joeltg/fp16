import test from "ava"
import { getFloat16, setFloat16 } from "../lib/index.js"

const float16Buffer = new ArrayBuffer(2)
const float16View = new DataView(float16Buffer)

test("round-trip every 16-bit value to float64 and back", (t) => {
	for (let i = 0; i < 0xffff; i++) {
		float16View.setUint16(0, i)
		const f = getFloat16(float16View, 0)

		// The only values that don't round-trip are NaN, which always get serialized as 0x7e00
		// A value is NaN iff exponent === 0x7c00 AND mantissa !== 0
		const exponent = i & 0x7c00
		const mantissa = i & 0x03ff
		if (exponent === 0x7c00 && mantissa !== 0) {
			t.true(isNaN(f), "decode NaN value")
			setFloat16(float16View, 0, f)
			t.is(float16View.getUint16(0), 0x7e00, "encode all NaN values as 0x7e00")
		} else {
			setFloat16(float16View, 0, f)
			t.is(float16View.getUint16(0), i, "recover original uint16")
		}
	}
})
