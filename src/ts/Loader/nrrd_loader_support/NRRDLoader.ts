import { FileLoader, Loader, Matrix4, Vector3 } from "three";
import * as fflate from "fflate";
import { Volume } from "./Volume";

class NRRDLoader extends Loader {
  constructor(manager?: any) {
    super(manager);
  }

  load(url: string, onLoad: any, onProgress?: any, onError?: any) {
    const scope = this;

    // scope.manager : loadingManager
    const loader = new FileLoader(scope.manager);

    // path: ""
    loader.setPath(scope.path);
    loader.setResponseType("arraybuffer");

    // scope.requestHeader = {}
    loader.setRequestHeader(scope.requestHeader);

    // scope.withCredentials: false
    loader.setWithCredentials(scope.withCredentials);

    loader.load(
      url,
      function (data) {
        try {
          onLoad(scope.parse(data));
        } catch (e) {
          if (onError) {
            onError(e);
          } else {
            console.error(e);
          }

          scope.manager.itemError(url);
        }
      },
      onProgress,
      onError
    );
  }

  parse(data: any) {
    // this parser is largely inspired from the XTK NRRD parser : https://github.com/xtk/X

    console.log(data);

    // data: ArrayBuffer(64228010)
    let _data = data;

    let _dataPointer = 0;

    const _nativeLittleEndian =
      new Int8Array(new Int16Array([1]).buffer)[0] > 0;

    // _nativeLittleEndian: true

    const _littleEndian = true;

    const headerObject: any = {};

    // get byte data

    function scan(type: string, chunks: number) {
      if (chunks === undefined || chunks === null) {
        chunks = 1;
      }

      // chunks: 64228010
      let _chunkSize = 1;
      let _array_type: any = Uint8Array;

      // type uchar
      switch (type) {
        // 1 byte data types
        case "uchar":
          break;
        case "schar":
          _array_type = Int8Array;
          break;
        // 2 byte data types
        case "ushort":
          _array_type = Uint16Array;
          _chunkSize = 2;
          break;
        case "sshort":
          _array_type = Int16Array;
          _chunkSize = 2;
          break;
        // 4 byte data types
        case "uint":
          _array_type = Uint32Array;
          _chunkSize = 4;
          break;
        case "sint":
          _array_type = Int32Array;
          _chunkSize = 4;
          break;
        case "float":
          _array_type = Float32Array;
          _chunkSize = 4;
          break;
        case "complex":
          _array_type = Float64Array;
          _chunkSize = 8;
          break;
        case "double":
          _array_type = Float64Array;
          _chunkSize = 8;
          break;
      }

      // increase the data pointer in-place
      let _bytes = new _array_type(
        _data.slice(_dataPointer, (_dataPointer += chunks * _chunkSize))
      );

      // if required, flip the endianness of the bytes
      if (_nativeLittleEndian != _littleEndian) {
        // we need to flip here since the format doesn't match the native endianness
        _bytes = flipEndianness(_bytes, _chunkSize);
      }

      if (chunks == 1) {
        // if only one chunk was requested, just return one value
        return _bytes[0];
      }

      // return the byte array
      return _bytes;
    }

    //Flips typed array endianness in-place. Based on https://github.com/kig/DataStream.js/blob/master/DataStream.js.

    function flipEndianness(array: any, chunkSize: number) {
      const u8 = new Uint8Array(
        array.buffer,
        array.byteOffset,
        array.byteLength
      );
      for (let i = 0; i < array.byteLength; i += chunkSize) {
        for (let j = i + chunkSize - 1, k = i; j > k; j--, k++) {
          const tmp = u8[k];
          u8[k] = u8[j];
          u8[j] = tmp;
        }
      }

      return array;
    }

    //parse the header
    function parseHeader(header: any) {
      let data, field, fn, i, l, m, _i, _len;
      const lines = header.split(/\r?\n/);

      // lines: ['NRRD0004', '# Complete NRRD file format specification at:', '# http://teem.sourceforge.net/nrrd/format.html', 'type: short', 'dimension: 3', 'space: left-posterior-superior', 'sizes: 448 448 160', 'space directions: (0.80303171944265095,-1.64815267…7262,-5.3597170662455722e-017,1.0992581595808804)', 'kinds: domain domain domain', 'endian: little', 'encoding: raw', 'space origin: (-185.39132690429688,-176.12590026855469,-88.175994873046875)', '0008|0005:=ISO_IR 100', '0008|0008:=ORIGINAL\\\\PRIMARY\\\\M\\\\DIS2D', '0008|0012:=19900101', '0008|0013:=081937.062000 ', '0008|0016:=1.2.840.10008.5.1.4.1.1.4',]

      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        l = lines[_i];
        if (l.match(/NRRD\d+/)) {
          headerObject.isNrrd = true;
        } else if (!l.match(/^#/) && (m = l.match(/(.*):(.*)/))) {
          field = m[1].trim();
          data = m[2].trim();
          fn = _fieldFunctions[field];
          if (fn) {
            fn.call(headerObject, data);
          } else {
            headerObject[field] = data;
          }
        }
      }

      if (!headerObject.isNrrd) {
        throw new Error("Not an NRRD file");
      }

      if (
        headerObject.encoding === "bz2" ||
        headerObject.encoding === "bzip2"
      ) {
        throw new Error("Bzip is not supported");
      }

      if (!headerObject.vectors) {
        //if no space direction is set, let's use the identity
        headerObject.vectors = [];
        headerObject.vectors.push([1, 0, 0]);
        headerObject.vectors.push([0, 1, 0]);
        headerObject.vectors.push([0, 0, 1]);

        //apply spacing if defined
        if (headerObject.spacings) {
          for (i = 0; i <= 2; i++) {
            if (!isNaN(headerObject.spacings[i])) {
              for (let j = 0; j <= 2; j++) {
                headerObject.vectors[i][j] *= headerObject.spacings[i];
              }
            }
          }
        }
      }
    }

    //parse the data when registred as one of this type : 'text', 'ascii', 'txt'
    function parseDataAsText(data: any, start?: number, end?: number) {
      let number = "";
      start = start || 0;
      end = end || (data.length as number);
      let value;
      //length of the result is the product of the sizes
      const lengthOfTheResult = headerObject.sizes.reduce(function (
        previous: number,
        current: number
      ) {
        return previous * current;
      },
      1);

      let base = 10;
      if (headerObject.encoding === "hex") {
        base = 16;
      }

      const result = new headerObject.__array(lengthOfTheResult);
      let resultIndex = 0;
      let parsingFunction = parseInt;
      if (
        headerObject.__array === Float32Array ||
        headerObject.__array === Float64Array
      ) {
        parsingFunction = parseFloat;
      }

      for (let i = start; i < end; i++) {
        value = data[i];
        //if value is not a space
        if ((value < 9 || value > 13) && value !== 32) {
          number += String.fromCharCode(value);
        } else {
          if (number !== "") {
            result[resultIndex] = parsingFunction(number, base);
            resultIndex++;
          }

          number = "";
        }
      }

      if (number !== "") {
        result[resultIndex] = parsingFunction(number, base);
        resultIndex++;
      }

      return result;
    }

    const _bytes = scan("uchar", data.byteLength);
    const _length = _bytes.length;
    let _header = null;
    let _data_start = 0;
    let i;
    for (i = 1; i < _length; i++) {
      if (_bytes[i - 1] == 10 && _bytes[i] == 10) {
        // we found two line breaks in a row
        // now we know what the header is
        _header = this.parseChars(_bytes, 0, i - 2);
        // this is were the data starts
        _data_start = i + 1;
        break;
      }
    }

    // parse the header
    parseHeader(_header);

    console.log(headerObject);

    _data = _bytes.subarray(_data_start); // the data without header
    if (headerObject.encoding.substring(0, 2) === "gz") {
      // we need to decompress the datastream
      // here we start the unzipping and get a typed Uint8Array back
      _data = fflate.gunzipSync(new Uint8Array(_data));
    } else if (
      headerObject.encoding === "ascii" ||
      headerObject.encoding === "text" ||
      headerObject.encoding === "txt" ||
      headerObject.encoding === "hex"
    ) {
      _data = parseDataAsText(_data);
    } else if (headerObject.encoding === "raw") {
      //we need to copy the array to create a new array buffer, else we retrieve the original arraybuffer with the header
      const _copy = new Uint8Array(_data.length);

      for (let i = 0; i < _data.length; i++) {
        _copy[i] = _data[i];
      }

      _data = _copy;
    }

    // .. let's use the underlying array buffer
    _data = _data.buffer;

    const volume: any = new Volume();
    volume.header = headerObject;
    //
    // parse the (unzipped) data to a datastream of the correct type
    //
    volume.data = new headerObject.__array(_data);
    // get the min and max intensities
    const min_max = volume.computeMinMax();
    const min = min_max[0];
    const max = min_max[1];
    // attach the scalar range to the volume
    volume.windowLow = min;
    volume.windowHigh = max;

    // get the image dimensions
    volume.dimensions = [
      headerObject.sizes[0],
      headerObject.sizes[1],
      headerObject.sizes[2],
    ];
    volume.xLength = volume.dimensions[0];
    volume.yLength = volume.dimensions[1];
    volume.zLength = volume.dimensions[2];

    // Identify axis order in the space-directions matrix from the header if possible.
    if (headerObject.vectors) {
      const xIndex = headerObject.vectors.findIndex(
        (vector: number[]) => vector[0] !== 0
      );
      const yIndex = headerObject.vectors.findIndex(
        (vector: number[]) => vector[1] !== 0
      );
      const zIndex = headerObject.vectors.findIndex(
        (vector: number[]) => vector[2] !== 0
      );

      const axisOrder = [];
      axisOrder[xIndex] = "x";
      axisOrder[yIndex] = "y";
      axisOrder[zIndex] = "z";
      volume.axisOrder = axisOrder;
    } else {
      volume.axisOrder = ["x", "y", "z"];
    }

    // spacing
    const spacingX = new Vector3().fromArray(headerObject.vectors[0]).length();
    const spacingY = new Vector3().fromArray(headerObject.vectors[1]).length();
    const spacingZ = new Vector3().fromArray(headerObject.vectors[2]).length();
    volume.spacing = [spacingX, spacingY, spacingZ];

    // Create IJKtoRAS matrix
    volume.matrix = new Matrix4();

    const transitionMatrix = new Matrix4();

    if (headerObject.space === "left-posterior-superior") {
      transitionMatrix.set(-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    } else if (headerObject.space === "left-anterior-superior") {
      transitionMatrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);
    }

    if (!headerObject.vectors) {
      volume.matrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    } else {
      // console.log("here");
      volume.matrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

      // const v = headerObject.vectors;

      // const ijk_to_transition = new Matrix4().set(
      // 	v[ 0 ][ 0 ], v[ 1 ][ 0 ], v[ 2 ][ 0 ], 0,
      // 	v[ 0 ][ 1 ], v[ 1 ][ 1 ], v[ 2 ][ 1 ], 0,
      // 	v[ 0 ][ 2 ], v[ 1 ][ 2 ], v[ 2 ][ 2 ], 0,
      // 	0, 0, 0, 1
      // );

      // const transition_to_ras = new Matrix4().multiplyMatrices( ijk_to_transition, transitionMatrix );

      // volume.matrix = transition_to_ras;
    }

    volume.inverseMatrix = new Matrix4();
    volume.inverseMatrix.copy(volume.matrix).invert();
    volume.RASDimensions = new Vector3(
      volume.xLength,
      volume.yLength,
      volume.zLength
    )
      .applyMatrix4(volume.matrix)
      .round()
      .toArray()
      .map(Math.abs);

    // .. and set the default threshold
    // only if the threshold was not already set
    if (volume.lowerThreshold === -Infinity) {
      volume.lowerThreshold = min;
    }

    if (volume.upperThreshold === Infinity) {
      volume.upperThreshold = max;
    }

    return volume;
  }

