import os
import sys

def find_gh():
    common_paths = [
        r"C:\Program Files\GitHub CLI\gh.exe",
        os.path.expandvars(r"%LocalAppData%\Programs\GitHub CLI\gh.exe"),
    ]
    for path in common_paths:
        if os.path.exists(path):
            print(f"FOUND: {path}")
            return path
            
    # Search system PATH env variable
    for path_dir in os.environ.get("PATH", "").split(os.path.pathsep):
        gh_path = os.path.join(path_dir, "gh.exe")
        if os.path.exists(gh_path):
            print(f"FOUND in PATH: {gh_path}")
            return gh_path
            
    print("NOT FOUND")
    return None

if __name__ == "__main__":
    find_gh()
