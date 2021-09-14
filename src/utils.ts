const float32Buffer = new ArrayBuffer(4)

export const float32View = new DataView(float32Buffer)

export const float16Precision = 10
export const float16Emax = 15
export const float16Emin = -14

export const float32Precision = 23
export const float32Emax = 127
export const float32Emin = -126

/**
 *
 * @param value an int32 representing the bits of a float32
 * @returns a pretty string showing the sign, exponent, and mantissa bits
 */
export function format32(value: number): string {
	const a = value >>> 16
	const b = value & 0x0000ffff
	const b16 = a.toString(16).padStart(4, "0") + b.toString(16).padStart(4, "0")
	const b02 = a.toString(2).padStart(16, "0") + b.toString(2).padStart(16, "0")
	return `0x${b16} | ${b02[0]} ${b02.slice(1, 9)} ${b02.slice(9)}`
}

/**
 *
 * @param value a uint16 representing the bits of a float16
 * @returns a pretty string showing the sign, exponent, and mantissa bits
 */
export function format16(value: number): string {
	const b16 = value.toString(16).padStart(4, "0")
	const b02 = value.toString(2).padStart(16, "0")
	return `0x${b16} | ${b02[0]} ${b02.slice(1, 6)} ${b02.slice(6)}`
}
