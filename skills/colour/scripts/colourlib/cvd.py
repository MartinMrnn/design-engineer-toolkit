"""Colour-vision-deficiency (CVD) simulation: Machado, Oliveira & Fernandes 2009, severity 1.0.

Source: G. M. Machado, M. M. Oliveira, L. A. F. Fernandes, "A Physiologically-based Model for Simulation of Color
Vision Deficiency", IEEE Transactions on Visualization and Computer Graphics 15(6), 2009, pp. 1291-1298. The matrices
are the authors' own, from Table 1 ("Simulation matrices") of their page
https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html (read on 2026-10-28), the row of
severity 1.0 (dichromacy). The page lists each matrix row by row (severity 0.0 is the identity).

Linear or gamma-encoded RGB? What the authors say, as found:
- The page says only that "the RGB vector" is multiplied by the matrix to give the simulated colour (its Eq. 1). It
  does not say whether the RGB is linear or gamma-encoded.
- The paper (same page, Machado_Oliveira_Fernandes_CVD_Vis2009_final.pdf), Sect. 4.1 around Eq. 8, builds the
  RGB-to-opponent-colour step by projecting the spectral power distributions of the RGB primaries onto the opponent
  basis functions. Spectral power adds linearly, so the matrix works on amounts of primary light: linear-light RGB.
So there is no sentence from the authors that says "linear"; the choice follows from how the matrices are derived.
This module therefore decodes sRGB to linear light, multiplies, clamps into [0, 1] and encodes back. This is a
reading of the paper, not a quotation, and is stated in the command's output.

The simulation is a model of how the colours may look to someone with that dichromacy, for a typical display, not a
measurement of any person's vision.
"""
from . import convert, gamut

MODEL = "Machado, Oliveira & Fernandes 2009"
SEVERITY = 1.0

# Table 1, severity 1.0, row by row (R', G', B' = matrix x (R, G, B)).
MATRICES = {
    "protanopia": [
        [0.152286, 1.052583, -0.204868],
        [0.114503, 0.786281, 0.099216],
        [-0.003882, -0.048116, 1.051998],
    ],
    "deuteranopia": [
        [0.367322, 0.860646, -0.227968],
        [0.280085, 0.672501, 0.047413],
        [-0.011820, 0.042940, 0.968881],
    ],
    "tritanopia": [
        [1.255528, -0.076749, -0.178779],
        [-0.078411, 0.930809, 0.147602],
        [0.004733, 0.691367, 0.303900],
    ],
}
CONDITIONS = tuple(MATRICES)


def simulate(srgb, condition):
    """The simulated colour as gamma-encoded sRGB [r, g, b] (0 to 1), and whether clamping changed it.
    srgb is gamma-encoded sRGB, each from 0 to 1."""
    linear = convert.srgb_to_linear(srgb)
    raw = [sum(m * v for m, v in zip(row, linear)) for row in MATRICES[condition]]
    clamped = [min(1.0, max(0.0, v)) for v in raw]
    return convert.linear_to_srgb(clamped), clamped != raw


def oklab(srgb):
    return convert.xyz_to_oklab(convert.srgb_to_xyz(srgb))


def distance(srgb_a, srgb_b):
    """Euclidean distance in OKLab (deltaEOK, CSS Color 4) between two sRGB colours, unrounded."""
    return gamut.delta_eok(oklab(srgb_a), oklab(srgb_b))


CAUTION = ("Distances help spot colours that may be hard to tell apart; there is no universal threshold, "
           "and states must not rely on colour alone (WCAG 2.2, SC 1.4.1).")
METHOD = ("{} at severity 1.0 (dichromacy); the matrices work on linear-light sRGB (derived from the primaries' spectral "
          "power, see cvd.py), and each result is clamped into [0, 1]").format(MODEL)
DISTANCE_NOTE = "OKLab Euclidean distance (deltaEOK, CSS Color 4), unrounded"


def describe(srgb):
    """A colour (gamma-encoded sRGB, each 0 to 1) and its simulation under each condition: hex, srgb, simulated."""
    simulated = {}
    for name in CONDITIONS:
        out, clamped = simulate(srgb, name)
        simulated[name] = {"hex": convert.to_hex(out), "srgb": out, "clamped": clamped}
    return {"hex": convert.to_hex(srgb), "srgb": srgb, "simulated": simulated}


def pair(one, two):
    """The OKLab distance of two described colours in normal vision and under each condition, and the smallest."""
    rgb = {"normal": (one["srgb"], two["srgb"])}
    rgb.update({n: (one["simulated"][n]["srgb"], two["simulated"][n]["srgb"]) for n in CONDITIONS})
    dist = {k: distance(*v) for k, v in rgb.items()}
    closest = min(dist, key=dist.get)  # the first of equals, in the order normal, protanopia, ...
    return {"a": one["hex"], "b": two["hex"], "distance": dist, "closest": {"condition": closest, "distance": dist[closest]}}
