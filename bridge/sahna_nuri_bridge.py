# SAHNA NURI Bridge — Azimxodjayev Music
# Kompyuterdagi uDMX kabelni SAHNA NURI pultiga ulaydi.
#  • Drayver almashtirish shart emas: FreeStyler o'rnatgan libusbK / libusb0 drayveri bilan ishlaydi
#    (WinUSB bo'lsa ham ishlaydi).
#  • Windows bilan birga o'zi ishga tushadi, kabel chiqib qolsa o'zi qayta ulanadi.
#  • Qayta ulanganda va kompyuter qayta yonganda chiroqlarni oxirgi holatiga qaytaradi.
#  • Pult bilan aloqa: ws://127.0.0.1:47800 (faqat sahna-nuri.pages.dev dan).
#  • Holat sahifasi: http://127.0.0.1:47800
import asyncio
import json
import os
import shutil
import subprocess
import sys
import threading
import time
from http import HTTPStatus

import websockets

VERSION = "1.0.0"
PORT = 47800
VID, PID = 0x16C0, 0x05DC
ALLOWED_ORIGINS = [
    "https://sahna-nuri.pages.dev",
    "http://127.0.0.1:8788",
    "http://localhost:8788",
]
FAKE = os.environ.get("SN_FAKE_USB") == "1"   # sinov uchun: haqiqiy USB o'rniga
IS_WIN = sys.platform.startswith("win")
APP_NAME = "SahnaNuriBridge"


def data_dir():
    base = os.environ.get("LOCALAPPDATA") or os.path.expanduser("~/.local/share")
    d = os.path.join(base, APP_NAME)
    os.makedirs(d, exist_ok=True)
    return d


LOG_PATH = os.path.join(data_dir(), "bridge.log")
STATE_PATH = os.path.join(data_dir(), "last_universe.bin")


def log(msg):
    line = time.strftime("%Y-%m-%d %H:%M:%S ") + msg
    try:
        if os.path.exists(LOG_PATH) and os.path.getsize(LOG_PATH) > 512 * 1024:
            os.replace(LOG_PATH, LOG_PATH + ".1")
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except OSError:
        pass
    if not getattr(sys, "frozen", False) or FAKE:
        print(line, flush=True)


def message_box(text, title="SAHNA NURI Bridge", icon=0x40):
    if not IS_WIN:
        log("[xabar] " + text.replace("\n", " "))
        return
    import ctypes
    threading.Thread(target=lambda: ctypes.windll.user32.MessageBoxW(0, text, title, icon | 0x40000), daemon=True).start()


# ---------------- USB (uDMX) ----------------
class FakeDevice:
    def __init__(self):
        self.calls = 0
        self.last = None

    def ctrl_transfer(self, bm, req, val, idx, data, timeout=1000):
        self.calls += 1
        self.last = (bm, req, val, idx, bytes(data[:8]))
        if os.environ.get("SN_FAKE_FAIL") and os.path.exists(os.environ["SN_FAKE_FAIL"]):
            raise IOError("soxta uzilish")
        if os.environ.get("SN_FAKE_DUMP"):
            with open(os.environ["SN_FAKE_DUMP"], "wb") as f:
                f.write(bytes(data))
        return len(data)


def find_udmx():
    """uDMX ni topadi. (device, backend_nomi) yoki (None, xato)."""
    if FAKE:
        if os.environ.get("SN_FAKE_FAIL") and os.path.exists(os.environ["SN_FAKE_FAIL"]):
            return None, "soxta qurilma yo'q"
        return FakeDevice(), "fake"
    import usb.core
    import usb.util
    errors = []
    backends = []
    try:
        import libusb_package
        backends.append(("libusb-1.0", libusb_package.get_libusb1_backend()))
    except Exception as e:  # noqa: BLE001
        errors.append(f"libusb-1.0: {e}")
    try:
        import usb.backend.libusb0 as l0
        be = l0.get_backend()
        if be:
            backends.append(("libusb0", be))
    except Exception as e:  # noqa: BLE001
        errors.append(f"libusb0: {e}")
    for name, be in backends:
        if be is None:
            continue
        try:
            for dev in usb.core.find(find_all=True, idVendor=VID, idProduct=PID, backend=be) or []:
                # 16C0:05DC boshqa qurilmalarda ham uchraydi (masalan USBasp) — nomini tekshiramiz
                product = ""
                try:
                    product = usb.util.get_string(dev, dev.iProduct) or ""
                except Exception:  # noqa: BLE001
                    pass
                if product and "udmx" not in product.lower():
                    continue
                try:
                    dev.set_configuration()
                except Exception:  # noqa: BLE001
                    pass  # libusbK/libusb0 da odatda allaqachon sozlangan
                return dev, name
        except Exception as e:  # noqa: BLE001
            errors.append(f"{name}: {e}")
    return None, "; ".join(errors) or "uDMX topilmadi"


