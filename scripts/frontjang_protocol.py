#!/usr/bin/env python3
"""Register and handle the frontjang-gif:// Windows URL protocol."""

from __future__ import annotations

import argparse
import os
from pathlib import Path
import subprocess
import sys
from urllib.parse import unquote, urlparse


SCHEME = "frontjang-gif"
REGISTRY_PATH = rf"Software\Classes\{SCHEME}"
DEFAULT_MUSIC_ROOT = Path(r"H:\frontjang-gif\Music")


def require_windows() -> None:
    if sys.platform != "win32":
        raise SystemExit("This utility can only be used on Windows.")


def registry_module():
    require_windows()
    import winreg

    return winreg


def pythonw_executable() -> Path:
    executable = Path(sys.executable).resolve()
    candidate = executable.with_name("pythonw.exe")
    return candidate if candidate.exists() else executable


def register_protocol(music_root: Path) -> None:
    winreg = registry_module()
    script = Path(__file__).resolve()
    root = music_root.expanduser().resolve()
    command = (
        subprocess.list2cmdline([str(pythonw_executable()), str(script), "open"])
        + ' "%1"'
    )

    with winreg.CreateKey(winreg.HKEY_CURRENT_USER, REGISTRY_PATH) as key:
        winreg.SetValueEx(key, None, 0, winreg.REG_SZ, f"URL:{SCHEME} Protocol")
        winreg.SetValueEx(key, "URL Protocol", 0, winreg.REG_SZ, "")
        winreg.SetValueEx(key, "MusicRoot", 0, winreg.REG_SZ, str(root))

    command_path = REGISTRY_PATH + r"\shell\open\command"
    with winreg.CreateKey(winreg.HKEY_CURRENT_USER, command_path) as key:
        winreg.SetValueEx(key, None, 0, winreg.REG_SZ, command)

    print(f"Registered {SCHEME}:// for {root}")


def delete_registry_tree(winreg, parent, path: str) -> None:
    try:
        with winreg.OpenKey(parent, path, 0, winreg.KEY_READ | winreg.KEY_WRITE) as key:
            while True:
                try:
                    child = winreg.EnumKey(key, 0)
                except OSError:
                    break
                delete_registry_tree(winreg, parent, path + "\\" + child)
        winreg.DeleteKey(parent, path)
    except FileNotFoundError:
        return


def remove_protocol() -> None:
    winreg = registry_module()
    delete_registry_tree(winreg, winreg.HKEY_CURRENT_USER, REGISTRY_PATH)
    print(f"Removed {SCHEME}:// registration")


def registered_music_root() -> Path:
    winreg = registry_module()
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, REGISTRY_PATH) as key:
            value, _ = winreg.QueryValueEx(key, "MusicRoot")
    except FileNotFoundError as error:
        raise SystemExit(f"{SCHEME}:// is not registered.") from error
    return Path(value).resolve()


def target_from_url(url: str, music_root: Path) -> Path:
    parsed = urlparse(url)
    if parsed.scheme.lower() != SCHEME or parsed.netloc.lower() != "open":
        raise ValueError(f"Expected {SCHEME}://open/<relative folder>.")
    if parsed.query or parsed.fragment:
        raise ValueError("Queries and fragments are not supported.")

    relative_text = unquote(parsed.path).lstrip("/").replace("/", os.sep)
    relative = Path(relative_text)
    if not relative_text or relative.is_absolute() or ".." in relative.parts:
        raise ValueError("The URL contains an unsafe folder path.")

    root = music_root.resolve()
    target = (root / relative).resolve()
    try:
        target.relative_to(root)
    except ValueError as error:
        raise ValueError("The requested folder is outside the music library.") from error

    if not target.is_dir():
        raise FileNotFoundError(f"Music folder does not exist: {target}")
    return target


def open_folder(url: str) -> None:
    require_windows()
    target = target_from_url(url, registered_music_root())
    os.startfile(target)  # type: ignore[attr-defined]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=f"Manage the {SCHEME}:// Windows URL protocol."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    register = subparsers.add_parser("register", help="Register the URL protocol.")
    register.add_argument(
        "--music-root",
        type=Path,
        default=DEFAULT_MUSIC_ROOT,
        help=f"Local music library root (default: {DEFAULT_MUSIC_ROOT}).",
    )

    subparsers.add_parser("remove", help="Remove the URL protocol registration.")
    open_parser = subparsers.add_parser("open", help="Handle a protocol URL.")
    open_parser.add_argument("url")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    try:
        if args.command == "register":
            register_protocol(args.music_root)
        elif args.command == "remove":
            remove_protocol()
        else:
            open_folder(args.url)
    except (OSError, ValueError) as error:
        raise SystemExit(str(error)) from error


if __name__ == "__main__":
    main()
