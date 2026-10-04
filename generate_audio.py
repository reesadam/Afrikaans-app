"""Generate an mp3 for every Afrikaans word/phrase in index.html (uses Google's Afrikaans voice via gTTS).
Run: pip install gTTS && python generate_audio.py
Files land in audio/ and audio/index.json lists them, which the app reads automatically."""
import json, re, time, unicodedata, pathlib
from gtts import gTTS

def slug(t):
    t = unicodedata.normalize('NFD', t.lower())
    t = ''.join(c for c in t if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')

html = pathlib.Path('index.html').read_text(encoding='utf-8')
data = json.loads(re.search(r'<script type="application/json" id="data">(.*?)</script>', html, re.S).group(1))
out = pathlib.Path('audio'); out.mkdir(exist_ok=True)
slugs = set()
for lesson in data['lessons']:
    for af, _ in lesson['items']:
        s = slug(af); slugs.add(s)
        f = out / f'{s}.mp3'
        if f.exists(): continue
        try:
            gTTS(af.replace("'n", "n"), lang='af').save(str(f)); print('made', f.name); time.sleep(0.4)
        except Exception as e:
            print('failed', af, e); slugs.discard(s)
(out / 'index.json').write_text(json.dumps(sorted(s for s in slugs if (out / f'{s}.mp3').exists())))
