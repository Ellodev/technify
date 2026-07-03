"""Web Push notifications (VAPID).

Keys come from VAPID_PRIVATE_KEY/VAPID_PUBLIC_KEY env vars; if absent, a key
pair is generated once and persisted under DATA_DIR so push works with zero
configuration in docker-compose / k8s test deployments.
"""

import json
import logging

from cryptography.hazmat.primitives import serialization
from py_vapid import Vapid, b64urlencode
from pywebpush import WebPushException, webpush

from . import config, store

log = logging.getLogger("technify.push")

_private_key_pem: str | None = None
_public_key_b64: str | None = None


def init() -> None:
    global _private_key_pem, _public_key_b64

    key_file = config.DATA_DIR / "vapid_private.pem"
    if config.VAPID_PRIVATE_KEY:
        _private_key_pem = config.VAPID_PRIVATE_KEY.replace("\\n", "\n")
        vapid = Vapid.from_pem(_private_key_pem.encode())
    elif key_file.exists():
        _private_key_pem = key_file.read_text()
        vapid = Vapid.from_pem(_private_key_pem.encode())
    else:
        vapid = Vapid()
        vapid.generate_keys()
        config.DATA_DIR.mkdir(parents=True, exist_ok=True)
        vapid.save_key(str(key_file))
        _private_key_pem = key_file.read_text()
        log.info("generated new VAPID key pair at %s", key_file)

    raw = vapid.public_key.public_bytes(
        encoding=serialization.Encoding.X962,
        format=serialization.PublicFormat.UncompressedPoint,
    )
    _public_key_b64 = b64urlencode(raw)


def public_key() -> str | None:
    return _public_key_b64


def notify_new_articles(new_articles: list[dict]) -> None:
    """Send one digest notification per subscriber for a refresh batch."""
    if not new_articles or not _private_key_pem:
        return
    subscriptions = store.list_subscriptions()
    if not subscriptions:
        return

    for sub in subscriptions:
        wanted = set(sub["categories"])
        relevant = [
            a for a in new_articles if not wanted or a["category"] in wanted
        ]
        if not relevant:
            continue

        top = relevant[0]
        payload = {
            "title": f"{len(relevant)} new tech stories"
            if len(relevant) > 1
            else top["title"],
            "body": top["title"] if len(relevant) > 1 else (top["summary"] or top["source_name"]),
            "url": "/" if len(relevant) > 1 else top["link"],
            "icon": "/icons/icon-192.png",
        }
        try:
            webpush(
                subscription_info=sub["subscription"],
                data=json.dumps(payload),
                vapid_private_key=_private_key_pem,
                vapid_claims={"sub": config.VAPID_SUBJECT},
                ttl=3600,
            )
        except WebPushException as exc:
            status = getattr(exc.response, "status_code", None)
            if status in (404, 410):
                # Subscription expired or revoked by the browser.
                store.remove_subscription(sub["endpoint"])
                log.info("removed expired subscription %s", sub["endpoint"][:60])
            else:
                log.warning("push failed (%s): %s", status, exc)
        except Exception as exc:  # pragma: no cover - network dependent
            log.warning("push failed: %s", exc)
