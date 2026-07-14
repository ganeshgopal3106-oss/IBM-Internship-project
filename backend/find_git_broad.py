import os
import sys

def find_git():
    search_dirs = [
        r"C:\Program Files",
        r"C:\Program Files (x86)",
    ]
    for search_dir in search_dirs:
        if not os.path.exists(search_dir):
            continue
        print(f"Searching in {search_dir}...")
        for root, dirs, files in os.walk(search_dir):
            # Prune some directories to speed up
            if any(p in root for p in ["Windows", "Microsoft", "Intel", "nvidia", "Common Files"]):
                continue
            if "git.exe" in files:
                full_path = os.path.join(root, "git.exe")
                print(f"FOUND: {full_path}")
                return full_path
    print("NOT FOUND")
    return None

if __name__ == "__main__":
    find_git()
