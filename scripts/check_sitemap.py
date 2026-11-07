#!/usr/bin/env python3
"""Check sitemap.xml against the HTML in this repo.

Fails if the XML does not parse, if a <loc> is duplicated, if a listed
URL is not the page's own canonical (the storybook home is the one
allowed exception, because it has no canonical and its indexing is held),
or if a noindex page or the resources redirect stub is listed.
"""
import pathlib
import re
import sys
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[1]
ORIGIN = "https://www.openbooktherapist.com"
NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
# Indexing of the storybook home is held (no canonical, no robots meta).
HELD_NO_CANONICAL = {ORIGIN + "/storybook/"}


def html_files():
    return [p for p in ROOT.rglob("*.html") if "node_modules" not in p.parts]


def meta(text, name):
    m = re.search(
        r'<meta[^>]+name=["\']' + name + r'["\'][^>]+content=["\']([^"\']+)',
        text,
        re.I,
    )
    if m:
        return m.group(1)
    m = re.search(
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']' + name + r'["\']',
        text,
        re.I,
    )
    return m.group(1) if m else ""


def canonical(text):
    m = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)', text, re.I)
    if m:
        return m.group(1)
    m = re.search(r'<link[^>]+href=["\']([^"\']+)["\'][^>]+rel=["\']canonical["\']', text, re.I)
    return m.group(1) if m else ""


def title_of(text):
    m = re.search(r"<title>(.*?)</title>", text, re.I | re.S)
    return re.sub(r"\s+", " ", m.group(1)).strip() if m else ""


def public_path(path: pathlib.Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        return "/" + rel[: -len("index.html")]
    return "/" + rel


def main():
    sitemap = ROOT / "sitemap.xml"
    errors = []
    try:
        tree = ET.parse(sitemap)
    except ET.ParseError as exc:
        print("FAIL sitemap does not parse:", exc)
        return 1
    locs = [el.text.strip() for el in tree.findall("sm:url/sm:loc", NS)]
    if len(locs) != len(set(locs)):
        errors.append("duplicate <loc> values")
    pages = {}
    for path in html_files():
        text = path.read_text(encoding="utf-8", errors="replace")
        robots = meta(text, "robots")
        pages[public_path(path)] = {
            "file": path.relative_to(ROOT).as_posix(),
            "title": title_of(text),
            "canonical": canonical(text),
            "robots": robots,
        }
    for loc in locs:
        if not loc.startswith(ORIGIN + "/"):
            errors.append("loc outside the site: " + loc)
            continue
        route = loc[len(ORIGIN):]
        info = pages.get(route)
        if not info:
            errors.append("loc has no HTML file: " + loc)
            continue
        if "noindex" in info["robots"].lower():
            errors.append("noindex page listed: " + loc)
        if route == "/professional/resources.html":
            # Distinct support-resources page today. If it is later a refresh stub, reject it.
            if 'http-equiv="refresh"' in path_text(info):
                errors.append("redirect stub listed: " + loc)
        if loc in HELD_NO_CANONICAL:
            if info["canonical"]:
                errors.append("storybook home gained a canonical; indexing decision is held: " + info["canonical"])
            continue
        if info["canonical"] != loc:
            errors.append("loc is not the page canonical: " + loc + " canonical=" + (info["canonical"] or "(none)"))
    print("sitemap locs", len(locs))
    print("html files", len(pages))
    if errors:
        print("FAIL")
        for err in errors:
            print(" -", err)
        return 1
    print("OK sitemap")
    return 0


def path_text(info):
    return (ROOT / info["file"]).read_text(encoding="utf-8", errors="replace")


if __name__ == "__main__":
    sys.exit(main())
