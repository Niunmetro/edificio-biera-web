"""Genera index.html (es), en/index.html y fr/index.html a partir de src/template.html y los diccionarios de i18n/."""
import json, os, re, sys, html, hashlib, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
V = hashlib.sha1(open(os.path.join(ROOT, "assets/css/styles.css"), "rb").read() + open(os.path.join(ROOT, "assets/js/main.js"), "rb").read()).hexdigest()[:8]
FORM_ACTION = "https://script.google.com/macros/s/AKfycbwH0q-_CXay633v2sonk-mG-Pwk5WfWceUOL_T7aMZZ30lIga-0zNrffIKxe6H7eX9B4w/exec"
LANGS = [("es", "index.html", "es_ES"), ("en", "en/index.html", "en_GB"), ("fr", "fr/index.html", "fr_FR")]

def load(p):
    with open(os.path.join(ROOT, p), encoding="utf-8") as f:
        return json.load(f)

tpl = open(os.path.join(ROOT, "src", "template.html"), encoding="utf-8").read()
units = load("i18n/units.json")
pois = load("i18n/pois.json")

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
{('          <span class="unote">' + d['u.note.' + str(u['v'])] + '</span>') if d.get('u.note.' + str(u['v'])) else ''}
        </div>
      </li>""")
    return "\n".join(out)

def poi_label(p, d):
    parts = [d["map.m"].replace("{m}", str(p["m"]))] if p.get("m") else [d["map.km"].replace("{km}", num(str(p["km"]).replace(".", ","), d["lang"]))]
    if p.get("drive"): parts.append(d["map.drive"].replace("{n}", str(p["drive"])))
    if p.get("walk"): parts.append(d["map.walk"].replace("{n}", str(p["walk"])))
    return " · ".join(parts)

def poi_rows(d):
    out = []
    last_g = None
    for i, p in enumerate(pois["items"]):
        if p.get("g") and p["g"] != last_g:
            out.append(f"""          <li class="poi-g" aria-hidden="true">{d["map.g_" + p["g"]]}</li>""")
            last_g = p["g"]
        top = bool(p.get("top"))
        out.append(f"""          <li class="poi-i{' poi-top' if top else ''}"><button type="button" class="poi-b" data-i="{i}"><span class="poi-n">{p["name"][d["lang"]]}</span><span class="poi-d">{poi_label(p, d)}</span></button></li>""")
    return "\n".join(out)

def poi_json(d):
    return {"center": pois["center"], "items": [{"lat": p["lat"], "lon": p["lon"], "km": p["km"], "cat": p.get("cat", ""), "short": p.get("short", ""), "side": p.get("side", ""), "top": bool(p.get("top")), "name": p["name"][d["lang"]], "label": poi_label(p, d)} for p in pois["items"]]}

def units_ld(d):
    path = "" if d["lang"] == "es" else d["lang"] + "/"
    agent = {"@type": "RealEstateAgent", "@id": "https://edificiobiera.com/#jdleon", "name": "JD León Inmobiliaria", "telephone": "+34640512434", "email": "info@jdleon.com",
             "address": {"@type": "PostalAddress", "streetAddress": "Av. de Madrid, 21 bajo", "postalCode": "30500", "addressLocality": "Molina de Segura", "addressRegion": "Murcia", "addressCountry": "ES"},
             "areaServed": "Murcia"}
    units_l = []
    for u in units:
        baths = {"d4a": 4, "d3a": 3, "d3b": 4}[u["dist"]]
        units_l.append({"@type": "SingleFamilyResidence", "name": f"Edificio Biera · {d['ld.unit']} {u['v']:02d}",
                        "url": f"https://edificiobiera.com/{path}#v{u['v']:02d}",
                        "floorSize": {"@type": "QuantitativeValue", "value": float(u["constr"].replace(",", ".")), "unitCode": "MTK"},
                        "numberOfBedrooms": u["d"], "numberOfBathroomsTotal": baths,
                        "description": d["ld.room4"] if u["d"] == 4 else d["ld.room3"],
                        "containedInPlace": {"@id": "https://edificiobiera.com/#edificio"}})
    return json.dumps({"@context": "https://schema.org", "@graph": [agent] + units_l}, ensure_ascii=False)

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
        "units": {str(u["v"]): {"name": d[f"u.name.{u['v']}"], "dist": d["u." + u["dist"]], "constr": num(u["constr"], d["lang"]), "d": u["d"], "note": d.get(f"u.note.{u['v']}", "")} for u in units},
        "pois": poi_json(d),
        "t": {k: d[k] for k in ("map.here", "f.ok.p_wa", "f.err.name", "f.err.tel", "f.err.email", "f.err.priv", "f.err.send", "f.sending", "f.ok.p", "f.ok.ref", "wa.text", "wa.text_unit", "units.count", "units.count1", "units.viv", "units.plan_alt", "cta.plan")},
    }
    return json.dumps(j, ensure_ascii=False)

missing_all = set()
for lang, outp, og in LANGS:
    d = load(f"i18n/{lang}.json")
    d["units.rows"] = rows(d)
    d["faq_ld"] = faq_ld(d)
    d["units_ld"] = units_ld(d)
    d["poi.rows"] = poi_rows(d)
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
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n')
    for lang, outp, og in LANGS:
        loc = "https://edificiobiera.com/" + ("" if lang == "es" else lang + "/")
        f.write(f"  <url><loc>{loc}</loc><lastmod>{datetime.date.today().isoformat()}</lastmod>")
        for l2, o2, _ in LANGS:
            f.write(f'<xhtml:link rel="alternate" hreflang="{l2}" href="https://edificiobiera.com/{"" if l2 == "es" else l2 + "/"}"/>')
        f.write('<xhtml:link rel="alternate" hreflang="x-default" href="https://edificiobiera.com/"/>')
        for img in ("fachada.jpg", "foto-aerea-tarde.jpg", "foto-salon.jpg", "foto-cocina.jpg", "foto-terraza.jpg", "foto-dormitorio.jpg", "foto-bano.jpg", "foto-fachada-noche.jpg"):
            f.write(f"<image:image><image:loc>https://edificiobiera.com/assets/img/{img}</image:loc></image:image>")
        f.write("</url>\n")
    f.write("</urlset>\n")

if missing_all:
    print("CLAVES SIN TRADUCIR (se usa el español):", sorted(missing_all))
    if any(k.endswith("!!") for k in missing_all): sys.exit(1)
print("OK")
