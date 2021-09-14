import test from "ava"
import {
	getFloat16Precision,
	setFloat16,
	getFloat16,
	format32,
} from "../lib/index.js"

// Copied from https://github.com/x448/float16/blob/master/float16_test.go
const conversions = [
	[0x00000000, 0x0000], // in f32=0.000000, out f16=0
	[0x00000001, 0x0000], // in f32=0.000000, out f16=0
	[0x00001fff, 0x0000], // in f32=0.000000, out f16=0
	[0x00002000, 0x0000], // in f32=0.000000, out f16=0
	[0x00003fff, 0x0000], // in f32=0.000000, out f16=0
	[0x00004000, 0x0000], // in f32=0.000000, out f16=0
	[0x007fffff, 0x0000], // in f32=0.000000, out f16=0
	[0x00800000, 0x0000], // in f32=0.000000, out f16=0
	[0x33000000, 0x0000], // in f32=0.000000, out f16=0
	[0x33000001, 0x0001], // in f32=0.000000, out f16=0.000000059604645
	[0x33000002, 0x0001], // in f32=0.000000, out f16=0.000000059604645
	[0x387fc000, 0x03ff], // in f32=0.000061, out f16=0.00006097555 // exp32=-15 (underflows binary16 exp) but round-trips
	[0x387fffff, 0x0400], // in f32=0.000061, out f16=0.000061035156
	[0x38800000, 0x0400], // in f32=0.000061, out f16=0.000061035156
	[0x38801fff, 0x0401], // in f32=0.000061, out f16=0.00006109476
	[0x38802000, 0x0401], // in f32=0.000061, out f16=0.00006109476
	[0x38803fff, 0x0402], // in f32=0.000061, out f16=0.000061154366
	[0x38804000, 0x0402], // in f32=0.000061, out f16=0.000061154366
	[0x33bfffff, 0x0001], // in f32=0.000000, out f16=0.000000059604645
	[0x33c00000, 0x0002], // in f32=0.000000, out f16=0.00000011920929
	[0x33c00001, 0x0002], // in f32=0.000000, out f16=0.00000011920929
	[0x477fffff, 0x7c00], // in f32=65535.996094, out f16=+Inf
	[0x47800000, 0x7c00], // in f32=65536.000000, out f16=+Inf
	[0x7f7fffff, 0x7c00], // in f32=340282346638528859811704183484516925440.000000, out f16=+Inf
	[0x7f800000, 0x7c00], // in f32=+Inf, out f16=+Inf

	// This set of tests originally checked that the Go library
	// preserved the signalling bits of NaN values; this is not
	// a feature of this library because JavaScript NaN values don't
	// carry signalling bits and the ES spec requries that all
	// implementations serialize NaN in one consistent way in
	// the DataView API. This library serializes every NaN as 0x7e00,
	// which matches the pattern of how browsers serialize NaN in
	// 64 and 32 bits, and is also the canonical CBOR value for NaN.
	[0x7f801fff, 0x7e00], // in f32=NaN, out f16=NaN
	// [0x7f802000, 0x7e01], // in f32=NaN, out f16=NaN
	// [0x7f803fff, 0x7e01], // in f32=NaN, out f16=NaN
	// [0x7f804000, 0x7e02], // in f32=NaN, out f16=NaN
	// [0x7fffffff, 0x7fff], // in f32=NaN, out f16=NaN
	[0x7f802000, 0x7e00], // in f32=NaN, out f16=NaN
	[0x7f803fff, 0x7e00], // in f32=NaN, out f16=NaN
	[0x7f804000, 0x7e00], // in f32=NaN, out f16=NaN
	[0x7fffffff, 0x7e00], // in f32=NaN, out f16=NaN

	[0x80000000, 0x8000], // in f32=-0.000000, out f16=-0
	[0x80001fff, 0x8000], // in f32=-0.000000, out f16=-0
	[0x80002000, 0x8000], // in f32=-0.000000, out f16=-0
	[0x80003fff, 0x8000], // in f32=-0.000000, out f16=-0
	[0x80004000, 0x8000], // in f32=-0.000000, out f16=-0
	[0x807fffff, 0x8000], // in f32=-0.000000, out f16=-0
	[0x80800000, 0x8000], // in f32=-0.000000, out f16=-0
	[0xb87fc000, 0x83ff], // in f32=-0.000061, out f16=-0.00006097555 // exp32=-15 (underflows binary16 exp) but round-trips
	[0xb87fffff, 0x8400], // in f32=-0.000061, out f16=-0.000061035156
	[0xb8800000, 0x8400], // in f32=-0.000061, out f16=-0.000061035156
	[0xb8801fff, 0x8401], // in f32=-0.000061, out f16=-0.00006109476
	[0xb8802000, 0x8401], // in f32=-0.000061, out f16=-0.00006109476
	[0xb8803fff, 0x8402], // in f32=-0.000061, out f16=-0.000061154366
	[0xb8804000, 0x8402], // in f32=-0.000061, out f16=-0.000061154366
	[0xc77fffff, 0xfc00], // in f32=-65535.996094, out f16=-Inf
	[0xc7800000, 0xfc00], // in f32=-65536.000000, out f16=-Inf
	[0xff7fffff, 0xfc00], // in f32=-340282346638528859811704183484516925440.000000, out f16=-Inf
	[0xff800000, 0xfc00], // in f32=-Inf, out f16=-Inf

	// again, this library does not preserve signalling bits inside NaN values,
	// and always serializes NaN as 0x7e00
	// [0xff801fff, 0xfe00], // in f32=NaN, out f16=NaN
	// [0xff802000, 0xfe01], // in f32=NaN, out f16=NaN
	// [0xff803fff, 0xfe01], // in f32=NaN, out f16=NaN
	// [0xff804000, 0xfe02], // in f32=NaN, out f16=NaN
	[0xff801fff, 0x7e00], // in f32=NaN, out f16=NaN
	[0xff802000, 0x7e00], // in f32=NaN, out f16=NaN
	[0xff803fff, 0x7e00], // in f32=NaN, out f16=NaN
	[0xff804000, 0x7e00], // in f32=NaN, out f16=NaN

	[0xc77ff000, 0xfc00], // in f32=-65520.000000, out f16=-Inf
	[0xc77fef00, 0xfbff], // in f32=-65519.000000, out f16=-65504
	[0xc77fee00, 0xfbff], // in f32=-65518.000000, out f16=-65504
	[0xc5802000, 0xec01], // in f32=-4100.000000, out f16=-4100
	[0xc5801800, 0xec01], // in f32=-4099.000000, out f16=-4100
	[0xc5801000, 0xec00], // in f32=-4098.000000, out f16=-4096
	[0xc5800800, 0xec00], // in f32=-4097.000000, out f16=-4096
	[0xc5800000, 0xec00], // in f32=-4096.000000, out f16=-4096
	[0xc57ff000, 0xec00], // in f32=-4095.000000, out f16=-4096
	[0xc57fe000, 0xebff], // in f32=-4094.000000, out f16=-4094
	[0xc57fd000, 0xebfe], // in f32=-4093.000000, out f16=-4092
	[0xc5002000, 0xe801], // in f32=-2050.000000, out f16=-2050
	[0xc5001000, 0xe800], // in f32=-2049.000000, out f16=-2048
	[0xc5000829, 0xe800], // in f32=-2048.510010, out f16=-2048
	[0xc5000800, 0xe800], // in f32=-2048.500000, out f16=-2048
	[0xc50007d7, 0xe800], // in f32=-2048.489990, out f16=-2048
	[0xc5000000, 0xe800], // in f32=-2048.000000, out f16=-2048
	[0xc4fff052, 0xe800], // in f32=-2047.510010, out f16=-2048
	[0xc4fff000, 0xe800], // in f32=-2047.500000, out f16=-2048
	[0xc4ffefae, 0xe7ff], // in f32=-2047.489990, out f16=-2047
	[0xc4ffe000, 0xe7ff], // in f32=-2047.000000, out f16=-2047
	[0xc4ffc000, 0xe7fe], // in f32=-2046.000000, out f16=-2046
	[0xc4ffa000, 0xe7fd], // in f32=-2045.000000, out f16=-2045
	[0xbf800000, 0xbc00], // in f32=-1.000000, out f16=-1
	[0xbf028f5c, 0xb814], // in f32=-0.510000, out f16=-0.5097656
	[0xbf000000, 0xb800], // in f32=-0.500000, out f16=-0.5
	[0xbefae148, 0xb7d7], // in f32=-0.490000, out f16=-0.48999023
	[0x3efae148, 0x37d7], // in f32=0.490000, out f16=0.48999023
	[0x3f000000, 0x3800], // in f32=0.500000, out f16=0.5
	[0x3f028f5c, 0x3814], // in f32=0.510000, out f16=0.5097656
	[0x3f800000, 0x3c00], // in f32=1.000000, out f16=1
	[0x3fbeb852, 0x3df6], // in f32=1.490000, out f16=1.4902344
	[0x3fc00000, 0x3e00], // in f32=1.500000, out f16=1.5
	[0x3fc147ae, 0x3e0a], // in f32=1.510000, out f16=1.5097656
	[0x3fcf1bbd, 0x3e79], // in f32=1.618034, out f16=1.6181641
	[0x401f5c29, 0x40fb], // in f32=2.490000, out f16=2.4902344
	[0x40200000, 0x4100], // in f32=2.500000, out f16=2.5
	[0x4020a3d7, 0x4105], // in f32=2.510000, out f16=2.5097656
	[0x402df854, 0x4170], // in f32=2.718282, out f16=2.71875
	[0x40490fdb, 0x4248], // in f32=3.141593, out f16=3.140625
	[0x40b00000, 0x4580], // in f32=5.500000, out f16=5.5
	[0x44ffa000, 0x67fd], // in f32=2045.000000, out f16=2045
	[0x44ffc000, 0x67fe], // in f32=2046.000000, out f16=2046
	[0x44ffe000, 0x67ff], // in f32=2047.000000, out f16=2047
	[0x44ffefae, 0x67ff], // in f32=2047.489990, out f16=2047
	[0x44fff000, 0x6800], // in f32=2047.500000, out f16=2048
	[0x44fff052, 0x6800], // in f32=2047.510010, out f16=2048
	[0x45000000, 0x6800], // in f32=2048.000000, out f16=2048
	[0x450007d7, 0x6800], // in f32=2048.489990, out f16=2048
	[0x45000800, 0x6800], // in f32=2048.500000, out f16=2048
	[0x45000829, 0x6800], // in f32=2048.510010, out f16=2048
	[0x45001000, 0x6800], // in f32=2049.000000, out f16=2048
	[0x450017d7, 0x6801], // in f32=2049.489990, out f16=2050
	[0x45001800, 0x6801], // in f32=2049.500000, out f16=2050
	[0x45001829, 0x6801], // in f32=2049.510010, out f16=2050
	[0x45002000, 0x6801], // in f32=2050.000000, out f16=2050
	[0x45003000, 0x6802], // in f32=2051.000000, out f16=2052
	[0x457fd000, 0x6bfe], // in f32=4093.000000, out f16=4092
	[0x457fe000, 0x6bff], // in f32=4094.000000, out f16=4094
	[0x457ff000, 0x6c00], // in f32=4095.000000, out f16=4096
	[0x45800000, 0x6c00], // in f32=4096.000000, out f16=4096
	[0x45800800, 0x6c00], // in f32=4097.000000, out f16=4096
	[0x45801000, 0x6c00], // in f32=4098.000000, out f16=4096
	[0x45801800, 0x6c01], // in f32=4099.000000, out f16=4100
	[0x45802000, 0x6c01], // in f32=4100.000000, out f16=4100
	[0x45ad9c00, 0x6d6d], // in f32=5555.500000, out f16=5556
	[0x45ffe800, 0x6fff], // in f32=8189.000000, out f16=8188
	[0x45fff000, 0x7000], // in f32=8190.000000, out f16=8192
	[0x45fff800, 0x7000], // in f32=8191.000000, out f16=8192
	[0x46000000, 0x7000], // in f32=8192.000000, out f16=8192
	[0x46000400, 0x7000], // in f32=8193.000000, out f16=8192
	[0x46000800, 0x7000], // in f32=8194.000000, out f16=8192
	[0x46000c00, 0x7000], // in f32=8195.000000, out f16=8192
	[0x46001000, 0x7000], // in f32=8196.000000, out f16=8192
	[0x46001400, 0x7001], // in f32=8197.000000, out f16=8200
	[0x46001800, 0x7001], // in f32=8198.000000, out f16=8200
	[0x46001c00, 0x7001], // in f32=8199.000000, out f16=8200
	[0x46002000, 0x7001], // in f32=8200.000000, out f16=8200
	[0x46002400, 0x7001], // in f32=8201.000000, out f16=8200
	[0x46002800, 0x7001], // in f32=8202.000000, out f16=8200
	[0x46002c00, 0x7001], // in f32=8203.000000, out f16=8200
	[0x46003000, 0x7002], // in f32=8204.000000, out f16=8208
	[0x467fec00, 0x73ff], // in f32=16379.000000, out f16=16376
	[0x467ff000, 0x7400], // in f32=16380.000000, out f16=16384
	[0x467ff400, 0x7400], // in f32=16381.000000, out f16=16384
	[0x467ff800, 0x7400], // in f32=16382.000000, out f16=16384
	[0x467ffc00, 0x7400], // in f32=16383.000000, out f16=16384
	[0x46800000, 0x7400], // in f32=16384.000000, out f16=16384
	[0x46800200, 0x7400], // in f32=16385.000000, out f16=16384
	[0x46800400, 0x7400], // in f32=16386.000000, out f16=16384
	[0x46800600, 0x7400], // in f32=16387.000000, out f16=16384
	[0x46800800, 0x7400], // in f32=16388.000000, out f16=16384
	[0x46800a00, 0x7400], // in f32=16389.000000, out f16=16384
	[0x46800c00, 0x7400], // in f32=16390.000000, out f16=16384
	[0x46800e00, 0x7400], // in f32=16391.000000, out f16=16384
	[0x46801000, 0x7400], // in f32=16392.000000, out f16=16384
	[0x46801200, 0x7401], // in f32=16393.000000, out f16=16400
	[0x46801400, 0x7401], // in f32=16394.000000, out f16=16400
	[0x46801600, 0x7401], // in f32=16395.000000, out f16=16400
	[0x46801800, 0x7401], // in f32=16396.000000, out f16=16400
	[0x46801a00, 0x7401], // in f32=16397.000000, out f16=16400
	[0x46801c00, 0x7401], // in f32=16398.000000, out f16=16400
	[0x46801e00, 0x7401], // in f32=16399.000000, out f16=16400
	[0x46802000, 0x7401], // in f32=16400.000000, out f16=16400
	[0x46802200, 0x7401], // in f32=16401.000000, out f16=16400
	[0x46802400, 0x7401], // in f32=16402.000000, out f16=16400
	[0x46802600, 0x7401], // in f32=16403.000000, out f16=16400
	[0x46802800, 0x7401], // in f32=16404.000000, out f16=16400
	[0x46802a00, 0x7401], // in f32=16405.000000, out f16=16400
	[0x46802c00, 0x7401], // in f32=16406.000000, out f16=16400
	[0x46802e00, 0x7401], // in f32=16407.000000, out f16=16400
	[0x46803000, 0x7402], // in f32=16408.000000, out f16=16416
	[0x46ffee00, 0x77ff], // in f32=32759.000000, out f16=32752
	[0x46fff000, 0x7800], // in f32=32760.000000, out f16=32768
	[0x46fff200, 0x7800], // in f32=32761.000000, out f16=32768
	[0x46fff400, 0x7800], // in f32=32762.000000, out f16=32768
	[0x46fff600, 0x7800], // in f32=32763.000000, out f16=32768
	[0x46fff800, 0x7800], // in f32=32764.000000, out f16=32768
	[0x46fffa00, 0x7800], // in f32=32765.000000, out f16=32768
	[0x46fffc00, 0x7800], // in f32=32766.000000, out f16=32768
	[0x46fffe00, 0x7800], // in f32=32767.000000, out f16=32768
	[0x47000000, 0x7800], // in f32=32768.000000, out f16=32768
	[0x47000100, 0x7800], // in f32=32769.000000, out f16=32768
	[0x47000200, 0x7800], // in f32=32770.000000, out f16=32768
	[0x47000300, 0x7800], // in f32=32771.000000, out f16=32768
	[0x47000400, 0x7800], // in f32=32772.000000, out f16=32768
	[0x47000500, 0x7800], // in f32=32773.000000, out f16=32768
	[0x47000600, 0x7800], // in f32=32774.000000, out f16=32768
	[0x47000700, 0x7800], // in f32=32775.000000, out f16=32768
	[0x47000800, 0x7800], // in f32=32776.000000, out f16=32768
	[0x47000900, 0x7800], // in f32=32777.000000, out f16=32768
	[0x47000a00, 0x7800], // in f32=32778.000000, out f16=32768
	[0x47000b00, 0x7800], // in f32=32779.000000, out f16=32768
	[0x47000c00, 0x7800], // in f32=32780.000000, out f16=32768
	[0x47000d00, 0x7800], // in f32=32781.000000, out f16=32768
	[0x47000e00, 0x7800], // in f32=32782.000000, out f16=32768
	[0x47000f00, 0x7800], // in f32=32783.000000, out f16=32768
	[0x47001000, 0x7800], // in f32=32784.000000, out f16=32768
	[0x47001100, 0x7801], // in f32=32785.000000, out f16=32800
	[0x47001200, 0x7801], // in f32=32786.000000, out f16=32800
	[0x47001300, 0x7801], // in f32=32787.000000, out f16=32800
	[0x47001400, 0x7801], // in f32=32788.000000, out f16=32800
	[0x47001500, 0x7801], // in f32=32789.000000, out f16=32800
	[0x47001600, 0x7801], // in f32=32790.000000, out f16=32800
	[0x47001700, 0x7801], // in f32=32791.000000, out f16=32800
	[0x47001800, 0x7801], // in f32=32792.000000, out f16=32800
	[0x47001900, 0x7801], // in f32=32793.000000, out f16=32800
	[0x47001a00, 0x7801], // in f32=32794.000000, out f16=32800
	[0x47001b00, 0x7801], // in f32=32795.000000, out f16=32800
	[0x47001c00, 0x7801], // in f32=32796.000000, out f16=32800
	[0x47001d00, 0x7801], // in f32=32797.000000, out f16=32800
	[0x47001e00, 0x7801], // in f32=32798.000000, out f16=32800
	[0x47001f00, 0x7801], // in f32=32799.000000, out f16=32800
	[0x47002000, 0x7801], // in f32=32800.000000, out f16=32800
	[0x47002100, 0x7801], // in f32=32801.000000, out f16=32800
	[0x47002200, 0x7801], // in f32=32802.000000, out f16=32800
	[0x47002300, 0x7801], // in f32=32803.000000, out f16=32800
	[0x47002400, 0x7801], // in f32=32804.000000, out f16=32800
	[0x47002500, 0x7801], // in f32=32805.000000, out f16=32800
	[0x47002600, 0x7801], // in f32=32806.000000, out f16=32800
	[0x47002700, 0x7801], // in f32=32807.000000, out f16=32800
	[0x47002800, 0x7801], // in f32=32808.000000, out f16=32800
	[0x47002900, 0x7801], // in f32=32809.000000, out f16=32800
	[0x47002a00, 0x7801], // in f32=32810.000000, out f16=32800
	[0x47002b00, 0x7801], // in f32=32811.000000, out f16=32800
	[0x47002c00, 0x7801], // in f32=32812.000000, out f16=32800
	[0x47002d00, 0x7801], // in f32=32813.000000, out f16=32800
	[0x47002e00, 0x7801], // in f32=32814.000000, out f16=32800
	[0x47002f00, 0x7801], // in f32=32815.000000, out f16=32800
	[0x47003000, 0x7802], // in f32=32816.000000, out f16=32832
	[0x477fe500, 0x7bff], // in f32=65509.000000, out f16=65504
	[0x477fe100, 0x7bff], // in f32=65505.000000, out f16=65504
	[0x477fee00, 0x7bff], // in f32=65518.000000, out f16=65504
	[0x477fef00, 0x7bff], // in f32=65519.000000, out f16=65504
	[0x477feffd, 0x7bff], // in f32=65519.988281, out f16=65504
	[0x477ff000, 0x7c00], // in f32=65520.000000, out f16=+Inf
]

