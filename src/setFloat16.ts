import {
	float16Emin,
	float16Emax,
	float32Emax,
	float32Precision,
	float32View,
} from "./utils.js"

export function setFloat16(view: DataView, offset: number, value: number) {
	if (isNaN(value)) {
		return view.setUint16(offset, 0x7e00)
	} else if (value === Infinity) {
		return view.setUint16(offset, 0x7c00)
	} else if (value === -Infinity) {
		return view.setUint16(offset, 0xfc00)
	} else if (value === 0) {
		if (1 / value === Infinity) {
			return view.setUint16(offset, 0)
		} else {
			return view.setUint16(offset, 0x8000)
		}
	}

	float32View.setFloat32(0, value)
	const i32 = float32View.getInt32(0)
	const sign = i32 & (1 << 31)
	const exponent = i32 & 0x7f800000
	const mantissa = i32 & 0x007fffff

	const exponentValue = (exponent >>> float32Precision) - float32Emax
	const e = exponentValue + float16Emax

	if (float16Emax < exponentValue) {
		// round to +/- Infinity
		return view.setUint16(offset, (sign >>> 16) | 0x7c00)
	}

	if (exponentValue < float16Emin) {
		if (14 - e > 24) {
			// cannot be rounded to a subnormal number; underflow to +/- 0
			return view.setUint16(0, sign >>> 16)
		} else {
			// can be rounded to a subnormal number
			const c = mantissa | 0x00800000
			const m = c >>> (14 - e)
			const r = 1 << (13 - e)

			if (c & r && c & (3 * r - 1)) {
				return view.setUint16(offset, (sign >>> 16) | (m + 1))
			} else {
				return view.setUint16(offset, (sign >>> 16) | m)
			}
		}
	}

	const r = 0x00001000
	let i16 = (sign >>> 16) | (e << 10) | (mantissa >> 13)
	if (mantissa & r && mantissa & (3 * r - 1)) {
		return view.setUint16(offset, i16 + 1)
	} else {
		return view.setUint16(offset, i16)
	}
}
