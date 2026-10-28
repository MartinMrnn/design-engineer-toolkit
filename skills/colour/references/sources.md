# Sources

Every source this skill and `colour.py` rest on, with its link and its licence or status.

**What was copied: nothing.** No third-party reference text from meodai/skill.color-expert's `references/` folder or from any paper was copied into this skill. The texts here are written in our own words, and they cite and link their sources. The script uses only published constants (matrices, white points, thresholds) with their citation, and its tests use reference values from the sources below.

## Standards
- **WCAG 2.2**, W3C Recommendation: SC 1.4.1 Use of Color, 1.4.3 Contrast (Minimum), 1.4.6 Contrast (Enhanced), 1.4.11 Non-text Contrast; the definitions of relative luminance, contrast ratio and large-scale text. https://www.w3.org/TR/WCAG22/ · W3C Document License.
- **Understanding WCAG 2.2, SC 1.4.3 Contrast (Minimum)**, W3C, informative: thresholds are compared unrounded; what large-scale text means in CSS pixels. https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html · W3C Document License.
- **CSS Color Module Level 4**, W3C: `oklab()`, `oklch()`, `lab()` and `lch()` on D50, the Bradford adaptation, deltaEOK, gamut mapping. https://www.w3.org/TR/css-color-4/ · W3C Document License.
- **CSS Color 4 sample code**, `css-color-4/conversions.js` (with `utilities.js`, `multiply-matrices.js`, `deltaEOK.js`) and the specification's gamut-mapping pseudocode, in https://github.com/w3c/csswg-drafts at commit `700ba7b5e6ea39623b68a2a0575c2bb89c640d54`. Its published constants are used in `colour.py`, with their citation. It was run locally, outside the plugin, to produce the conversion and gamut-mapping tests' reference values; its code was not copied. W3C Software and Document License.

## Colour science
- **B. Ottosson, "A perceptual color space for image processing"** (OKLab), 2020. https://bottosson.github.io/posts/oklab/ · The post's code is public domain, or MIT. Its published matrices and its table of example XYZ and OKLab pairs are used for the conversion and its tests.
- **G. M. Machado, M. M. Oliveira & L. A. F. Fernandes, "A physiologically-based model for simulation of color vision deficiency"**, *IEEE Transactions on Visualization and Computer Graphics* 15(6), 2009, 1291–1298. DOI 10.1109/TVCG.2009.113. The severity 1.0 matrices are taken from the authors' page, https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html, with their citation.

## APCA (nothing used)
- **Myndex, apca-w3** and its `LICENSE.md`: https://github.com/Myndex/apca-w3. Read only to decide whether a port could ship in this MIT plugin. Its rights are reserved, its grant covers web content only, commercial use needs a signed licence, ports must stay unchanged, and APCA is a trademark: so nothing from it is used. The official calculator is linked for a manual check: https://apcacontrast.com.

## Studies on colour and emotion
Summarised in `meaning.md` in our own words; no text copied.
- **L. Wilms & D. Oberfeld, "Color and emotion: effects of hue, saturation, and brightness"**, *Psychological Research* 82(5), 2018, 896–914. DOI 10.1007/s00426-017-0880-8.
- **D. Jonauskaite et al., "Universal patterns in color-emotion associations are further shaped by linguistic and geographic proximity"**, *Psychological Science* 31(10), 2020, 1245–1260. DOI 10.1177/0956797620948810.
- **S. E. Palmer & K. B. Schloss, "An ecological valence theory of human color preference"**, *PNAS* 107(19), 2010, 8877–8882. DOI 10.1073/pnas.0906172107.
- **L.-C. Ou, M. R. Luo, A. Woodcock & A. Wright, "A study of colour emotion and colour preference"**, *Color Research & Application* 29, 2004:
  - Part I, Colour emotions for single colours, 29(3), 232–240. DOI 10.1002/col.20010.
  - Part II, Colour emotions for two-colour combinations, 29(4), 292–298. DOI 10.1002/col.20024.
  - Part III, Colour preference modeling, 29(5), 381–389. DOI 10.1002/col.20047.
  - Status: findings used in words only. The equations and coefficients are not included in this version; they would be added only after a verification on the printed pages of the author-deposited full texts, with each equation's page and number recorded here.

## Design practice
- **J. Albers, *Interaction of Color***, Yale University Press, 1963. Cited for its demonstrations that a colour changes with its neighbours; no text or plate reproduced.

## Approach
- **meodai, skill.color-expert**: https://github.com/meodai/skill.color-expert. Its original texts (`SKILL.md`, `references/INDEX.md`) are licensed CC BY 4.0; its `references/` files are largely transcripts and extracts of third-party works, which keep their authors' rights. It informed this skill's approach: reasoning in OKLCH rather than HSL, verifying contrast on every text and background pair, and stating where tidy colour rules break. No passage of it was adapted or copied here, so no CC BY 4.0 material is redistributed; it is credited as a reference.