  parseChars(array: any, start: number, end: number) {
    // without borders, use the whole array
    if (start === undefined) {
      start = 0;
    }

    if (end === undefined) {
      end = array.length;
    }

    let output = "";
    // create and append the chars
    let i = 0;
    for (i = start; i < end; ++i) {
      output += String.fromCharCode(array[i]);
    }

    // # Complete NRRD file format specification at:
    // # http://teem.sourceforge.net/nrrd/format.html
    // type: short
    // dimension: 3
    // space: left-posterior-superior
    // sizes: 448 448 160
    // space directions: (0.80303171944265095,-1.6481526752133598e-010,0.02944583724545901) (1.6470457512132511e-010,0.80357140302658003,6.039481950867172e-012) (-0.040307968009317262,-5.3597170662455722e-017,1.0992581595808804)
    // kinds: domain domain domain
    // endian: little
    // encoding: raw
    // space origin: (-185.39132690429688,-176.12590026855469,-88.175994873046875)
    // 0008|0005:=ISO_IR 100
    // 0008|0008:=ORIGINAL\\PRIMARY\\M\\DIS2D
    // 0008|0012:=19900101
    // 0008|0013:=081937.062000
    // 0008|0016:=1.2.840.10008.5.1.4.1.1.4
    // 0008|0018:=1.3.6.1.4.1.14519.5.2.1.186549628990395930380750052377416633771
    // 0008|0020:=19900101
    // 0008|0021:=19900101
    // 0008|0022:=19900101
    // 0008|0023:=19900101
    // 0008|0030:=080801.515000
    // 0008|0031:=081937.046000
    // 0008|0032:=081732.400000
    // 0008|0033:=081937.062000
    // 0008|0050:=
    // 0008|0060:=MR
    // 0008|0070:=SIEMENS
    // 0008|0090:=
    // 0008|1030:=MRI BREAST BILATERAL W/WO
    // 0008|103e:=ax dyn pre
    // 0008|1090:=Avanto
    // 0010|0010:=Breast_MRI_001
    // 0010|0020:=Breast_MRI_001
    // 0010|0030:=
    // 0010|0040:=F
    // 0010|1010:=041Y
    // 0010|1020:=1.6002032025
    // 0010|1030:=90.2648931123
    // 0010|21c0:=4
    // 0010|4000:=
    // 0012|0062:=YES
    // 0012|0063:=DICOMANON (rev R2010a) - PS 3.15-2008 Table E.1-1 - nondefault
    // 0018|0015:=BREAST
    // 0018|0020:=GR
    // 0018|0021:=SP\\OSP
    // 0018|0022:=PFP\\FS
    // 0018|0023:=3D
    // 0018|0025:=Y
    // 0018|0050:=1.1000000238419
    // 0018|0080:=4.12
    // 0018|0081:=1.36
    // 0018|0083:=1
    // 0018|0084:=63.67661
    // 0018|0085:=1H
    // 0018|0086:=1
    // 0018|0087:=1.5
    // 0018|0089:=409
    // 0018|0091:=1
    // 0018|0093:=100
    // 0018|0094:=100
    // 0018|0095:=320
    // 0018|1000:=
    // 0018|1020:=syngo MR B13 4VB13A
    // 0018|1030:=
    // 0018|1200:=19900101
    // 0018|1251:=Body
    // 0018|1310:=0\\448\\448\\0
    // 0018|1312:=ROW
    // 0018|1314:=12
    // 0018|1315:=N
    // 0018|1316:=0.3067459848455
    // 0018|1318:=0
    // 0018|5100:=FFP
    // 0020|000d:=1.3.6.1.4.1.14519.5.2.1.186051521067863971269584893740842397538
    // 0020|000e:=1.3.6.1.4.1.14519.5.2.1.185777849803665244536713316058283493877
    // 0020|0010:=
    // 0020|0011:=3
    // 0020|0012:=1
    // 0020|0013:=160
    // 0020|0032:=-185.39132000516\\-176.12590213898\\-88.175997558016
    // 0020|0037:=0.9993283937409\\-2.051034E-10\\0.036643709737\\2.049657E-10\\1\\7.5158E-12
    // 0020|0052:=1.3.6.1.4.1.14519.5.2.1.45736569925431297170708374639092465328
    // 0020|1040:=
    // 0020|1041:=-81.323352288116
    // 0028|0002:=1
    // 0028|0004:=MONOCHROME2
    // 0028|0010:=448
    // 0028|0011:=448
    // 0028|0030:=0.80357140302658\\0.80357140302658
    // 0028|0100:=16
    // 0028|0101:=12
    // 0028|0102:=11
    // 0028|0103:=0
    // 0028|0106:=0
    // 0028|0107:=141
    // 0028|1050:=56
    // 0028|1051:=154
    // 0032|1060:=MRI BREAST BILATERAL W + W/O
    // 0040|0254:=MRI BREAST BILATERAL W + W/O
    // 0040|2017:=
    // 0088|0140:=1.3.6.1.4.1.14519.5.2.1.28194976848941264896235382226679917836
    return output;
  }
}

