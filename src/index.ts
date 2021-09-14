/**
 * General reference: http://fox-toolkit.org/ftp/fasthalffloatconversion.pdf
 * 32-to-16 bit rounding (RoundTiesToEven) is adapted from
 * https://github.com/x448/float16/blob/381b899e2959cbb4cfa8005209f3e55df39df292/float16.go
 */

export * from "./getFloat16.js"
export * from "./setFloat16.js"
export * from "./precision.js"
export { format16, format32 } from "./utils.js"
