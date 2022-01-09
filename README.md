# fp16

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg)](https://github.com/RichardLitt/standard-readme) [![license](https://img.shields.io/github/license/joeltg/fp16)](https://opensource.org/licenses/MIT) [![NPM version](https://img.shields.io/npm/v/fp16)](https://www.npmjs.com/package/fp16) ![TypeScript types](https://img.shields.io/npm/types/fp16) ![lines of code](https://img.shields.io/tokei/lines/github/joeltg/fp16)

Half-precision 16-bit floating point numbers.

[`DataView`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView) has APIs for getting and setting [float64s](https://en.wikipedia.org/wiki/Double-precision_floating-point_format) and [float32s](https://en.wikipedia.org/wiki/Single-precision_floating-point_format). This library provides the analogous methods for [float16s](https://en.wikipedia.org/wiki/Half-precision_floating-point_format), and utilities for testing how a given float64 value will convert to float32 and float16 values. Conversion implements the IEEE 754 default rounding behavior ("Round-to-Nearest RoundTiesToEven").

`NaN` is always encoded as `0x7e00`, which extends the pattern of how browsers serialize `NaN` in 32 bits and is the recommendation [in the CBOR spec](https://www.rfc-editor.org/rfc/rfc8949.html#name-deterministically-encoded-c).

This library is TypeScript-native, ESM-only, and has zero dependencies. It works in Node, the browser, and Deno.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Testing](#testing)
- [Credits](#credits)
- [Contributing](#contributing)
- [License](#license)

## Install

```
npm i fp16
```

Or in Deno:

```typescript
import { setFloat16, getFloat16 } from "https://cdn.skypack.dev/fp16"

// ...
```

## Usage

### Set a 16-bit float

```typescript
declare function setFloat16(view: DataView, offset: number, value: number): void
```

### Get a 16-bit float

```typescript
declare function getFloat16(view: DataView, offset: number): number
```

### Precision

In addition to methods for getting and setting float16s, `fp16` exports two methods for testing how a given `number` value will convert to 32-bit and 16-bit values.

```typescript
type Precision = "exact" | "overflow" | "underflow" | "inexact"

declare function getFloat32Precision(value: number): Precision
declare function getFloat16Precision(value: number): Precision
```

- `exact`: Conversion will not loose precision. The value is guaranteed to round-trip back to the same `number` value. Positive and negative zero, positive and negative infinity, and `NaN` all return `exact`. **Values that can be represented losslessly as a subnormal value in the target format will return `exact`.**
- `overflow`: the exponent of the given value is greater than the maximum exponent of the target size (`127` for float32 or `15` for float16). Conversion is guaranteed to overflow to +/- Infinity.
- `underflow`: the exponent of the given value is less than the minimum exponent _minus the number of fractional bits_ of the target size (`-126 - 23` for float32 or `-14 - 10` for float16). Conversion is guaranteed to underflow to +/- 0 **or** to the smallest signed subnormal value (`+/- 2^-24` for float16 or `+/- 2^-149` for float32).
- `inexact`: the exponent is within the target range, but precision bits will be lost during rounding. The value may round to +/- 0 but will never round to +/- Infinity.

Note that the boundaries for overflow and underflow are not what you might necessarily expect; this is because values with exponents just under the minimum exponent for a format map to subnormal values.

Also note that `fp16` treats all NaN values as identical, ignoring sign and signalling bits when decoding, and encoding every `NaN` value as `0x7e00`. This means that not all 16-bit values will round-trip through `setFloat16` and `getFloat16`.

## Testing

Tests use [AVA](https://github.com/avajs/ava) and live in the [test](./test/) directory.

```
npm run test
```

Tests cover decoding all 65536 possible 16-bit values, rounding behaviour, subnormal values, underflows, and overflows. More tests are always welcome.

## Credits

[This PDF](http://fox-toolkit.org/ftp/fasthalffloatconversion.pdf) was extremely helpful as a reference for understanding the float16 format, even though `fp16` doesn't use the table-based aproach it outlines.

The Golang [github.com/x448/float16](https://github.com/x448/float16) package was used as a reference for implementing rounding. The test suite in [tests/32to16.js](./test/32to16.js) was adapted from its test file [float16_test.go](https://github.com/x448/float16/blob/master/float16_test.go).

## Contributing

I don't expect to add any additional features to this library, or change any of the exported interfaces. If you encounter a bug or would like to add more tests, please open an issue to discuss it!

## License

MIT © 2021 Joel Gustafson
