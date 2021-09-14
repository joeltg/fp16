import {
	float16Precision,
	float16Emin,
	float16Emax,
	float32Precision,
	float32Emin,
	float32Emax,
} from "./utils.js"

const float64Buffer = new ArrayBuffer(8)
const float64View = new DataView(float64Buffer)

export type Precision = "exact" | "inexact" | "underflow" | "overflow"

/**
 *
 * @param value a float64 value
 * @returns a Precision enum indicating whether conversion to float16 will overflow, underflow, round inexactly, or preserve the exact value
 */
export function getFloat16Precision(value: number): Precision {
	if (isNaN(value) || value === 0) {
		return "exact"
	} else if (value === Infinity || value === -Infinity) {
		return "exact"
	}

	float64View.setFloat64(0, value)
	const a = float64View.getInt32(0)
	const b = float64View.getInt32(4)
	const exponent = a & 0x7ff00000
	const exponentValue = (exponent >>> 20) - 1023

	if (float16Emax < exponentValue) {
		return "overflow"
	} else if (exponentValue < float16Emin - float16Precision) {
		return "underflow"
	}

	const significantBits = getSignificantBits(a & 0x000fffff, b)
	if (float16Precision < significantBits) {
		return "inexact"
	}

	if (exponentValue < float16Emin) {
		if (float16Emin - exponentValue <= float16Precision - significantBits) {
			// in this case the value can be encoded losslessly as a subnormal number
			return "exact"
		} else {
			return "inexact"
		}
	} else {
		return "exact"
	}
}

/**
 *
 * @param value a float64 value
 * @returns a Precision enum indicating whether conversion to float32 will overflow, underflow, round inexactly, or preserve the exact value
 */
export function getFloat32Precision(value: number): Precision {
	if (isNaN(value) || value === 0) {
		return "exact"
	} else if (value === Infinity || value === -Infinity) {
		return "exact"
	}

	float64View.setFloat64(0, value)
	const a = float64View.getInt32(0)
	const b = float64View.getInt32(4)
	const exponent = a & 0x7ff00000
	const exponentValue = (exponent >>> 20) - 1023

	if (float32Emax < exponentValue) {
		return "overflow"
	} else if (exponentValue < float32Emin - float32Precision) {
		return "underflow"
	}

	const significantBits = getSignificantBits(a & 0x000fffff, b)
	if (float32Precision < significantBits) {
		return "inexact"
	}

	if (exponentValue < float32Emin) {
		if (float32Emin - exponentValue <= float32Precision - significantBits) {
			// in this case the value can be encoded losslessly as a subnormal number
			return "exact"
		} else {
			return "inexact"
		}
	} else {
		return "exact"
	}
}

/**
 *
 * @param a the first 20 bits of the mantissa
 * @param b the last 32 bits of the mantissa
 * @returns the index of the rightmost 1 bit
 */
function getSignificantBits(a: number, b: number): number {
	if (b) {
		// if b is non-zero, then the total number of significant bits
		// is the index of the last significant bit in b plus 20
		let offsetB = 0
		for (let shiftedB = b; shiftedB; shiftedB <<= 1) {
			offsetB++
		}
		return offsetB + 20
	} else {
		// otherwise if b is zero, then the total number of significant bits
		// is the index, relative to 12, of the last significant bit in a
		let offsetA = 0
		// shift the lower 20 bits of a to the left end of an int32
		for (let shiftedA = a << 12; shiftedA; shiftedA <<= 1) {
			offsetA++
		}
		return offsetA
	}
}
