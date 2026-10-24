# Self-check, once per page

1. Make sure the preview server runs (its URL is in the project `CLAUDE.md`).
2. With the Playwright MCP server, open the approved mockup and the built page at 1440 × 900, then at 390 × 844. Compare them by measure first: one script (`browser_run_code_unsafe`) that lists, for every heading, paragraph, image, button and section, its position, size, font, colour and background in both files, and reports the differences.
3. Then look, with screenshots only where the eye is needed: the first screen of each at both widths, and the places where the measures differ. Every visible difference is either fixed now or, when it cannot be avoided, recorded in `design/deviations.md` with its justification. Every image stays in your context: take only those you need.
4. Run the project's checks on the built page: `browser_navigate` to it, then `browser_run_code_unsafe` with `{ "filename": "design/reviews/scripts/checks.js" }`. Fix every issue it returns.
5. Check by hand:
   - every link goes to a page in scope, `legal.html`, an anchor or a real external URL;
   - the opening hero fills the screen at 1440 × 900 and 390 × 844 with the next section out of view, and nothing is cut at 1440 × 700 and 390 × 667;
   - nothing waits half-animated on the first screen at load, and entrances play where they can be seen;
   - the agreed interactions work with the mouse and the keyboard (Tab, Enter, Escape), and the keyboard order follows the visual order at both widths;
   - focus is visible on every interactive element, and never hidden under a sticky header;
   - with reduced motion (`browser_emulate_media`), the page shows all its content.
6. Stop. One pass only: what remains goes in your report.
