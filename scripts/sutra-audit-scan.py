#!/usr/bin/env python3
"""Read-only evidence scanner for Sutra Search self-host source; no secret values."""
import collections
import pathlib
import re

ROOT = pathlib.Path(".")
EXTS = {".tsx", ".ts", ".jsx", ".js", ".mts", ".mdx", ".json", ".yaml", ".yml", ".html", ".css"}
SRC_ROOTS = ("src/", "web/src/", "web/content/", "deploy/", ".github/workflows/", "plugins/openseo/")
USER_FILES = ("src/client/", "src/routes/", "src/serverFunctions/", "src/server/email/", "src/server/mcp/",
              "src/server/auth/", "web/src/", "web/content/")
EXCLUDE = (".test.", ".spec.", "__tests__", "generated", "routeTree.gen", "package-lock", "tsconfig")
pat = re.compile(r"\b(?:OpenSEO|Open SEO|open-seo|open_seo|openseo|Every App|every-app|everyapp|EVERY_APP)\b", re.I)
urls = re.compile(r"https?://[^\s<>\"'\x60)\\]+")
envpat = re.compile(r"\b(?:GOOGLE_[A-Z0-9_]+|DATAFORSEO_API_KEY|OPENROUTER_[A-Z0-9_]+|CONTEXT_API_KEY|(?:OPENSEO|BETTER_AUTH|LOOPS|POSTHOG|TURNSTILE|AUTUMN|DUB|CLOUDFLARE|META|CRAWLER|BROWSER|GA4|GSC)_[A-Z0-9_]+)\b")
feature = re.compile(r"\b(?:isSelfHost\w*|isHosted\w*|isEveryApp\w*|AUTH_MODE|DATABASE_PROVIDER|PAYWALL|BILLING|billing|Autumn|subscription|featureFlag|requiresPlan)\b")
redirect = re.compile(r"window\.location|location\.href|redirectTo|redirect\(|callbackURL|callbackUrl|newChatUrl|ONE_CLICK_INSTALLS|mcp.*url|returnTo", re.I)
external_hosts = ("openseo", "open-seo", "every-app", "everyapp", "github.com", "discord", "chatgpt", "claude", "google.com", "stripe", "autumn", "loops", "dub.co")
files=[]
for path in ROOT.rglob("*"):
    if not path.is_file() or path.suffix not in EXTS: continue
    name=path.as_posix()
    if not name.startswith(SRC_ROOTS) or any(x in name for x in EXCLUDE): continue
    if path.stat().st_size>250000:continue
    files.append(path)
rows=collections.defaultdict(list)
for path in sorted(files):
    name=path.as_posix()
    s=path.read_text(encoding="utf-8", errors="replace")
    for no,line in enumerate(s.splitlines(),1):
        line=line.strip()
        if len(line)>400:line=line[:400]
        item=f"{name}:{no}: {line}"
        if name.startswith(USER_FILES) and pat.search(line):
            rows["APP_BRAND"].append(item)
        if urls.search(line) and (name.startswith(USER_FILES) or name.startswith("deploy/")):
            for url in urls.findall(line):
                if any(host in url.lower() for host in external_hosts):
                    rows["EXTERNAL_URLS"].append(item)
                    break
        if name.startswith(USER_FILES) and redirect.search(line):
            rows["REDIRECT_AUTH_AGENT"].append(item)
        if name.startswith(USER_FILES) and feature.search(line):
            rows["SELF_HOST_GATES"].append(item)
        if envpat.search(line) and name.startswith(("src/server/", "src/serverFunctions/", "deploy/", ".github/workflows/")):
            rows["PROVIDER_REFERENCES"].append(item)
print("SUTRA STATIC AUDIT",len(files),"files scanned; no secret files or values scanned")
for key,limit in [("APP_BRAND",850),("EXTERNAL_URLS",450),("REDIRECT_AUTH_AGENT",300),("SELF_HOST_GATES",260),("PROVIDER_REFERENCES",400)]:
    v=rows[key]
    print("\n=== "+key+" COUNT="+str(len(v))+" ===")
    for row in v[:limit]: print(row)
    if len(v)>limit: print(f"... truncated {len(v)-limit} rows")
