import { float32View } from "./utils.js"

export function getFloat16(view: DataView, offset: number): number {
	const value = view.getUint16(offset)
	const sign = value & 0x8000
	const exponent = value & 0x7c00
	const mantissa = value & 0x03ff
	if (exponent === 0) {
		if (mantissa === 0) {
			return sign ? -0 : 0
		} else {
			let e = 127 - 14
			let m = mantissa
			while ((m & 0x400) === 0) {
				e--
				m <<= 1
			}
			m &= ~0x400
			float32View.setInt32(0, (sign << 16) | (e << 23) | (m << 13))
			return float32View.getFloat32(0)
		}
	} else if (exponent === 0x7c00) {
		if (mantissa === 0) {
			return sign ? -Infinity : Infinity
		} else {
			return NaN
		}
	} else {
		const e = (exponent + 0x01c000) << 13
		const m = mantissa << 13
		const i = (sign << 16) | e | m
		float32View.setInt32(0, i)
		return float32View.getFloat32(0)
	}
}
