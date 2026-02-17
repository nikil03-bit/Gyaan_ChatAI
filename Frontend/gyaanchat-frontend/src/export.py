import os
from datetime import datetime

OUTPUT_FILE = "ProjectContext.txt"

# React/TS file types worth feeding to AI
INCLUDE_EXTENSIONS = {
    ".ts", ".tsx", ".js", ".jsx",
    ".css", ".scss", ".sass", ".less",
    ".json", ".md", ".env", ".txt"
}

# Common dirs to skip
EXCLUDE_DIRS = {
    "node_modules", "dist", "build", ".git",
    ".vscode", ".idea",
    "coverage", ".next", ".turbo"
}

# Skip big/binary assets by default (you can allow svg/png if you want)
EXCLUDE_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico",
    ".mp4", ".mov", ".zip", ".pdf", ".woff", ".woff2", ".ttf", ".eot"
}

# Focus on src + key root config files
ROOT_FILES_TO_INCLUDE = {
    "package.json", "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json",
    "vite.config.ts", "vite.config.js",
    "eslint.config.js", ".eslintrc", ".eslintrc.json",
    "README.md", ".env", ".env.local"
}

def should_skip_dir(name: str) -> bool:
    return name in EXCLUDE_DIRS

def should_skip_file(filename: str) -> bool:
    ext = os.path.splitext(filename)[1].lower()
    return ext in EXCLUDE_EXTENSIONS

def should_include(filename: str) -> bool:
    if filename in ROOT_FILES_TO_INCLUDE:
        return True
    ext = os.path.splitext(filename)[1].lower()
    if should_skip_file(filename):
        return False
    return ext in INCLUDE_EXTENSIONS or filename.lower().startswith(".env")

def write_file_block(out, rel_path: str, abs_path: str):
    out.write("\n\n" + ("/" * 64) + "\n")
    out.write(f" * FILE PATH: {rel_path.replace('\\', '/')}\n")
    out.write(("/" * 64) + "\n\n")
    try:
        with open(abs_path, "r", encoding="utf-8") as f:
            out.write(f.read())
    except UnicodeDecodeError:
        out.write("[Skipped: non-UTF8/binary file]\n")
    except Exception as e:
        out.write(f"[Error reading file: {e}]\n")

project_root = os.getcwd()
src_dir = os.path.join(project_root, "src")

with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
    out.write("FULL PROJECT EXPORT FOR AI ANALYSIS\n")
    out.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")

    # 1) Include selected root files first (helps AI a lot)
    for name in sorted(ROOT_FILES_TO_INCLUDE):
        path = os.path.join(project_root, name)
        if os.path.isfile(path) and should_include(name):
            write_file_block(out, f"./{name}", path)

    # 2) Export src/
    if not os.path.isdir(src_dir):
        out.write("\n[ERROR] src/ folder not found in this directory.\n")
    else:
        for root, dirs, files in os.walk(src_dir):
            dirs[:] = [d for d in dirs if not should_skip_dir(d)]
            for file in sorted(files):
                if not should_include(file):
                    continue
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, project_root)
                write_file_block(out, f"./{rel_path}", abs_path)

print(f"✅ Exported React context to: {OUTPUT_FILE}")
