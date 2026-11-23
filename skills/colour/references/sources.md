# Sources

Every source this skill and `colour.py` rest on, with its link and its licence or status.

**What was copied: nothing.** Every text here is written in our own words. The script uses only published constants (matrices, white points, thresholds), with their citation. Where a licence forbids adaptation or none could be found, only the principle is cited.

**How licences were checked, on 2026-11-23.** Software licences were read from each repository. Publishers' pages refused automated reading, so the licences of papers come from their Crossref record (`api.crossref.org/works/<DOI>`), and from the article itself where stated. A text-and-data-mining link in a record is not an open licence, so those papers are treated as all rights reserved.

## Standards
- **W3C** · WCAG 2.2, W3C Recommendation of 12 December 2024, SC 1.4.1, 1.4.3, 1.4.6, 1.4.11, and Understanding SC 1.4.3 · https://www.w3.org/TR/WCAG22/ · Licence: W3C Document License (2023). Criteria are cited by number and stated in our own words.
- **CSS Color 4** · CSS Color Module Level 4 and its sample code, at csswg-drafts commit `700ba7b5e6ea39623b68a2a0575c2bb89c640d54` · https://www.w3.org/TR/css-color-4/ · Licence: W3C Software and Document License. Published constants are used in `colour.py`; the code was not copied.

## Colour science
- **Ottosson 2020** · B. Ottosson, "A perceptual color space for image processing" · https://bottosson.github.io/posts/oklab/ · Licence: the post's code is public domain or MIT; no statement for its text. Its published matrices are used.
- **Machado 2009** · G. M. Machado, M. M. Oliveira & L. A. F. Fernandes, "A physiologically-based model for simulation of color vision deficiency", *IEEE TVCG* 15(6), 1291–1298. DOI 10.1109/TVCG.2009.113 · Licence: IEEE, all rights reserved. Severity 1.0 matrices are used with their citation, from https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html.
- **Birch 2012** · J. Birch, "Worldwide prevalence of red-green color deficiency", *JOSA A* 29(3), 313. DOI 10.1364/JOSAA.29.000313 · Licence: Optica Open Access licence, as its Crossref record states. Figure cited only.
- **Corney 2009** · D. Corney, J.-D. Haynes, G. Rees & R. B. Lotto, "The Brightness of Colour", *PLoS ONE* 4(3), e5091. DOI 10.1371/journal.pone.0005091 · Licence: CC BY 4.0. Finding cited only.
- **Hayashi 2012** · Hayashi, Kawai & Sakata, "Individual Differences in Chromostereopsis under Natural Viewing Conditions", *i-Perception*, October 2012. DOI 10.1068/if617 · Licence: none in its Crossref record, cited only.

## Studies on harmony, emotion and choice
- **Schloss & Palmer 2011** · K. B. Schloss & S. E. Palmer, "Aesthetic response to color combinations: preference, harmony, and similarity", *Attention, Perception, & Psychophysics* 73, 551–571. DOI 10.3758/s13414-010-0027-0 · Licence: Creative Commons Attribution Noncommercial, as the article states. Findings cited in our own words.
- **Palmer & Schloss 2010** · S. E. Palmer & K. B. Schloss, "An ecological valence theory of human color preference", *PNAS* 107(19), 8877–8882. DOI 10.1073/pnas.0906172107 · Licence: none in its Crossref record, cited only.
- **Wilms & Oberfeld 2018** · L. Wilms & D. Oberfeld, "Color and emotion: effects of hue, saturation, and brightness", *Psychological Research* 82(5), 896–914. DOI 10.1007/s00426-017-0880-8 · Licence: Springer text-and-data-mining link only in its Crossref record, cited only.
- **Jonauskaite 2020** · D. Jonauskaite et al., "Universal patterns in color-emotion associations are further shaped by linguistic and geographic proximity", *Psychological Science* 31(10), 1245–1260. DOI 10.1177/0956797620948810 · Licence: SAGE text-and-data-mining link only in its Crossref record, cited only.
- **Ou 2004** · L.-C. Ou, M. R. Luo, A. Woodcock & A. Wright, "A study of colour emotion and colour preference", Parts I to III, *Color Research & Application* 29(3), 232–240; 29(4), 292–298; 29(5), 381–389. DOIs 10.1002/col.20010, 10.1002/col.20024, 10.1002/col.20047 · Licence: Wiley terms and conditions, cited only. No equation is included.
- **Hick 1952** · W. E. Hick, "On the rate of gain of information", *Quarterly Journal of Experimental Psychology* 4(1), 11–26. DOI 10.1080/17470215208416600 · Licence: published paper, cited only.
- **Albers 1963** · J. Albers, *Interaction of Color*, Yale University Press · Licence: all rights reserved, principle cited. No text or plate reproduced.

## Design engineers and systems
- **Krehel OKLCH** · Jakub Krehel, OKLCH guide and `oklch-skill` · https://jakub.kr/components/oklch-colors and https://github.com/jakubkrehel/oklch-skill · Licence: MIT for the skill; no statement on the guide, so principles only. Informed scales, gamut and gradients.
- **Linear** · "How we redesigned the Linear UI" (2024) and "Behind the latest design refresh" (2026) · https://linear.app/blog/how-we-redesigned-the-linear-ui and https://linear.app/now/behind-the-latest-design-refresh · Licence: none found, principles only. Informed neutrals, restraint and themes in LCH.
- **shadcn** · shadcn/ui theming · https://ui.shadcn.com/docs/theming and https://github.com/shadcn-ui/ui · Licence: MIT. The token names are used.
- **Radix Colors** · Modulz, "Understanding the scale" · https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale and https://github.com/radix-ui/colors · Licence: MIT. Informed scales whose steps have a job.
- **next-themes** · Paco Coursey · https://github.com/pacocoursey/next-themes · Licence: MIT. Referenced for themes without a flash.
- **meodai** · skill.color-expert · https://github.com/meodai/skill.color-expert · Licence: CC BY 4.0 for its original texts; its `references/` are largely extracts of third-party works that keep their authors' rights. It informed the approach; no passage was adapted.

## Read, nothing used
- **APCA** · Myndex, apca-w3 · https://github.com/Myndex/apca-w3 · Licence: rights reserved, web content only, commercial use needs a signed licence, and APCA is a trademark. Nothing from it is used.

## The project
- **Studio** · this project: the maintainer's colour skill draft, the v0.3 colour skill, the measure of 17 home pages of 2026-11-23, and the rules this skill states itself · https://github.com/MartinMrnn/design-engineer-toolkit · Licence: MIT.
