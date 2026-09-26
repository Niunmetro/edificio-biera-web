"""Genera index.html (es), en/index.html y fr/index.html a partir de src/template.html y los diccionarios de i18n/."""
import json, os, re, sys, html, hashlib

ROOT = os.path.dirname(os.path.abspath(__file__))
V = hashlib.sha1(open(os.path.join(ROOT, "assets/css/styles.css"), "rb").read() + open(os.path.join(ROOT, "assets/js/main.js"), "rb").read()).hexdigest()[:8]
FORM_ACTION = "https://script.google.com/macros/s/AKfycbwH0q-_CXay633v2sonk-mG-Pwk5WfWceUOL_T7aMZZ30lIga-0zNrffIKxe6H7eX9B4w/exec"
LANGS = [("es", "index.html", "es_ES"), ("en", "en/index.html", "en_GB"), ("fr", "fr/index.html", "fr_FR")]

def load(p):
    with open(os.path.join(ROOT, p), encoding="utf-8") as f:
        return json.load(f)

tpl = open(os.path.join(ROOT, "src", "template.html"), encoding="utf-8").read()
units = load("i18n/units.json")

def num(s, lang):
    return s.replace(",", ".") if lang == "en" else s

def nw(text, sep=" · "):
    return sep.join(f'<span class="nw">{p}</span>' for p in text.split(" · "))

def rows(d):
    out = []
    for u in units:
        n = f"{u['v']:02d}"
        name = d[f"u.name.{u['v']}"]
        out.append(
f"""      <li class="row" data-d="{u['d']}" data-v="{u['v']}">
        <button class="rh" type="button" aria-expanded="false" aria-controls="ud{u['v']}">
          <span class="num serif">{n}</span>
          <span class="ty"><span class="serif nm">{name}</span><small>{d['u.or.' + u['orient']]}</small></span>
          <span class="sum">{nw(d['u.' + u['dist']])} · <span>{num(u['constr'], d['lang'])}\u00a0m²</span> · <span>{d['u.short.' + u['gar'][4:]]}</span></span>
        </button>
        <div class="ud" id="ud{u['v']}">
          <span class="dd"><b>{d['units.th.dist']}</b>{nw(d['u.' + u['dist']], '<span class="sep"> · </span>')}</span>
          <span class="m2 r"><b>{d['units.th.constr']}</b>{num(u['constr'], d['lang'])}\u00a0m²</span>
          <span class="m2 r"><b>{d['units.th.util']}</b>{num(u['util'], d['lang'])}\u00a0m²</span>
          <span class="m2 r"><b>{d['units.th.sol']}</b>{num(u['sol'], d['lang'])}\u00a0m²</span>
          <span class="gar"><b>{d['units.th.gar']}</b>{d['u.' + u['gar']]}</span>
          <span class="acts"><button class="btn btn-line btn-sm" type="button" data-plan="{u['v']}" aria-haspopup="dialog">{d['cta.plan']}</button></span>
        </div>
      </li>""")
    return "\n".join(out)

def faq_ld(d):
    strip = lambda s: re.sub(r"<[^>]+>", "", s).replace("\u00a0", " ")
    items = [{"@type": "Question", "name": strip(d[f"faq.q{i}"]), "acceptedAnswer": {"@type": "Answer", "text": strip(d[f"faq.a{i}"])}} for i in range(1, 7)]
    return json.dumps({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": items}, ensure_ascii=False)

def options(d):
    return "\n".join(f"              <option value=\"v{u['v']}\">{d['units.viv']} {u['v']:02d} · {d['u.name.' + str(u['v'])]}</option>" for u in units)

def js_json(d):
    j = {
        "lang": d["lang"],
        "action": FORM_ACTION,
        "units": {str(u["v"]): {"name": d[f"u.name.{u['v']}"], "dist": d["u." + u["dist"]], "constr": num(u["constr"], d["lang"]), "d": u["d"]} for u in units},
        "t": {k: d[k] for k in ("f.ok.p_wa", "f.err.name", "f.err.tel", "f.err.email", "f.err.priv", "f.err.send", "f.sending", "f.ok.p", "f.ok.ref", "wa.text", "wa.text_unit", "units.count", "units.count1", "units.viv", "units.plan_alt", "cta.plan")},
    }
    return json.dumps(j, ensure_ascii=False)

missing_all = set()
for lang, outp, og in LANGS:
    d = load(f"i18n/{lang}.json")
    d["units.rows"] = rows(d)
    d["faq_ld"] = faq_ld(d)
    d["units.options"] = options(d)
    d["js_json"] = js_json(d)
    d["og_locale"] = og
    d["v"] = V
    d["form_action"] = FORM_ACTION
    d["lang_uc"] = lang.upper()
    d["lang_html"] = {"es": "es", "en": "en-GB", "fr": "fr"}[lang]
    d["og_alternates"] = "\n".join(f'<meta property="og:locale:alternate" content="{o2}">' for l2, _, o2 in LANGS if l2 != lang)
    for l in ("es", "en", "fr"):
        d[f"cur.{l}"] = ' aria-current="page"' if l == lang else ""
    es = load("i18n/es.json") if lang != "es" else d
    def rep(m):
        k = m.group(1)
        if k in d:
            return d[k]
        if k in es:
            missing_all.add(f"{lang}:{k}")
            return es[k]
        missing_all.add(f"{lang}:{k}!!")
        return m.group(0)
    out = re.sub(r"\{\{([a-zA-Z0-9_.]+)\}\}", rep, tpl)
    p = os.path.join(ROOT, outp)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(out)
    print(f"{outp}: {len(out):,} bytes")

with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8", newline="\n") as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n')
    for lang, outp, og in LANGS:
        loc = "https://edificiobiera.com/" + ("" if lang == "es" else lang + "/")
        f.write(f"  <url><loc>{loc}</loc><lastmod>2026-09-26</lastmod>")
        for l2, o2, _ in LANGS:
            f.write(f'<xhtml:link rel="alternate" hreflang="{l2}" href="https://edificiobiera.com/{"" if l2 == "es" else l2 + "/"}"/>')
        f.write('<xhtml:link rel="alternate" hreflang="x-default" href="https://edificiobiera.com/"/>')
        f.write("</url>\n")
    f.write("</urlset>\n")

if missing_all:
    print("CLAVES SIN TRADUCIR (se usa el español):", sorted(missing_all))
    if any(k.endswith("!!") for k in missing_all): sys.exit(1)
print("OK")
