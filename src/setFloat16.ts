import {
	float16Emin,
	float16Emax,
	float32Emax,
	float32Precision,
	float32View,
} from "./utils.js"

export function setFloat16(
	view: DataView,
	offset: number,
	value: number,
	littleEndian?: boolean,
) {
	if (isNaN(value)) {
		return view.setUint16(offset, 0x7e00, littleEndian)
	} else if (value === Infinity) {
		return view.setUint16(offset, 0x7c00, littleEndian)
	} else if (value === -Infinity) {
		return view.setUint16(offset, 0xfc00, littleEndian)
	} else if (Object.is(value, 0)) {
		return view.setUint16(offset, 0, littleEndian)
	} else if (Object.is(value, -0)) {
		return view.setUint16(offset, 0x8000, littleEndian)
	}

	float32View.setFloat32(0, value, littleEndian)
	const i32 = float32View.getInt32(0, littleEndian)
	const sign = i32 & (1 << 31)
	const exponent = i32 & 0x7f800000
	const mantissa = i32 & 0x007fffff

	const exponentValue = (exponent >>> float32Precision) - float32Emax
	const e = exponentValue + float16Emax

	if (float16Emax < exponentValue) {
		// overflow to +/- Infinity
		return view.setUint16(offset, (sign >>> 16) | 0x7c00, littleEndian)
	}

	if (exponentValue < float16Emin) {
		if (14 - e > 24) {
			// cannot be rounded to a subnormal number; underflow to +/- 0
			return view.setUint16(0, sign >>> 16, littleEndian)
		} else {
			// can be rounded to a subnormal number
			const c = mantissa | 0x00800000
			const m = c >>> (14 - e)
			const r = 1 << (13 - e)

			if (c & r && c & (3 * r - 1)) {
				return view.setUint16(offset, (sign >>> 16) | (m + 1), littleEndian)
			} else {
				return view.setUint16(offset, (sign >>> 16) | m, littleEndian)
			}
		}
	}

	const r = 0x00001000
	let i16 = (sign >>> 16) | (e << 10) | (mantissa >> 13)
	if (mantissa & r && mantissa & (3 * r - 1)) {
		return view.setUint16(offset, i16 + 1, littleEndian)
	} else {
		return view.setUint16(offset, i16, littleEndian)
	}
}