class Output:
    """512 kanalni uDMX ga yuborib turadi, uzilsa qayta ulanadi."""

    def __init__(self, on_status):
        self.universe = bytearray(512)
        self.lock = threading.Lock()
        self.dirty = True
        self.dev = None
        self.backend = ""
        self.error = ""
        self.on_status = on_status
        self.running = True
        self.saved_at = 0
        self.changed_since_save = False
        self.frames = 0
        self._load_state()

    def _load_state(self):
        try:
            with open(STATE_PATH, "rb") as f:
                b = f.read()
            if len(b) == 512:
                self.universe[:] = b
                log("Oxirgi holat tiklandi (chiroqlar avvalgi holatiga qaytadi)")
        except OSError:
            pass

    def _save_state(self):
        try:
            tmp = STATE_PATH + ".tmp"
            with open(tmp, "wb") as f:
                f.write(bytes(self.universe))
            os.replace(tmp, STATE_PATH)
        except OSError:
            pass

    def set(self, data):
        if len(data) != 512:
            return
        with self.lock:
            if self.universe != data:
                self.universe[:] = data
                self.dirty = True
                self.changed_since_save = True

    def status(self):
        return {"type": "status", "ok": self.dev is not None, "device": "uDMX" if self.dev is not None else "",
                "backend": self.backend, "error": self.error, "version": VERSION}

    def run(self):
        last_send = 0.0
        next_try = 0.0
        while self.running:
            now = time.monotonic()
            if self.dev is None:
                if now >= next_try:
                    dev, info = find_udmx()
                    if dev is not None:
                        self.dev, self.backend, self.error = dev, info, ""
                        self.dirty = True
                        log(f"uDMX ulandi ({info}) — oxirgi holat yuborilmoqda")
                        self.on_status()
                    else:
                        if info != self.error:
                            self.error = info
                            log("uDMX kutilmoqda: " + info)
                            self.on_status()
                        next_try = now + 1.0
                time.sleep(0.05)
                continue
            if self.dirty or now - last_send >= 1.0:
                with self.lock:
                    buf = bytes(self.universe)
                    self.dirty = False
                try:
                    # cmd_SetChannelRange = 2: value = kanallar soni, index = boshlang'ich kanal
                    self.dev.ctrl_transfer(0x40, 2, 512, 0, buf, timeout=1000)
                    last_send = now
                    self.frames += 1
                except Exception as e:  # noqa: BLE001
                    log(f"uDMX bilan aloqa uzildi: {e}")
                    try:
                        import usb.util
                        usb.util.dispose_resources(self.dev)
                    except Exception:  # noqa: BLE001
                        pass
                    self.dev, self.error = None, "uDMX bilan aloqa uzildi — qayta ulanmoqda"
                    self.dirty = True
                    next_try = now + 0.5
                    self.on_status()
            if self.changed_since_save and now - self.saved_at > 2.0:
                self.changed_since_save = False
                self.saved_at = now
                self._save_state()
            time.sleep(0.02)
        self._save_state()


# ---------------- WebSocket va holat sahifasi ----------------
CLIENTS = set()
LOOP = None
OUT = None


def broadcast_status():
    if LOOP is None:
        return
    msg = json.dumps(OUT.status())

    async def send_all():
        for ws in list(CLIENTS):
            try:
                await ws.send(msg)
            except Exception:  # noqa: BLE001
                pass
    asyncio.run_coroutine_threadsafe(send_all(), LOOP)


STATUS_HTML = """<!doctype html><html lang="uz"><head><meta charset="utf-8"><title>SAHNA NURI Bridge</title>
<meta http-equiv="refresh" content="3"><style>body{font-family:Segoe UI,Arial,sans-serif;max-width:640px;margin:48px auto;color:#111}
.c{border:1px solid #e5e5e5;border-radius:16px;padding:24px}.ok{color:#15803D}.no{color:#B91C1C}b{font-size:20px}</style></head>
<body><div class="c"><h2>SAHNA NURI Bridge <small>v%(version)s</small></h2>
<p><b class="%(cls)s">%(state)s</b></p><p>%(detail)s</p>
<p>Pult: <a href="https://sahna-nuri.pages.dev">sahna-nuri.pages.dev</a> → Ulanish → <b>BRIDGE ULASH</b></p>
<p style="color:#555">Ulangan pultlar: %(clients)d · Yuborilgan kadrlar: %(frames)d</p></div></body></html>"""


