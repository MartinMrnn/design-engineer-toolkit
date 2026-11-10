"""A small PNG reader: zlib and struct only.

Source: Portable Network Graphics (PNG) Specification, Third Edition (W3C): section 5 (datastream structure: signature,
chunks, CRC-32), section 7.1 and 11.2 (IHDR, PLTE, tRNS), section 9 (the five filter types and their reconstruction
functions).

What it reads: 8-bit, non-interlaced images of colour type 0 (greyscale), 2 (RGB), 3 (indexed, PLTE, with tRNS for the
alpha of the palette's entries), 4 (greyscale and alpha) and 6 (RGBA). A tRNS chunk on a greyscale or RGB image is a
colour key: the pixels of that exact colour are transparent.

What it refuses, with a message that says why (PngError, a ValueError): anything that is not a PNG, a bad CRC, a
truncated file, a bit depth other than 8, an interlaced image, an unknown colour type, a missing or short palette, a
pixel index outside the palette, an image too large to hold in memory.

Colours are taken as sRGB. The ancillary chunks that describe a colour space (iCCP, sRGB, gAMA, cHRM, cICP) are
ignored: an image in another profile (Display P3, say) is read as if its values were sRGB. Say so wherever it is used.
"""
import struct
import zlib

SIGNATURE = b"\x89PNG\r\n\x1a\n"

# Samples per pixel, by colour type (PNG spec, table 7.1).
CHANNELS = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}

# Not from the PNG spec: a guard against a file that declares an enormous image (a decompression bomb). 100 megapixels
# is far above any screen capture (an 8K frame is 33 megapixels) and still fits in memory as RGBA bytes (400 MB).
MAX_PIXELS = 100_000_000


class PngError(ValueError):
    pass


def _chunks(data):
    """(type, body) of each chunk, CRC-checked, up to IEND."""
    pos = len(SIGNATURE)
    while True:
        if pos + 8 > len(data):
            raise PngError("the file ends before the IEND chunk (truncated PNG)")
        length, kind = struct.unpack(">I4s", data[pos:pos + 8])
        end = pos + 8 + length
        if end + 4 > len(data):
            raise PngError("the file ends inside a {} chunk (truncated PNG)".format(kind.decode("latin-1")))
        body = data[pos + 8:end]
        (crc,) = struct.unpack(">I", data[end:end + 4])
        if zlib.crc32(kind + body) & 0xFFFFFFFF != crc:
            raise PngError("bad checksum (CRC) in the {} chunk: the file is damaged".format(kind.decode("latin-1")))
        yield kind, body
        if kind == b"IEND":
            return
        pos = end + 4


def _unfilter(raw, width, height, bpp):
    """Reverses the five filters (PNG spec, section 9.2) row by row. `raw` holds, per row, a filter-type byte and
    the filtered bytes. Returns the unfiltered rows as one bytes object."""
    stride = width * bpp
    expected = height * (stride + 1)
    if len(raw) < expected:
        raise PngError("the image data is incomplete: {} bytes where {} are needed (truncated PNG)".format(len(raw), expected))
    if len(raw) > expected:
        raise PngError("the image data is longer than the image needs: the file is damaged")
    out = bytearray(height * stride)
    previous = bytearray(stride)
    for y in range(height):
        start = y * (stride + 1)
        kind = raw[start]
        line = bytearray(raw[start + 1:start + 1 + stride])
        if kind == 0:  # None
            pass
        elif kind == 1:  # Sub: add the byte bpp to the left
            for x in range(bpp, stride):
                line[x] = (line[x] + line[x - bpp]) & 255
        elif kind == 2:  # Up: add the byte above
            for x in range(stride):
                line[x] = (line[x] + previous[x]) & 255
        elif kind == 3:  # Average: add the floor of the mean of left and above
            for x in range(min(bpp, stride)):
                line[x] = (line[x] + (previous[x] >> 1)) & 255
            for x in range(bpp, stride):
                line[x] = (line[x] + ((line[x - bpp] + previous[x]) >> 1)) & 255
        elif kind == 4:  # Paeth: add the neighbour (left, above, upper left) nearest to left + above - upper left
            for x in range(min(bpp, stride)):
                line[x] = (line[x] + previous[x]) & 255  # left and upper left are 0: Paeth picks "above"
            for x in range(bpp, stride):
                a, b, c = line[x - bpp], previous[x], previous[x - bpp]
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                predictor = a if pa <= pb and pa <= pc else (b if pb <= pc else c)
                line[x] = (line[x] + predictor) & 255
        else:
            raise PngError("row {} has an unknown filter type {}: the file is damaged".format(y, kind))
        out[y * stride:(y + 1) * stride] = line
        previous = line
    return bytes(out)


