"""Generate an mp3 for every Afrikaans word/phrase in lessons.js.
Voice: Microsoft Edge neural voice af-ZA-WillemNeural (male), spoken a bit faster than default.
Run: pip install edge-tts && python generate_audio.py
Files land in audio/, and audio/index.json lists them so the app finds them automatically.
Change VOICE or RATE below and the next run regenerates everything."""
import asyncio, hashlib, json, pathlib, re, unicodedata
import edge_tts

VOICE = 'af-ZA-WillemNeural'   # male. (af-ZA-AdriNeural is the female voice.)
RATE = '+15%'                  # faster than normal; try +25% for faster still
VERSION = f'{VOICE}|{RATE}|1'
VTAG = hashlib.md5(VERSION.encode()).hexdigest()[:6]

def slug(t):
    t = unicodedata.normalize('NFD', t.lower())
    t = ''.join(c for c in t if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')

src = pathlib.Path('lessons.js').read_text(encoding='utf-8')
data = json.loads(src[src.index('{'):src.rindex('}') + 1])
out = pathlib.Path('audio'); out.mkdir(exist_ok=True)
marker = out / 'voice.txt'
if not marker.exists() or marker.read_text() != VERSION:
    for f in out.glob('*.mp3'):
        f.unlink()
    print('Voice changed, regenerating everything with', VERSION)

texts = {}
for lesson in data['lessons']:
    for af, _ in lesson['items']:
        texts.setdefault(slug(af), af)

async def make(sem, s, text):
    f = out / f'{s}.mp3'
    if f.exists() and f.stat().st_size > 500:
        return True
    async with sem:
        for attempt in range(4):
            try:
                await edge_tts.Communicate(text, VOICE, rate=RATE).save(str(f))
                if f.exists() and f.stat().st_size > 500:
                    print('made', f.name); return True
            except Exception as e:
                print('retry', text, e); await asyncio.sleep(2 + attempt * 2)
    if f.exists(): f.unlink()
    print('FAILED', text); return False

async def main():
    sem = asyncio.Semaphore(4)
    res = await asyncio.gather(*[make(sem, s, t) for s, t in texts.items()])
    ok = [s for (s, _), r in zip(texts.items(), res) if r]
    marker.write_text(VERSION)
    (out / 'index.json').write_text(json.dumps({'v': VTAG, 'files': sorted(ok)}))
    print(f'{len(ok)}/{len(texts)} files ready')

asyncio.run(main())
