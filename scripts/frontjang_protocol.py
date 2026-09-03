#!/usr/bin/env python3
"""Register and handle the frontjang-gif:// Windows URL protocol."""

from __future__ import annotations

import argparse
from enum import Enum
import os
from pathlib import Path
import subprocess
import sys
from urllib.parse import parse_qs, urlparse


SCHEME = "frontjang-gif"
REGISTRY_PATH = rf"Software\Classes\{SCHEME}"


class RootType(str, Enum):
    MUSIC = "music"
    MOVIE = "movie"


class CommandType(str, Enum):
    OPEN = "open"
    PLAY = "play"


FOLDER_ROOTS = {
    RootType.MUSIC: Path(r"H:\frontjang-gif\Music"),
    RootType.MOVIE: Path(r"H:\frontjang-gif\Movie"),
}


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


def protocol_command() -> str:
    script = Path(__file__).resolve()
    return (
        subprocess.list2cmdline([str(pythonw_executable()), str(script), "open"])
        + ' "%1"'
    )


def protocol_is_registered() -> bool:
    winreg = registry_module()
    command_path = REGISTRY_PATH + r"\shell\open\command"
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, REGISTRY_PATH) as key:
            protocol_marker, _ = winreg.QueryValueEx(key, "URL Protocol")
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, command_path) as key:
            command, _ = winreg.QueryValueEx(key, None)
    except FileNotFoundError:
        return False
    return protocol_marker == "" and command == protocol_command()


def register_protocol() -> None:
    winreg = registry_module()
    command = protocol_command()

    with winreg.CreateKey(winreg.HKEY_CURRENT_USER, REGISTRY_PATH) as key:
        winreg.SetValueEx(key, None, 0, winreg.REG_SZ, f"URL:{SCHEME} Protocol")
        winreg.SetValueEx(key, "URL Protocol", 0, winreg.REG_SZ, "")

    command_path = REGISTRY_PATH + r"\shell\open\command"
    with winreg.CreateKey(winreg.HKEY_CURRENT_USER, command_path) as key:
        winreg.SetValueEx(key, None, 0, winreg.REG_SZ, command)

    print(f"Registered {SCHEME}://")


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


def request_from_url(url: str, folder_roots=None) -> tuple[CommandType, Path]:
    roots = FOLDER_ROOTS if folder_roots is None else folder_roots
    parsed = urlparse(url)
    if (
        parsed.scheme.lower() != SCHEME
        or parsed.netloc.lower() != "action"
        or parsed.path not in ("", "/")
        or parsed.fragment
    ):
        raise ValueError(
            f"Expected {SCHEME}://action?root=...&command=...&path=..."
        )

    parameters = parse_qs(parsed.query, keep_blank_values=True, strict_parsing=True)
    required = {"root", "command", "path"}
    if set(parameters) != required or any(
        len(values) != 1 for values in parameters.values()
    ):
        raise ValueError("The URL requires exactly one root, command, and path parameter.")

    try:
        root_type = RootType(parameters["root"][0].lower())
        command_type = CommandType(parameters["command"][0].lower())
    except ValueError as error:
        raise ValueError("The URL contains an unsupported root or command.") from error
    if root_type not in roots:
        raise ValueError(f"The {root_type.value} root is not configured.")

    relative_text = parameters["path"][0]
    if "\\" in relative_text or "\0" in relative_text:
        raise ValueError("The path must use forward slashes and contain no null bytes.")
    relative = Path(relative_text)
    if relative.is_absolute() or relative.drive or ".." in relative.parts:
        raise ValueError("The URL contains an unsafe folder path.")

    root = roots[root_type].resolve()
    target = (root / relative).resolve()
    try:
        target.relative_to(root)
    except ValueError as error:
        raise ValueError(
            f"The requested path is outside the {root_type.value} library."
        ) from error

    if not target.exists():
        raise FileNotFoundError(f"Path does not exist: {target}")
    if command_type is CommandType.PLAY and not target.is_file():
        raise ValueError("The play command requires a specific media file.")
    return command_type, target


def handle_url(url: str) -> None:
    require_windows()
    _, target = request_from_url(url)
    os.startfile(target)  # type: ignore[attr-defined]


def show_message(message: str, *, error: bool = False) -> None:
    require_windows()
    import ctypes

    icon = 0x10 if error else 0x40
    ctypes.windll.user32.MessageBoxW(0, message, f"{SCHEME} protocol", icon)


def ensure_protocol() -> None:
    already_registered = protocol_is_registered()
    if not already_registered:
        register_protocol()

    roots = "\n".join(f"{kind}: {path}" for kind, path in FOLDER_ROOTS.items())
    status = "already registered" if already_registered else "registered successfully"
    show_message(f"{SCHEME}:// is {status}.\n\n{roots}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=f"Manage the {SCHEME}:// Windows URL protocol."
    )
    subparsers = parser.add_subparsers(dest="command")

    subparsers.add_parser("register", help="Register the URL protocol.")

    subparsers.add_parser("remove", help="Remove the URL protocol registration.")
    open_parser = subparsers.add_parser("open", help="Handle a protocol URL.")
    open_parser.add_argument("url")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    try:
        if args.command is None:
            ensure_protocol()
        elif args.command == "register":
            register_protocol()
        elif args.command == "remove":
            remove_protocol()
        else:
            handle_url(args.url)
    except (OSError, ValueError) as error:
        if args.command in (None, "open") and sys.platform == "win32":
            show_message(str(error), error=True)
            return
        raise SystemExit(str(error)) from error


if __name__ == "__main__":
    main()