def decode(data):
    """(width, height, rgba) of PNG file contents: rgba is width * height * 4 bytes, row by row."""
    if not isinstance(data, (bytes, bytearray)) or not bytes(data[:len(SIGNATURE)]) == SIGNATURE:
        raise PngError("not a PNG file (its first bytes are not the PNG signature); "
                       "on macOS, `sips -s format png in.jpg --out out.png` converts an image to PNG")
    data = bytes(data)
    header = palette = transparency = None
    idat = []
    for kind, body in _chunks(data):
        if kind == b"IHDR":
            if len(body) != 13:
                raise PngError("the IHDR chunk is damaged")
            header = struct.unpack(">IIBBBBB", body)
        elif header is None:
            raise PngError("the first chunk is not IHDR: the file is damaged")
        elif kind == b"PLTE":
            palette = body
        elif kind == b"tRNS":
            transparency = body
        elif kind == b"IDAT":
            idat.append(body)
        # Everything else is ancillary and ignored; colour-space chunks (iCCP, sRGB, gAMA, cHRM) included.
    if header is None:
        raise PngError("the file has no IHDR chunk")
    width, height, depth, colour_type, compression, filter_method, interlace = header
    if width == 0 or height == 0:
        raise PngError("the image has a zero width or height")
    if colour_type not in CHANNELS:
        raise PngError("unsupported PNG colour type {} (supported: 0 greyscale, 2 RGB, 3 indexed, 4 greyscale+alpha, 6 RGBA)"
                       .format(colour_type))
    if depth != 8:
        raise PngError("{}-bit PNG not supported: only 8-bit images are read".format(depth))
    if interlace != 0:
        raise PngError("interlaced (Adam7) PNG not supported: only non-interlaced images are read")
    if compression != 0 or filter_method != 0:
        raise PngError("unknown PNG compression or filter method: the file is damaged")
    if width * height > MAX_PIXELS:
        raise PngError("the image is too large ({} x {} pixels; the limit is {} megapixels)".format(
            width, height, MAX_PIXELS // 1_000_000))
    if not idat:
        raise PngError("the file has no image data (IDAT chunk)")
    bpp = CHANNELS[colour_type]
    needed = height * (width * bpp + 1)
    try:
        inflater = zlib.decompressobj()
        raw = inflater.decompress(b"".join(idat), needed + 1)
        if not inflater.eof and len(raw) < needed:
            raise PngError("the image data is incomplete (truncated PNG)")
    except zlib.error as e:
        raise PngError("the image data cannot be decompressed: {}".format(e)) from None
    pixels = _unfilter(raw, width, height, bpp)
    return width, height, _to_rgba(pixels, width * height, colour_type, palette, transparency)


def _to_rgba(pixels, count, colour_type, palette, transparency):
    out = bytearray(count * 4)
    if colour_type == 6:
        return pixels
    if colour_type == 2:
        out[0::4], out[1::4], out[2::4] = pixels[0::3], pixels[1::3], pixels[2::3]
        out[3::4] = b"\xff" * count
        if transparency is not None:
            if len(transparency) != 6:
                raise PngError("the tRNS chunk of an RGB image must hold 6 bytes")
            # 16-bit samples; for an 8-bit image the colour key is the low byte of each.
            key = bytes([transparency[1], transparency[3], transparency[5]])
            for i in range(count):
                if pixels[3 * i:3 * i + 3] == key:
                    out[4 * i + 3] = 0
        return bytes(out)
    if colour_type == 0:
        out[0::4] = out[1::4] = out[2::4] = pixels
        out[3::4] = b"\xff" * count
        if transparency is not None:
            if len(transparency) != 2:
                raise PngError("the tRNS chunk of a greyscale image must hold 2 bytes")
            key = transparency[1]
            for i in range(count):
                if pixels[i] == key:
                    out[4 * i + 3] = 0
        return bytes(out)
    if colour_type == 4:
        out[0::4] = out[1::4] = out[2::4] = pixels[0::2]
        out[3::4] = pixels[1::2]
        return bytes(out)
    # Indexed.
    if palette is None or len(palette) % 3 or not palette:
        raise PngError("the indexed PNG has no valid palette (PLTE chunk)")
    entries = len(palette) // 3
    alpha = list(transparency or b"") + [255] * (entries - len(transparency or b""))
    table = [(palette[3 * i], palette[3 * i + 1], palette[3 * i + 2], alpha[i]) for i in range(entries)]
    if max(pixels) >= entries:
        raise PngError("a pixel points outside the palette ({} entries): the file is damaged".format(entries))
    for i, index in enumerate(pixels):
        out[4 * i:4 * i + 4] = bytes(table[index])
    return bytes(out)


def read(path):
    """(width, height, rgba) of a PNG file. Raises PngError, or OSError when the file cannot be read."""
    with open(path, "rb") as f:
        return decode(f.read())
