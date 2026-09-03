"""Extension points for :mod:`music_source_research`.

An external plugin module may export either ``plugin`` (one plugin instance) or
``plugins`` (an iterable of plugin instances). A plugin only needs ``matches``
and ``enrich`` methods; it does not need to inherit from a project class.
"""

from __future__ import annotations

from dataclasses import dataclass
import importlib.util
from pathlib import Path
from typing import Any, Iterable, Protocol


@dataclass
class PageContext:
    url: str
    page: str
    parser: Any
    json_ld: list[dict[str, Any]]
    source: dict[str, Any]


class SourcePlugin(Protocol):
    name: str

    def matches(self, url: str) -> bool:
        ...

    def enrich(self, context: PageContext) -> None:
        ...


def plugin_items(module: Any) -> list[SourcePlugin]:
    if hasattr(module, "plugins"):
        items: Iterable[SourcePlugin] = module.plugins
    elif hasattr(module, "plugin"):
        items = [module.plugin]
    else:
        return []
    return [item for item in items if hasattr(item, "matches") and hasattr(item, "enrich")]


def external_plugins(paths: Iterable[Path]) -> list[SourcePlugin]:
    discovered: list[SourcePlugin] = []
    for directory in paths:
        if not directory.is_dir():
            raise ValueError(f"Plugin directory does not exist: {directory}")
        for path in sorted(directory.glob("*.py")):
            if path.name.startswith("_"):
                continue
            module_name = f"frontjang_music_source_plugin_{path.stem}"
            spec = importlib.util.spec_from_file_location(module_name, path)
            if not spec or not spec.loader:
                raise ValueError(f"Could not load plugin: {path}")
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            discovered.extend(plugin_items(module))
    return discovered


def builtin_plugins() -> list[SourcePlugin]:
    from .allmusic import plugin as allmusic
    from .amazon import plugin as amazon
    from .apple_music import plugin as apple_music
    from .discogs import plugin as discogs
    from .deutsche_grammophon import plugin as deutsche_grammophon
    from .eloquence_classics import plugin as eloquence_classics
    from .imslp import plugin as imslp
    from .naxos import plugin as naxos
    from .tistory import plugin as tistory
    from .tmdb import plugin as tmdb
    from .universal_music import plugin as universal_music
    from .warner_classics import plugin as warner_classics
    from .wikipedia import plugin as wikipedia

    return [tistory, universal_music, deutsche_grammophon, eloquence_classics, warner_classics, tmdb, wikipedia, imslp, discogs, allmusic, amazon, apple_music, naxos]


def discover(extra_directories: Iterable[Path] = ()) -> list[SourcePlugin]:
    return builtin_plugins() + external_plugins(extra_directories)