const _fieldFunctions: any = {
  type: function (data: any) {
    switch (data) {
      case "uchar":
      case "unsigned char":
      case "uint8":
      case "uint8_t":
        this.__array = Uint8Array;
        break;
      case "signed char":
      case "int8":
      case "int8_t":
        this.__array = Int8Array;
        break;
      case "short":
      case "short int":
      case "signed short":
      case "signed short int":
      case "int16":
      case "int16_t":
        this.__array = Int16Array;
        break;
      case "ushort":
      case "unsigned short":
      case "unsigned short int":
      case "uint16":
      case "uint16_t":
        this.__array = Uint16Array;
        break;
      case "int":
      case "signed int":
      case "int32":
      case "int32_t":
        this.__array = Int32Array;
        break;
      case "uint":
      case "unsigned int":
      case "uint32":
      case "uint32_t":
        this.__array = Uint32Array;
        break;
      case "float":
        this.__array = Float32Array;
        break;
      case "double":
        this.__array = Float64Array;
        break;
      default:
        throw new Error("Unsupported NRRD data type: " + data);
    }

    return (this.type = data);
  },

  endian: function (data: any) {
    return (this.endian = data);
  },

  encoding: function (data: any) {
    return (this.encoding = data);
  },

  dimension: function (data: any) {
    return (this.dim = parseInt(data, 10));
  },

  sizes: function (data: any) {
    let i;
    return (this.sizes = (function () {
      const _ref = data.split(/\s+/);
      const _results = [];

      for (let _i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        _results.push(parseInt(i, 10));
      }

      return _results;
    })());
  },

  space: function (data: any) {
    return (this.space = data);
  },

  "space origin": function (data: any) {
    return (this.space_origin = data.split("(")[1].split(")")[0].split(","));
  },

  "space directions": function (data: any) {
    let f, v;
    const parts = data.match(/\(.*?\)/g);
    return (this.vectors = (function () {
      const _results = [];

      for (let _i = 0, _len = parts.length; _i < _len; _i++) {
        v = parts[_i];
        _results.push(
          (function () {
            const _ref = v.slice(1, -1).split(/,/);
            const _results2 = [];

            for (let _j = 0, _len2 = _ref.length; _j < _len2; _j++) {
              f = _ref[_j];
              _results2.push(parseFloat(f));
            }

            return _results2;
          })()
        );
      }

      return _results;
    })());
  },

  spacings: function (data: any) {
    let f;
    const parts = data.split(/\s+/);
    return (this.spacings = (function () {
      const _results = [];

      for (let _i = 0, _len = parts.length; _i < _len; _i++) {
        f = parts[_i];
        _results.push(parseFloat(f));
      }

      return _results;
    })());
  },
};

export { NRRDLoader };