const float32Buffer = new ArrayBuffer(4)
const float32View = new DataView(float32Buffer)

const float16Buffer = new ArrayBuffer(2)
const float16View = new DataView(float16Buffer)

test("convert 32-bit values to 16-bit values", (t) => {
	for (const [i32, i16] of conversions) {
		float32View.setInt32(0, i32)
		const f = float32View.getFloat32(0)
		setFloat16(float16View, 0, f)
		t.is(
			float16View.getUint16(0),
			i16,
			`(${format32(i32)}) => 0x${i16.toString(16).padStart(4, "0")}`
		)
	}
})

test("check precision matches round-trip results", (t) => {
	for (const [i32, _] of conversions) {
		float32View.setInt32(0, i32)
		const f32 = float32View.getFloat32(0)
		setFloat16(float16View, 0, f32)
		const f16 = getFloat16(float16View, 0)

		const precision = getFloat16Precision(f32)

		if (precision === "exact") {
			t.is(f32, f16)
		} else if (precision === "inexact") {
			t.not(f32, f16)
		} else if (precision === "overflow") {
			t.is(f16, f32 > 0 ? Infinity : -Infinity)
		} else if (precision === "underflow") {
			// underflow might round to 0x0000 (0), 0x8000 (-0),
			// 0x0001 (smallest positive subnormal), or 0x8001 (smalleset negative subnormal)
			const i = float16View.getUint16(0)
			if (i === 0x0000 || i === 0x8000) {
				t.pass("underflow to +/- zero")
			} else if (i === 0x0001 || i === 0x8001) {
				t.pass("underflow to smallest subnormal")
			} else {
				t.fail(`${f32} -> (${format32(i32)}) -> ${f16} did not underflow`)
			}
		} else {
			t.fail(`invalid precision result: ${precision}`)
		}
	}
})
