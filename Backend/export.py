import os
from datetime import datetime

OUTPUT_FILE = "ProjectContext.txt"

# Include these file types (add/remove as you like)
INCLUDE_EXTENSIONS = {
    ".py", ".txt", ".md", ".json", ".yaml", ".yml", ".ini", ".toml", ".env"
}

# Skip junk / generated / big dirs
EXCLUDE_DIRS = {
    "__pycache__", ".git", ".venv", "venv", "env", ".idea", ".vscode", "node_modules", "uploads"
}

# Skip big/irrelevant files by name (optional)
EXCLUDE_FILES = {
    OUTPUT_FILE,  # don't re-include the output itself
}

def should_skip_dir(name: str) -> bool:
    return name in EXCLUDE_DIRS

def should_include_file(filename: str) -> bool:
    if filename in EXCLUDE_FILES:
        return False
    ext = os.path.splitext(filename)[1].lower()
    return ext in INCLUDE_EXTENSIONS or filename.lower() in {".env"}

with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
    out.write("FULL PROJECT EXPORT FOR AI ANALYSIS\n")
    out.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")

    for root, dirs, files in os.walk("."):
        # prune excluded dirs so os.walk doesn't enter them
        dirs[:] = [d for d in dirs if not should_skip_dir(d)]

        for file in sorted(files):
            if not should_include_file(file):
                continue

            filepath = os.path.join(root, file)
            norm_path = filepath.replace("\\", "/")

            out.write("\n\n" + ("/" * 64) + "\n")
            out.write(f" * FILE PATH: {norm_path}\n")
            out.write(("/" * 64) + "\n\n")

            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    out.write(f.read())
            except UnicodeDecodeError:
                out.write("[Skipped: non-UTF8/binary file]\n")
            except Exception as e:
                out.write(f"[Error reading file: {e}]\n")

print(f"✅ Exported project context to: {OUTPUT_FILE}")