def process_request(path, headers):
    if headers.get("Upgrade", "").lower() == "websocket":
        return None
    st = OUT.status()
    body = STATUS_HTML % {
        "version": VERSION, "cls": "ok" if st["ok"] else "no",
        "state": "● uDMX ulangan" if st["ok"] else "○ uDMX topilmadi",
        "detail": ("Drayver: " + st["backend"]) if st["ok"] else ("Kabelni tekshiring. " + (st["error"] or "")),
        "clients": len(CLIENTS), "frames": OUT.frames,
    }
    return HTTPStatus.OK, [("Content-Type", "text/html; charset=utf-8")], body.encode("utf-8")


async def handler(ws, path=None):
    CLIENTS.add(ws)
    log(f"Pult ulandi ({ws.request_headers.get('Origin')})")
    try:
        await ws.send(json.dumps(OUT.status()))
        async for msg in ws:
            if isinstance(msg, (bytes, bytearray)):
                OUT.set(bytes(msg))
            else:
                try:
                    data = json.loads(msg)
                except ValueError:
                    continue
                if data.get("type") == "ping":
                    await ws.send(json.dumps(OUT.status()))
    except websockets.ConnectionClosed:
        pass
    finally:
        CLIENTS.discard(ws)
        log("Pult uzildi — chiroqlar oxirgi holatda qoladi")


async def serve():
    global LOOP
    LOOP = asyncio.get_running_loop()
    async with websockets.serve(handler, "127.0.0.1", PORT, origins=ALLOWED_ORIGINS,
                                process_request=process_request, max_size=4096):
        log(f"SAHNA NURI Bridge v{VERSION} ishga tushdi: ws://127.0.0.1:{PORT}")
        await asyncio.Future()


# ---------------- O'rnatish va avtomatik ishga tushish (Windows) ----------------
RUN_KEY = r"Software\Microsoft\Windows\CurrentVersion\Run"


def install_dir():
    return os.path.join(data_dir(), "app")


def set_autostart(path):
    import winreg
    with winreg.OpenKey(winreg.HKEY_CURRENT_USER, RUN_KEY, 0, winreg.KEY_SET_VALUE) as k:
        winreg.SetValueEx(k, APP_NAME, 0, winreg.REG_SZ, f'"{path}"')


def remove_autostart():
    import winreg
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, RUN_KEY, 0, winreg.KEY_SET_VALUE) as k:
            winreg.DeleteValue(k, APP_NAME)
    except OSError:
        pass


def port_busy():
    """Boshqa nusxa ishlayaptimi: portga ulanib ko'ramiz."""
    import socket
    try:
        with socket.create_connection(("127.0.0.1", PORT), timeout=0.4):
            return True
    except OSError:
        return False


def ensure_installed():
    """Birinchi ishga tushishda o'zini %LOCALAPPDATA% ga ko'chiradi va avtomatik ishga tushishga yozadi."""
    if not (IS_WIN and getattr(sys, "frozen", False)):
        return False
    exe = os.path.abspath(sys.executable)
    target_dir = install_dir()
    target = os.path.join(target_dir, APP_NAME + ".exe")
    if os.path.normcase(exe) == os.path.normcase(target):
        set_autostart(target)
        return False
    os.makedirs(target_dir, exist_ok=True)
    try:
        shutil.copy2(exe, target)
    except OSError as e:
        log(f"Ko'chirib bo'lmadi ({e}) — joyida ishlaydi")
        set_autostart(exe)
        return False
    set_autostart(target)
    subprocess.Popen([target, "--first-run"], close_fds=True, creationflags=0x00000008 | 0x00000200)
    return True


def main():
    global OUT
    args = sys.argv[1:]
    if "--uninstall" in args:
        if IS_WIN:
            remove_autostart()
        message_box("SAHNA NURI Bridge avtomatik ishga tushishdan olib tashlandi.\nDasturni Vazifalar dispetcheridan yopishingiz mumkin.")
        time.sleep(2)
        return
    if ensure_installed():
        return
    if port_busy():
        message_box("SAHNA NURI Bridge allaqachon ishlayapti.\nHolatini ko'rish: http://127.0.0.1:47800")
        time.sleep(3)
        return
    OUT = Output(broadcast_status)
    threading.Thread(target=OUT.run, daemon=True).start()
    if "--first-run" in args:
        message_box("SAHNA NURI Bridge o'rnatildi va ishga tushdi.\n\n"
                    "• Endi u har safar Windows bilan birga o'zi yonadi.\n"
                    "• Pultda: Ulanish → BRIDGE ULASH.\n"
                    "• Holat: http://127.0.0.1:47800\n\n"
                    "FreeStyler'ni yopib qo'ying — kabelni bir vaqtda bitta dastur ishlatadi.")
    try:
        asyncio.run(serve())
    except KeyboardInterrupt:
        pass
    finally:
        OUT.running = False
        time.sleep(0.1)


if __name__ == "__main__":
    main()
