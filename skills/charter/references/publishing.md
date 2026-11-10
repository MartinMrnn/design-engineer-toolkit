# Publishing the charter

The charter, the C2 branches and the C2 board are Artifacts on claude.ai, private by default. The local files are the source; an Artifact is always a publication of them. Only the lead publishes the charter and the board. At C2, each art director publishes its own branch.

## Create, once per system
Artifact `publish` with:
- `type_url`: `https://claude.ai/artifact/5M7UeXXcx16TP3vzVFNDzd`, the core "Design System" type. If it is refused, find the type with Artifact `list`, `scope: "types"`.
- `title`: the charter is `<Client>`; a branch is `<Client> · <ID> — <direction name>`.
- `auto_open`: `"after_first_write"`, and no files.

Write the returned `url` in `CLAUDE.md` (Facts), or in your REPORT for a branch. Never send `type_url` again for the same system: that would make a second one. The create result carries the type's own instructions: read them once. Where they differ from this file or the contract, this file and the contract decide for the studio's files.

## Publish, at the end of every step
1. `charter.py check --step <id>` passes (`--root design/branches/<id>` for a branch).
2. **Uploads.** `charter.py assets` lists the files under `assets/` that have no record. For each one: Artifact `publish` with `url`, `file_path` (its absolute path) and `asset: true`; then `charter.py record --file <its path under project/> --blob <the url the result gives>`.
3. **Index.** Artifact `read` with `url` and `path: "project/design-system.json"`, and note where the result saved it. Then `charter.py stamp --step <id> --by "<the user's name, from CLAUDE.md>" --remote <that file>`. On the first publish the system has no index yet: run `stamp` without `--remote`. A branch adds `--root design/branches/<id> --title "<Client> · <ID> — <direction name>"`, so that it keeps its direction name.
4. **Files.** One Artifact `publish` with `url`; `root`: the absolute path of `design/charter` (or of the branch folder); `file_path`: `<root>/project/design-system.json`; `files`: every file under `project/` except `design-system.json` and the files under `assets/<Group>/` that `charter.py assets` handles (their `README.md` files are included), each as `"project/<path>": "project/<path>"`. A file deleted locally since the last publish is `"project/<path>": null`. Above 255 paths, split into several calls, with the index only in the last.
5. Give the user the link.

If the publish asks you to load a skill you cannot load, stop and report it; the lead publishes the branch.

`tokens.css` only ever comes from `charter.py css`.

## When the person edited the system on its page
The user may edit the charter on claude.ai. Before each step, `read` `project/design-system.json`: if `lastChange.via` is `page`, read the files a person can change there (`tokens.json`, the sections, the component READMEs) and bring their changes into the local files, keeping their words, before the step starts.

A publish refused because someone saved meanwhile names the files to read again: read each, bring the changes into the local files, run `check`, and publish once more. Refused again: tell the user and stop.

## Rename, after the C2 merge
An art director published the branch, not you, and the service refuses a publish to an Artifact your session has not read whole. So first Artifact `read` with its `url` alone (no `path`); the same holds whenever you publish a branch for an art director. Then `read` the branch's index (`path: "project/design-system.json"`), then `charter.py stamp --step C2 --by "<name>" --root design/branches/<id> --remote <that file> --title "<Client> · <ID> — <direction name> (merged)"`, or `(not kept)`; then publish only `project/design-system.json` of that branch. Never delete a branch unless the user asks.

## The C2 board
After `charter.py board`, publish `design/board/index.html` as a plain Artifact: Artifact `publish` with `file_path` its absolute path, `files` each capture under `design/board/` (`"a/cover.png": "<absolute path>"`…), `icon: "compare"` and a one-sentence `description`. A later publish of the same `file_path` keeps the link. The board follows the page rules (a short title, colours as variables with a dark mode, phone width); if the host asks you to load its page-design skill before a publish, load it.

## Reading
Agents read the local files. The lead reads the Artifact only to pull a person's edits, as above.
